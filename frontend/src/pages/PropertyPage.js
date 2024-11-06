import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Container, 
  IconButton,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  useTheme,
  Fade
} from '@mui/material';
import {
  BedOutlined,
  BathtubOutlined,
  HomeOutlined,
  SquareFoot,
  CalendarToday,
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  Person
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

const PropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:3001/api/property/${id}`);
        setProperty(data);
        setError(null);
      } catch (err) {
        setError('Property not found');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) return <Typography sx={{ p: 2 }}>Loading...</Typography>;
  if (error) return <Typography color="error" sx={{ p: 2 }}>{error}</Typography>;
  if (!property) return null;

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
    description,
    listedBy
  } = property;

  const { date, time } = formatDateTime(saleDate);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <IconButton 
        onClick={() => navigate(-1)} 
        sx={{ mb: 2 }}
      >
        <ArrowBack />
      </IconButton>

      <Typography variant="h4" component="h1" gutterBottom>
        {formatAddress(address)}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Person color="action" />
        <Typography variant="subtitle1" color="text.secondary">
          Listed by: {listedBy.listerName}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {description}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                €{Number(currentBid).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Guide Price: €{guidePrice?.toLocaleString()}
              </Typography>

              <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <CalendarToday color="primary" />
                  <Box>
                    <Typography variant="body1">
                      {date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {time}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {sold && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label="SOLD" 
                    color="error" 
                    variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertyPage;