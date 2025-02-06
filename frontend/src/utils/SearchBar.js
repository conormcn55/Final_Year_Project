import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Autocomplete, InputAdornment, MenuItem, Typography,
  Popover, IconButton, Stack, Paper, Button, Grid, Container, 
  ToggleButtonGroup, ToggleButton,useTheme
} from '@mui/material';
import { LocationOn as LocationOnIcon, FilterAlt as FilterAltIcon } from '@mui/icons-material';
import { debounce } from '@mui/material/utils';
import propertyType from './propertyType';
import stockPhoto from '../images/stockPhoto.jpg';
  
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const SearchBar = ({ soldStatus = 'false', title }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [listingType, setListingType] = useState('sale');
  const [searchParams, setSearchParams] = useState({
    location: '', 
    guidePrice: '', 
    bedrooms: '', 
    bathrooms: '', 
    sort: '', 
    propertyType: '', 
    listingType: 'sale',
    sold: soldStatus, 
  });


  const loaded = useRef(false);
  const autocompleteService = useRef(null);

  useEffect(() => {
    // Update soldStatus when prop changes
    setSearchParams(prev => ({
      ...prev,
      sold: soldStatus
    }));
  }, [soldStatus]);
  useEffect(() => {
    if (!loaded.current && typeof window !== 'undefined') {
      loadGoogleMapsScript();
      loaded.current = true;
    }
  }, []);

  const loadGoogleMapsScript = () => {
    if (!document.querySelector('#google-maps')) {
      const script = document.createElement('script');
      script.id = 'google-maps';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    }
  };

  const fetchAutocomplete = useMemo(
    () =>
      debounce((request, callback) => {
        autocompleteService.current?.getPlacePredictions(
          {
            ...request,
            types: ['geocode'],
            componentRestrictions: { country: 'IE' },
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
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
      }, 400),
    []
  );
  
  useEffect(() => {
    let active = true;

    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    if (inputValue === '') {
      setOptions([]);
      return;
    }

    fetchAutocomplete({ input: inputValue }, (results) => {
      if (active) {
        setOptions(results || []);
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, fetchAutocomplete]);

  const handleSearchParamChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({ ...prevParams, [name]: value }));
  };

  const handleListingTypeToggle = (event, newListingType) => {
    if (newListingType !== null) {
      setListingType(newListingType);
      setSearchParams(prevParams => ({
        ...prevParams,
        listingType: newListingType
      }));
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const processedParams = { ...searchParams };
  
    if (processedParams.location) {
      processedParams.location = processedParams.location.replace(/, Ireland$/, '');
      const locationParts = processedParams.location.split(/\s+/);
      if (locationParts.length === 1 && !processedParams.location.toLowerCase().includes('county')) {
        processedParams.location = `County ${processedParams.location}`;
      }
    }
    const filteredParams = Object.fromEntries(
      Object.entries(processedParams).filter(([_, v]) => v)
    );
    const searchQuery = new URLSearchParams(filteredParams).toString();
  
    navigate(`/search-results?${searchQuery}`);
  };
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
        <Box
          sx={{
            position: 'relative',
            width: '60%',
            height: '100%',
          }}
        >
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          Advanced Filters
        </Typography>
        
        <Stack spacing={2}>
          {/* Guide Price Filter */}
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

          {/* Bedrooms Filter */}
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
            {[1, 2, 3, 4, 5].map((num) => (
              <MenuItem key={num} value={num}>
                {num} 
              </MenuItem>
            ))}
          </TextField>

          {/* Bathrooms Filter */}
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
            {[1, 2, 3, 4, 5].map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </TextField>
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
          {propertyType.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>

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