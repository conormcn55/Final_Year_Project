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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/property/endingsoon`);
        console.log('API Response:', response.data);

        if (response.data && response.data.data) {
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

  const handleLocationSearch = (location, e) => {
    e.stopPropagation();
    navigate(`/search-results?location=${location}`);
  };

  const handleCardClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" maxWidth={600} mx="auto">
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            variant="rectangular"
            width={600}
            height={520}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2, maxWidth: 600, mx: "auto" }}>
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
    <Box margin={2} maxWidth={800} mx="auto">
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
          height: 600,
          maxWidth: 600,
          mx: 'auto'
        }}
        navButtonsProps={{
          style: {
            backgroundColor: 'rgba(255,255,255,0.8)',
            color: '#000',
            borderRadius: '50%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            position: 'absolute',
            transform: 'translateX(-50px)',  
          }
        }}
        NavButtonsWrapperProps={{   
          style: {
            position: 'absolute',
            padding: '0 50px',
            height: '100%'
          }
        }}
      >
        {properties.map((property) => (
          <Box
            key={property._id}
            sx={{
              width: 600,
              height: 520,
              py: 2,
              px: 1,
              cursor: 'pointer'
            }}
            onClick={() => handleCardClick(property._id)}
          >
            <PropertyCard
              property={property}
              onLocationClick={(location, e) => handleLocationSearch(location, e)}
            />
          </Box>
        ))}
      </Carousel>
    </Box>
  );
};

export default EndingSoon;