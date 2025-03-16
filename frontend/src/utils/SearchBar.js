import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Autocomplete, InputAdornment, MenuItem, Typography,
  Popover, IconButton, Stack, Button, ToggleButtonGroup, ToggleButton, useTheme} from '@mui/material';
import { LocationOn as LocationOnIcon, FilterAlt as FilterAltIcon } from '@mui/icons-material';
import { debounce } from '@mui/material/utils';
import propertyType from './propertyType';
import stockPhoto from '../images/stockPhoto.jpg';
import 'dialog-polyfill/dist/dialog-polyfill.css';
import dialogPolyfill from 'dialog-polyfill';
  
// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Sets up dialog polyfill for browsers that don't support the HTML dialog element
 * This ensures dialogs work across all browsers
 */
const setupDialogPolyfill = () => {
  if (typeof HTMLDialogElement === 'undefined') {
    // Create a placeholder class if HTMLDialogElement is not supported
    window.HTMLDialogElement = class HTMLDialogElement extends HTMLElement {};
    // Find and register all dialog elements on the page
    const dialogs = document.getElementsByTagName('dialog');
    Array.from(dialogs).forEach(dialog => {
      dialogPolyfill.registerDialog(dialog);
    });
  }
};

/**
 * SearchBar component for property search functionality
 */
