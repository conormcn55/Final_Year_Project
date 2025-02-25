import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useUserData from '../utils/useUserData';
import { 
  Box, 
  Typography, 
  IconButton,
  Paper,
  Grid,
  Collapse,
  Button,
  Fade
} from '@mui/material';
import {
  BedOutlined,
  BathtubOutlined,
  HomeOutlined,
  SquareFoot,
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  Person,
  FavoriteBorder,
  Favorite
} from '@mui/icons-material';

const formatAddress = (address) => {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.addressLine3,
    address.addressTown,
    address.addressCounty,
    address.addressEirecode
  ].filter(part => part && part.length > 0);
  
  return parts.join(', ');
};

const ImageCarousel = ({ images }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  return (
    <Box 
      sx={{ 
        position: 'relative',
        '&:hover .MuiIconButton-root': { opacity: 1 }
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <Box
        component="img"
        sx={{
          height: 400,
          display: 'block',
          overflow: 'hidden',
          width: '100%',
          objectFit: 'cover',
        }}
        src={images[activeStep]?.url || "/api/placeholder/800/600"}
        alt={`Property image ${activeStep + 1}`}
      />
      
      <Fade in={showControls}>
        <IconButton
          onClick={handleBack}
          disabled={images.length <= 1}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'background.paper',
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover': {
              bgcolor: 'background.paper',
            },
            boxShadow: 2
          }}
        >
          <ChevronLeft />
        </IconButton>
      </Fade>

      <Fade in={showControls}>
        <IconButton
          onClick={handleNext}
          disabled={images.length <= 1}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'background.paper',
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover': {
              bgcolor: 'background.paper',
            },
            boxShadow: 2
          }}
        >
          <ChevronRight />
        </IconButton>
      </Fade>

      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1
        }}
      >
        {images.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: index === activeStep ? 'primary.main' : 'rgba(255, 255, 255, 0.7)',
              transition: 'background-color 0.3s'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const PropertyInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useUserData();
  const userId = userData?._id;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        // Add debug logs
        console.log('API URL:', process.env.REACT_APP_API_URL);
        console.log('Property ID:', id);
        
        const propertyUrl = `${process.env.REACT_APP_API_URL}/property/${id}`;
        console.log('Fetching from:', propertyUrl);
        
        const propertyResponse = await axios.get(propertyUrl);
        console.log('Property response:', propertyResponse);
        
        setProperty(propertyResponse.data);
        setError(null);

        // Only fetch favorites if user is logged in
        if (userId) {
          const favoritesUrl = `${process.env.REACT_APP_API_URL}/favourites/${userId}`;
          console.log('Fetching favorites from:', favoritesUrl);
          
          const favoritesResponse = await axios.get(favoritesUrl);
          console.log('Favorites response:', favoritesResponse);
          
          const isFavourited = favoritesResponse.data.favourites.some(
            fav => fav.property === id
          );
          setIsFavorite(isFavourited);
        }
      } catch (err) {
        console.error('Full error:', err);
        setError(err.response?.data?.message || 'Property not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, userId]);
  const toggleFavorite = async () => {
    if (!userId) return;
    
    try {
      if (isFavorite) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/favourites/unfavourite`, { 
          data: { 
            user: userId, 
            property: id 
          } 
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/favourites/`, { 
          user: userId, 
          property: id 
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (loading) return <Typography sx={{ p: 2 }}>Loading...</Typography>;
  if (error) return <Typography color="error" sx={{ p: 2 }}>{error}</Typography>;
  if (!property) return null;

  const { 
    address, 
    bathrooms, 
    bedrooms, 
    images, 
    propertyType, 
    sqdMeters,
    description,
    listedBy
  } = property;

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>

        {userId && (
          <IconButton onClick={toggleFavorite}>
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        )}
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        {formatAddress(address)}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Person color="action" />
        <Typography variant="subtitle1" color="text.secondary">
          Listed by:{' '}
          <Link 
            to={`/profile/${listedBy.listerID}`}
            style={{ 
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {listedBy.listerName}
          </Link>
        </Typography>
      </Box>

      <Paper elevation={2}>
        <ImageCarousel images={images || []} />
      </Paper>
      
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BedOutlined />
            <Typography>{bedrooms} beds</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BathtubOutlined />
            <Typography>{bathrooms} baths</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SquareFoot />
            <Typography>{sqdMeters}m²</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeOutlined />
            <Typography>{propertyType}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        
        <Collapse in={showFullDescription} collapsedSize={60}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {description}
          </Typography>
        </Collapse>
        
        <Button 
          onClick={() => setShowFullDescription(!showFullDescription)}
          sx={{ mt: 2, color: "text.primary" }}
        >
          {showFullDescription ? 'Show less' : 'Show more'}
        </Button>
      </Paper>
    </Box>
  );
};

export default PropertyInfo;