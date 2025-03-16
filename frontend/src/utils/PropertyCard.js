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

//Function to format the address from address components
const formatAddress = (address) => {
  if (!address) return 'Address Not Available';

  // Extract all address parts and filter out empty values
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.addressLine3,
    address.addressTown,
    address.addressCounty
  ].filter(part => part && part.length > 0);
  
  // Join the parts with commas or return default text if empty
  return parts.length > 0 ? parts.join(', ') : 'Address Not Available';
};

// Function to format date and time from ISO date string
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return {
    // Format the date part (e.g., "Monday, January 1, 2025")
    date: date.toLocaleDateString('en-IE', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    // Format the time part (e.g., "14:30")
    time: date.toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

// PropertyCard component to display property information
const PropertyCard = ({ 
  property, 
  onFavoriteToggle, 
  enableFavorite = true 
}) => {
  const { _id: userId } = useUserData();  // Get the current user ID from custom hook
  const [isFavorite, setIsFavorite] = useState(false);  // State to track if property is in user's favorites
  // Effect to check if property is in user's favorites 
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // Get user's favorites from API
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/favourites/${userId}`);
        // Check if this property is in the favorites list
        const isFavourited = response.data.favourites.some(
          fav => fav.property === property._id
        );
        setIsFavorite(isFavourited);
      } catch (err) {
        console.error('Error checking favorites:', err);
      }
    };

    // Only check favorites if enabled and user is logged in
    if (enableFavorite && userId) {
      checkFavoriteStatus();
    }
  }, [property._id, userId, enableFavorite]);

  // Handler to toggle favorite status
  const toggleFavorite = async (e) => {
    if (!enableFavorite || !userId) return;

    // Prevent event bubbling to parent elements
    e.stopPropagation();
    try {
      if (isFavorite) {
        // Remove from favorites if already favorited
        await axios.delete(`${process.env.REACT_APP_API_URL}/favourites/unfavourite`, { 
          data: { 
            user: userId, 
            property: property._id 
          } 
        });
      } else {
        // Add to favorites if not already favorited
        await axios.post(`${process.env.REACT_APP_API_URL}/favourites/`, { 
          user: userId, 
          property: property._id 
        });
      }
      // Update local state
      setIsFavorite(!isFavorite);
      // Call callback function if provided
      onFavoriteToggle?.(property._id, !isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  // Destructure property data for easier access
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

  // Format the sale date and time
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
      {/* Property image */}
      <CardMedia
        component="img"
        height="200"
        image={images?.[0]?.url || "/api/placeholder/400/400"}
        alt={formatAddress(address)}
        sx={{ objectFit: 'cover' }}
      />
      {/* Property address header */}
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
      
      {/* Property details content */}
      <CardContent sx={{ 
        flexGrow: 1, 
        pt: 0,
        pb: '8px !important',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Box>
          {/* Price information section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
             Current Bid: €{currentBid.amount?.toLocaleString()}
            </Typography>
            
            <Typography variant="body2" color="text.primary">
              Guide Price: €{guidePrice?.toLocaleString()} 
            </Typography>
            {/* Show SOLD chip if property is sold */}
            {sold && (
              <Chip 
                label="SOLD" 
                color="error" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>

          {/* Property features grid */}
          <Grid container spacing={2}>
            {/* Bedrooms */}
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BedOutlined />
                <Typography>{bedrooms} beds</Typography>
              </Box>
            </Grid>
            {/* Bathrooms */}
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BathtubOutlined />
                <Typography>{bathrooms} baths</Typography>
              </Box>
            </Grid>
            {/* Square meters */}
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SquareFoot />
                <Typography>{sqdMeters}m²</Typography>
              </Box>
            </Grid>
            {/* Property type */}
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

        {/* Footer section with date and favorite button */}
        <Box sx={{ mt: 'auto' }}>
          <Divider />
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            justifyContent: 'space-between',
            mt: 1
          }}>
            {/* Sale date and time */}
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
            {/* Favorite toggle button - only shown if enabled */}
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

// Export the component
export default PropertyCard;