const SearchBar = ({ soldStatus = 'false', title }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  // State for Autocomplete component
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  
  // State for filter popover
  const [anchorEl, setAnchorEl] = useState(null);
  
  // State for listing type (sale or rental)
  const [listingType, setListingType] = useState('sale');
  
  // Main search parameters state
  const [searchParams, setSearchParams] = useState({
    location: '', 
    guidePrice: '', 
    bedrooms: '', 
    bathrooms: '', 
    sort: '', 
    propertyType: '', 
    listingType: 'sale',
    sold: soldStatus,
    currentDate: new Date().toISOString() 
  });

  // Refs to track script loading and Google service
  const loaded = useRef(false);
  const autocompleteService = useRef(null);

  // Update sold status in search params when prop changes
  useEffect(() => {
    setSearchParams(prev => ({
      ...prev,
      sold: soldStatus
    }));
  }, [soldStatus]);

  // Load Google Maps script on component mount (client-side only)
  useEffect(() => {
    if (!loaded.current && typeof window !== 'undefined') {
      loadGoogleMapsScript();
      loaded.current = true;
    }
  }, []);

  /**
   * Loads Google Maps API script with places library
   * Sets up dialog polyfill before loading
   */
  const loadGoogleMapsScript = () => {
    if (!document.querySelector('#google-maps')) {
      // Setup polyfill before loading Google Maps
      setupDialogPolyfill();
      
      // Create and append script element
      const script = document.createElement('script');
      script.id = 'google-maps';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      document.head.appendChild(script);
    }
  };

  /**
   * Debounced function to fetch autocomplete predictions for locations
   * Filters results to include only relevant location types in Ireland
   */
  const fetchAutocomplete = useMemo(
    () =>
      debounce((request, callback) => {
        autocompleteService.current?.getPlacePredictions(
          {
            ...request,
            types: ['geocode'], // Limit to geographic locations
            componentRestrictions: { country: 'IE' }, // Limit to Ireland
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              // Filter predictions to include only relevant location types
              const filteredPredictions = predictions.filter(
                (prediction) =>
                  prediction.types.includes('locality') ||
                  prediction.types.includes('administrative_area_level_2') ||
                  prediction.types.includes('administrative_area_level_1') ||
                  prediction.types.includes('postal_town') ||
                  prediction.types.includes('sublocality')
              );
              callback(filteredPredictions);
            } else {
              callback([]);
            }
          }
        );
      }, 400), // 400ms delay to avoid too many API calls
    []
  );
  
  // Effect to fetch location predictions when input changes
  useEffect(() => {
    let active = true;

    // Initialize Google Places service if available
    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    
    // Clear options if input is empty
    if (inputValue === '') {
      setOptions([]);
      return;
    }

    // Fetch predictions for current input
    fetchAutocomplete({ input: inputValue }, (results) => {
      if (active) {
        setOptions(results || []);
      }
    });

    // Clean up function to prevent state updates if component unmounts
    return () => {
      active = false;
    };
  }, [inputValue, fetchAutocomplete]);

  /**
   * Updates search parameters when form fields change
   */
  const handleSearchParamChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({ ...prevParams, [name]: value }));
  };

  /**
   * Updates listing type (sale/rental) when toggle changes
   */
  const handleListingTypeToggle = (event, newListingType) => {
    if (newListingType !== null) {
      setListingType(newListingType);
      setSearchParams(prevParams => ({
        ...prevParams,
        listingType: newListingType
      }));
    }
  };

  /**
   * Handles search form submission
   * Processes search parameters and navigates to results page
   */
  const submitSearch = (e) => {
    e.preventDefault();
    const processedParams = { ...searchParams };
  
    // Process location format for better search results
    if (processedParams.location) {
      // Remove ", Ireland" suffix if present
      processedParams.location = processedParams.location.replace(/, Ireland$/, '');
      const locationParts = processedParams.location.split(/\s+/);
      // Add "County" prefix for single-word locations that don't already have it
      if (locationParts.length === 1 && !processedParams.location.toLowerCase().includes('county')) {
        processedParams.location = `County ${processedParams.location}`;
      }
    }
    
    // Add filter for future listings only if not searching sold properties
    if (soldStatus === 'false') {
      processedParams.filterFutureOnly = 'true';
    }
    
    // Remove empty parameters
    const filteredParams = Object.fromEntries(
      Object.entries(processedParams).filter(([_, v]) => v)
    );
    
    // Convert params to URL query string
    const searchQuery = new URLSearchParams(filteredParams).toString();
  
    // Navigate to search results page with query
    navigate(`/search-results?${searchQuery}`);
  };

  // Popover handlers
  const handlePopoverClick = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '600px',
        display: 'flex',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Main content wrapper */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
        }}
      >
        {/* Left side - Image with gradient overlay */}
        <Box
          sx={{
            position: 'relative',
            width: '60%',
            height: '100%',
          }}
        >
          {/* Background image */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${stockPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(0, 0, 0, 0.4)'
                  : 'rgba(0, 0, 0, 0.2)',
              }
            }}
          />
          
          {/* Gradient overlay - adapts to dark/light mode */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(
                    90deg,
                    rgba(0,0,0,0.4) 0%,
                    rgba(0,0,0,0.2) 40%,
                    rgba(18,18,18,0.3) 80%,
                    ${theme.palette.background.default} 100%
                  )`
                : `linear-gradient(
                    90deg,
                    rgba(0,0,0,0.4) 0%,
                    rgba(0,0,0,0.2) 40%,
                    rgba(255,255,255,0.3) 80%,
                    ${theme.palette.background.default} 100%
                  )`,
              zIndex: 1,
            }}
          />
        </Box>

        {/* Right side - Search form */}
        <Box
          sx={{
            width: '40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            position: 'relative',
            zIndex: 2,
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '500px' }}>
            {/* Page title - changes based on soldStatus */}
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                mb: 4, 
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              {title || (soldStatus === 'false' ? 'Find Your New Property' : 'Browse Sold Properties')}
            </Typography>
            
            {/* Listing type toggle (sale/rental) */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <ToggleButtonGroup
                color="secondary"
                value={listingType}
                exclusive
                onChange={handleListingTypeToggle}
                aria-label="listing type"
              >
                <ToggleButton value="sale">For Sale</ToggleButton>
                <ToggleButton value="rental">For Rent</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {/* Location search and filter button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              {/* Location autocomplete search input */}
              <Autocomplete
                sx={{ flex: 1 }}
                options={options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={value}
                freeSolo
                noOptionsText="Type to search or enter custom location"
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option?.description || '';
                }}
                onChange={(event, newValue) => {
                  setValue(newValue);
                  const locationValue = typeof newValue === 'string' 
                    ? newValue 
                    : newValue?.description || '';
                  setSearchParams(prev => ({ ...prev, location: locationValue }));
                }}
                onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
                  setSearchParams(prev => ({ ...prev, location: newInputValue }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search by location"
                    color="secondary"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <LocationOnIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    {option.description}
                  </li>
                )}
              />
              
              {/* Filter button */}
              <IconButton 
                aria-describedby="filter-popover" 
                onClick={handlePopoverClick} 
                sx={{ 
                  backgroundColor: 'secondary.main', 
                  color: 'white', 
                  p: 2, 
                  '&:hover': { 
                    backgroundColor: 'primary.dark' 
                  } 
                }}
              >
                <FilterAltIcon />
              </IconButton>
            </Box>

            {/* Search button */}
            <Button 
              variant="contained" 
              onClick={submitSearch} 
              color="secondary"
              fullWidth
              sx={{ 
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Search 
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filter popover */}
      <Popover
        id="filter-popover"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ 
          sx: { 
            p: 3, 
            width: 350,
            bgcolor: 'background.default',
            color: 'text.primary'
          } 
        }}
      >
{/* Popover header */}
<Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          Advanced Filters
        </Typography>
        
        {/* Stack of filter form controls with consistent spacing */}
        <Stack spacing={2}>
          {/* Maximum price filter with Euro symbol */}
          <TextField
            fullWidth
            label="Maximum Guide Price"
            color="secondary"
            type="number"
            name="guidePrice"
            value={searchParams.guidePrice}
            onChange={handleSearchParamChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
          />

          {/* Bedrooms dropdown selection */}
          <TextField
            fullWidth
            select
            label="Bedrooms"
            name="bedrooms"
            color="secondary"
            value={searchParams.bedrooms}
            onChange={handleSearchParamChange}
          >
            <MenuItem value="">Any</MenuItem>
            {/* Generate options for 1-5 bedrooms */}
            {[1, 2, 3, 4, 5].map((num) => (
              <MenuItem key={num} value={num}>{num}</MenuItem>
            ))}
          </TextField>

          {/* Bathrooms dropdown selection */}
          <TextField
            fullWidth
            select
            label="Bathrooms"
            name="bathrooms"
            color="secondary"
            value={searchParams.bathrooms}
            onChange={handleSearchParamChange}
          >
            <MenuItem value="">Any</MenuItem>
            {/* Generate options for 1-5 bathrooms */}
            {[1, 2, 3, 4, 5].map((num) => (
              <MenuItem key={num} value={num}>{num}</MenuItem>
            ))}
          </TextField>

          {/* Property type dropdown from imported property types */}
          <TextField
            fullWidth
            select
            label="Property Type"
            name="propertyType"
            color="secondary"
            value={searchParams.propertyType}
            onChange={handleSearchParamChange}
          >
            <MenuItem value="">Any Type</MenuItem>
            {/* Map through imported property types array */}
            {propertyType.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Sort options dropdown */}
          <TextField
            fullWidth
            select
            label="Sort By"
            name="sort"
            color="secondary"
            value={searchParams.sort}
            onChange={handleSearchParamChange}
          >
            <MenuItem value="priceLowHigh">Guide Price: Low to High</MenuItem>
            <MenuItem value="priceHighLow">Guide Price: High to Low</MenuItem>
            <MenuItem value="currentBidLowHigh">Current Bid: Low to High</MenuItem>
            <MenuItem value="currentBidHighLow">Current Bid: High to Low</MenuItem>
          </TextField>

          {/* Apply filters button - closes popover when clicked */}
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handlePopoverClose} 
            fullWidth
          >
            Apply Filters
          </Button>
        </Stack>
      </Popover>
    </Box>
  );
};

export default SearchBar;