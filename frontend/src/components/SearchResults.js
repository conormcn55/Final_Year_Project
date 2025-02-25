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

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        console.log('API URL:', process.env.REACT_APP_API_URL);
        const params = Object.fromEntries(searchParams.entries());
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/property/search`, { params });
        setResults(data);
        setError(null);
      } catch (err) {
        setError('No Results Found');
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Search Results
        </Typography>
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

      {viewMode === 'list' ? (
        <Grid container spacing={3}>
          {results.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              <Box onClick={() => navigate(`/property/${property._id}`)} sx={{ cursor: 'pointer' }}>
                <PropertyCard
                  property={property}
                  onFavoriteToggle={(propertyId, isFavorite) => {
                    // Handle favorite toggle
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <PropertyMap properties={results} />
      )}
    </Box>
  );
};

export default SearchResults;