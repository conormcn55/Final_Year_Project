import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import PropertyCard from '../utils/PropertyCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const params = Object.fromEntries(searchParams.entries());
        const { data } = await axios.get('http://localhost:3001/api/property/search', { params });
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

  if (loading) return <CircularProgress />;

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Search Results
      </Typography>
      <Grid container spacing={3}>
        {results.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property._id}>
            <Box onClick={() => navigate(`/property/${property._id}`)}>
              <PropertyCard 
                property={property} 
                onFavoriteToggle={(propertyId, isFavorite) => {
                }} 
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SearchResults;