import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import MyListingCard from '../utils/MyListingCard';
import useUserData from '../utils/useUserData';

const MyListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { _id: userId } = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/property/lister/${userId}`);
        setProperties(response.data || []);
        setError(null);
      } catch (err) {
        setError('No Listings Found');
        console.error('Error fetching listings:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchListings();
    }
  }, [userId]);

  const handleCardClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleDeleteProperty = (deletedPropertyId) => {
    setProperties(prevProperties => 
      prevProperties.filter(property => property._id !== deletedPropertyId)
    );
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

  if (!properties?.length) {
    return (
      <Box p={3}>
        <Typography variant="h6">You haven't listed any properties yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Listings
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
                <MyListingCard 
                property={property}
                onDelete={handleDeleteProperty}
                />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyListings;