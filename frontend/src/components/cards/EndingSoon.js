import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Skeleton,
  Alert
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import PropertyCard from '../../utils/PropertyCard';

const EndingSoon = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEndingSoon = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/property/endingsoon');
        console.log('API Response:', response.data);
        
        // Check if response.data exists and contains the data array
        if (response.data && response.data.data) {
          // Filter valid properties from the data array
          const validProperties = response.data.data.filter(prop => prop && prop._id);
          setProperties(validProperties);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message || 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };
  
    fetchEndingSoon();
  }, []);

  const handleLocationSearch = (location) => {
    navigate(`/search-results?location=${location}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            variant="rectangular"
            width={345}
            height={400}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!properties.length) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        p={4}
      >
        <Typography variant="h6">
          No properties ending soon found
        </Typography>
      </Box>
    );
  }

  return (
    <Box margin={2}>
      <Typography
        color='secondary'
        variant="h4"
        gutterBottom
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          mb: 4
        }}
      >
        Properties Ending Soon
      </Typography>
      <Carousel
        animation="slide"
        indicators={true}
        navButtonsAlwaysVisible={true}
        autoPlay={false}
        sx={{
          minHeight: '500px'
        }}
        navButtonsProps={{
          style: {
            backgroundColor: 'rgba(255,255,255,0.8)',
            color: '#000',
            borderRadius: '50%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }
        }}
      >
        {properties.map((property) => (
          <Box
            key={property._id}
            display="flex"
            justifyContent="center"
            sx={{ 
              py: 2,
              px: 1
            }}
          >
            <PropertyCard
              property={property}
              onLocationClick={handleLocationSearch}
            />
          </Box>
        ))}
      </Carousel>
    </Box>
  );
};

export default EndingSoon;