import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Skeleton,
} from '@mui/material';

import Carousel from 'react-material-ui-carousel';
import PropertyCard from '../../utils/PropertyCard'

const RecentlyListed = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentlyListed = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/property/recent');
        const validProperties = response.data.filter(prop => prop && prop._id);
        setProperties(validProperties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyListed();
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
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%" 
        color="error.main"
      >
        <Typography>Failed to load properties: {error}</Typography>
      </Box>
    );
  }

  if (!properties.length) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
      >
        <Typography variant="h6">
          No recently listed properties found
        </Typography>
      </Box>
    );
  }

  return (
    <Box margin={2}>
      <Typography 
        variant="h4" 
        color='secondary'
        gutterBottom 
        sx={{ 
          textAlign: 'center', 
          fontWeight: 'bold',
          mb: 4 
        }}
      >
        Recently Listed Properties
      </Typography>
      <Carousel
        animation="slide"
        indicators={false}
        navButtonsAlwaysVisible={true}
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

export default RecentlyListed;