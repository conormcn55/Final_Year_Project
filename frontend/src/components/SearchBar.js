import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Autocomplete, InputAdornment, MenuItem, Typography,
  Popover, IconButton, Stack, Paper, Button
} from '@mui/material';
import { LocationOn as LocationOnIcon, FilterAlt as FilterAltIcon } from '@mui/icons-material';
import { debounce } from '@mui/material/utils';
import propertyType from '../utils/propertyType';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB0rv1dRFVC0etIzJ8JJ3S1u51Hc2i_DFY';

export default function SearchBar() {
  const navigate = useNavigate();
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchParams, setSearchParams] = useState({
    location: '', guidePrice: '', bedrooms: '', bathrooms: '', sort: '', propertyType: ''
  });

  const loaded = useRef(false);
  const autocompleteService = useRef(null);

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
          { ...request, componentRestrictions: { country: 'IE' } },
          callback
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

  const submitSearch = (e) => {
    e.preventDefault();
    const processedParams = { ...searchParams };
    
    if (processedParams.location) {
      processedParams.location = processedParams.location.replace(/, Ireland$/, '');
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
    <Box sx={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: '600px', width: '100%' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
          Property Search
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              // Handle both string values and Google Places predictions
              if (typeof option === 'string') {
                return option;
              }
              return option?.description || '';
            }}
            onChange={(event, newValue) => {
              setValue(newValue);
              // Handle both string values and Google Places predictions
              const locationValue = typeof newValue === 'string' 
                ? newValue 
                : newValue?.description || '';
              setSearchParams((prevParams) => ({ 
                ...prevParams, 
                location: locationValue 
              }));
            }}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
              // Update searchParams with raw input when typing
              setSearchParams((prevParams) => ({ 
                ...prevParams, 
                location: newInputValue 
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search by location"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                {option.description}
              </li>
            )}
          />
          
          <IconButton 
            aria-describedby="filter-popover" 
            onClick={handlePopoverClick} 
            sx={{ backgroundColor: 'primary.main', color: 'white', p: 2, '&:hover': { backgroundColor: 'primary.dark' } }}
          >
            <FilterAltIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={submitSearch}>Search</Button>
        </Box>
      </Paper>

      <Popover
        id="filter-popover"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 3, width: 300 } }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Filters</Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            name="guidePrice"
            label="Max Guide Price"
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
            type="number"
            onChange={handleSearchParamChange}
          />

          <TextField
            fullWidth
            select
            name="propertyType"
            label="Property Type"
            variant="outlined"
            onChange={handleSearchParamChange}
          >
            {propertyType.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            name="bedrooms"
            label="Bedrooms"
            variant="outlined"
            type="number"
            onChange={handleSearchParamChange}
          />

          <TextField
            fullWidth
            name="bathrooms"
            label="Bathrooms"
            variant="outlined"
            type="number"
            onChange={handleSearchParamChange}
          />

          <TextField
            fullWidth
            select
            name="sort"
            label="Sort By"
            variant="outlined"
            onChange={handleSearchParamChange}
          >
            <MenuItem value="price_asc">Price: Low to High</MenuItem>
            <MenuItem value="price_desc">Price: High to Low</MenuItem>
            <MenuItem value="date_desc">Newest First</MenuItem>
            <MenuItem value="date_asc">Oldest First</MenuItem>
          </TextField>
        </Stack>
      </Popover>
    </Box>
  );
}