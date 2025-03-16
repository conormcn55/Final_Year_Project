import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Map as MapIcon, ViewList } from '@mui/icons-material';
import PropertyCard from '../utils/PropertyCard';
import PropertyMap from './PropertyMap';

/**
 * SearchResults component to display property search results
 * Can display results in either list view or map view
 */
const SearchResults = () => {
  const [searchParams] = useSearchParams();  // Get search parameters from URL
  const [results, setResults] = useState([]);  // State for search results data
  const [loading, setLoading] = useState(true);  // Loading state while fetching results
  const [error, setError] = useState(null);  // Error state if fetch fails
  const [viewMode, setViewMode] = useState('list');  // View mode state (list or map)
  const navigate = useNavigate();

  /**
   * Fetch search results when search parameters change
   */
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // Debug log for API URL
        console.log('API URL:', process.env.REACT_APP_API_URL);
        // Convert URL search parameters to object
        const params = Object.fromEntries(searchParams.entries());
        // Make API request with search parameters
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/property/search`, { params });
        // Update results state with fetched data
        setResults(data);
        // Clear any previous errors
        setError(null);
      } catch (err) {
        // Set error message if fetch fails
        setError('No Results Found');
        console.error('Error fetching results:', err);
      } finally {
        // Set loading to false when fetch completes (success or failure)
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]); // Re-fetch when search parameters change

  /**
   * Handle toggle between list and map view modes
   */
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  // Show loading spinner while fetching results
  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );

  // Show error message if fetch failed
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with title and view mode toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Search Results
        </Typography>
        {/* Toggle button group for switching between list and map views */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
        >
          <ToggleButton value="list" aria-label="list view">
            <ViewList />
          </ToggleButton>
          <ToggleButton value="map" aria-label="map view">
            <MapIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Conditional rendering based on view mode */}
      {viewMode === 'list' ? (
        // List view: Grid of property cards
        <Grid container spacing={3}>
          {results.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              {/* Navigate to property details page when card is clicked */}
              <Box onClick={() => navigate(`/property/${property._id}`)} sx={{ cursor: 'pointer' }}>
                <PropertyCard
                  property={property}
                  onFavoriteToggle={(propertyId, isFavorite) => {
                    // Handle favorite toggle (currently empty)
                    // This would typically update favorite status in the backend
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Map view: Display properties on a map
        <PropertyMap properties={results} />
      )}
    </Box>
  );
};

export default SearchResults;