import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import PropertyCard from '../utils/PropertyCard';
import useUserData from '../utils/useUserData';

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { _id: userId } = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:3001/api/favourites/${userId}`);
        const propertyIds = data.favourites.map(fav => fav.property);

        if (propertyIds.length) {
          const response = await axios.post('http://localhost:3001/api/property/ids', { ids: propertyIds });
          setProperties(response.data.properties);
        }
        setError(null);
      } catch (err) {
        setError('Error fetching favorites');
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const handleCardClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={3}>
      <Typography color="error">{error}</Typography>
    </Box>
  );

  if (!properties.length) {
    return (
      <Box p={3}>
        <Typography variant="h6">You have no favorite properties yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Favorites
      </Typography>
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property._id}>
            <Box
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
              onClick={() => handleCardClick(property._id)}
            >
              <PropertyCard property={property} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FavouritesPage;