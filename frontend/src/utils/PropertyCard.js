import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  BedOutlined,
  BathtubOutlined,
  HomeOutlined,
  SquareFoot,
  CalendarToday
} from '@mui/icons-material';
import useUserData from '../utils/useUserData';

const formatAddress = (address) => {
  if (!address) return 'Address Not Available';

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.addressLine3,
    address.addressTown,
    address.addressCounty
  ].filter(part => part && part.length > 0);
  
  return parts.length > 0 ? parts.join(', ') : 'Address Not Available';
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

const PropertyCard = ({ 
  property, 
  onFavoriteToggle, 
  enableFavorite = true 
}) => {
  const { _id: userId } = useUserData();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/favourites/${userId}`);
        const isFavourited = response.data.favourites.some(
          fav => fav.property === property._id
        );
        setIsFavorite(isFavourited);
      } catch (err) {
        console.error('Error checking favorites:', err);
      }
    };

    if (enableFavorite && userId) {
      checkFavoriteStatus();
    }
  }, [property._id, userId, enableFavorite]);

  const toggleFavorite = async (e) => {
    if (!enableFavorite || !userId) return;

    e.stopPropagation();
    try {
      if (isFavorite) {
        await axios.delete('http://localhost:3001/api/favourites/unfavourite', { 
          data: { 
            user: userId, 
            property: property._id 
          } 
        });
      } else {
        await axios.post('http://localhost:3001/api/favourites/', { 
          user: userId, 
          property: property._id 
        });
      }
      setIsFavorite(!isFavorite);
      onFavoriteToggle?.(property._id, !isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const {
    address,
    bathrooms,
    bedrooms,
    currentBid,
    guidePrice,
    images,
    propertyType,
    saleDate,
    sold,
    sqdMeters,
  } = property;

  const { date, time } = formatDateTime(saleDate);

  return (
    <Card sx={{ 
      width: '100%',
      minHeight: 520,
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
        title={
          <Typography variant="h6" sx={{ 
            minHeight: 48, 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3
          }}>
            {formatAddress(address)}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ 
        flexGrow: 1, 
        pt: 0,
        pb: '8px !important',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
             Current Bid: €{currentBid.amount?.toLocaleString()}
            </Typography>
            
            <Typography variant="body2" color="text.primary">
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

          <Grid container spacing={2}>
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
                <Typography 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {propertyType}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Divider />
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            justifyContent: 'space-between',
            mt: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="text.primary" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {date}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {time}
                </Typography>
              </Box>
            </Box>
            {enableFavorite && (
              <IconButton 
                size="small" 
                aria-label="add to favorites" 
                onClick={toggleFavorite}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;