import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Favorite,
  BedOutlined,
  BathtubOutlined,
  HomeOutlined,
  SquareFoot,
  CalendarToday
} from '@mui/icons-material';

const formatAddress = (address) => {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.addressLine3,
    address.addressTown,
    address.addressCounty
  ].filter(part => part && part.length > 0);
  
  return parts.join(', ');
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-IE', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();
    const handleCardClick = () => navigate(`/property/${property._id}`);
    const {
      address,
      bathrooms,
      bedrooms,
      currentBid,
      guidePrice,
      images,
      listingType,
      propertyType,
      saleDate,
      sold,
      sqdMeters,
      addressEircode
    } = property;
  
    const { date, time } = formatDateTime(saleDate);
  
    return (
      <Card sx={{ 
        maxWidth: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}>
        <CardMedia
          component="img"
          height="200"
          image={images?.[0]?.url || "/api/placeholder/400/400"}
          alt={formatAddress(address)}
          sx={{ objectFit: 'cover' }}
        />
        <CardHeader
          title={formatAddress(address)}
          subheader={
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {propertyType} - {listingType.charAt(0).toUpperCase() + listingType.slice(1)}
              </Typography>
            </Box>
          }
          sx={{ pb: 1 }}
        />
        
        <CardContent sx={{ flexGrow: 1, pt: 0, pb: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
             Current Bid: €{currentBid?.toLocaleString()}
            </Typography>
            
              <Typography variant="body2" color="text.secondary">
              Guide Price: €{guidePrice?.toLocaleString()} 
              </Typography>
            {sold && (
              <Chip 
                label="SOLD" 
                color="error" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>
  
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BedOutlined />
                <Typography>{bedrooms} beds</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BathtubOutlined />
                <Typography>{bathrooms} baths</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SquareFoot />
                <Typography>{sqdMeters}m²</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeOutlined />
                <Typography>{propertyType}</Typography>
              </Box>
            </Grid>
          </Grid>
  
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="primary" />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {time}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" aria-label="add to favorites">
              <Favorite />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };
  

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
                <PropertyCard property={property} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  export default SearchResults;