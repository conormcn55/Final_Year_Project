import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
  Box, 
  Typography, 
  Card,
  CardMedia,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import {
  BedOutlined,
  BathtubOutlined,
  HomeOutlined,
  SquareFoot,
} from '@mui/icons-material';
import useEircodeGeocoding from '../utils/useEirecodeGeocoding';

/**
 * Component for displaying property information on a map 
 */
const MapPopup = ({ property }) => {
  const navigate = useNavigate();
  // Destructure property data for easier access
  const {
    _id,
    address,
    bathrooms,
    bedrooms,
    currentBid,
    guidePrice,
    images,
    propertyType,
    sold,
    sqdMeters,
  } = property;

  /**
   * Format address object into a readable string
   */
  const formatAddress = (addr) => {
    if (!addr) return 'Address Not Available';
    const parts = [
      addr.addressLine1,
      addr.addressTown,
      addr.addressCounty
    ].filter(part => part && part.length > 0);
    return parts.length > 0 ? parts.join(', ') : 'Address Not Available';
  };

  /**
   * Navigate to property details page when popup is clicked
   */
  const handleClick = () => {
    navigate(`/property/${_id}`);
  };

  return (
    <Card 
      sx={{ 
        width: '100%',
        maxWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
        }
      }}
      onClick={handleClick}
    >
      {/* Property thumbnail image */}
      <CardMedia
        component="img"
        height="140"
        image={images?.[0]?.url || "/api/placeholder/400/400"}
        alt={formatAddress(address)}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ p: 1.5 }}>
        {/* Property address */}
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
          {formatAddress(address)}
        </Typography>
        
        {/* Current bid and guide price */}
        <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
          €{currentBid.amount?.toLocaleString()}
        </Typography>
        <Typography variant="caption" color="text.primary" display="block" sx={{ mb: 1 }}>
          Guide: €{guidePrice?.toLocaleString()}
        </Typography>
        
        {/* Sold status indicator */}
        {sold && (
          <Chip 
            label="SOLD" 
            color="error" 
            size="small"
            sx={{ mb: 1 }} 
          />
        )}

        {/* Property features grid */}
        <Grid container spacing={1} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BedOutlined sx={{ fontSize: '1rem' }} />
              <Typography variant="caption">{bedrooms}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BathtubOutlined sx={{ fontSize: '1rem' }} />
              <Typography variant="caption">{bathrooms}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SquareFoot sx={{ fontSize: '1rem' }} />
              <Typography variant="caption">{sqdMeters}m²</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HomeOutlined sx={{ fontSize: '1rem' }} />
              <Typography variant="caption">{propertyType}</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/**
 * Component for rendering a single property marker on the map
 */
const PropertyMapMarker = ({ property }) => {
  // Determine if we need to geocode the address
  const shouldGeocode = !property.latitude || !property.longitude;
  // Use custom hook to get coordinates from Eircode if needed
  const { coordinates, loading, error } = useEircodeGeocoding(
    shouldGeocode ? property.address?.addressEirecode : null
  );

  // Don't render anything while loading or if there's an error
  if (loading || error) {
    return null;
  }

  // Use property's coordinates if available, otherwise use geocoded coordinates
  const latitude = property.latitude || coordinates?.latitude;
  const longitude = property.longitude || coordinates?.longitude;

  // Skip rendering if no valid coordinates are available
  if (!latitude || !longitude) {
    return null;
  }

  const position = [latitude, longitude];

  return (
    <Marker position={position}>
      <Popup maxWidth={300}>
        <MapPopup property={property} />
      </Popup>
    </Marker>
  );
};

/**
 * Main map component that displays multiple properties on a map
 */
const PropertyMap = ({ properties }) => {
  // Dynamically load Leaflet CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css';
    document.head.appendChild(link);

    // Clean up function to remove the CSS when component unmounts
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Default map center (approximately center of Ireland)
  const defaultCenter = [53.1424, -7.6921];

  return (
    <Box sx={{ width: '100%', height: 600, position: 'relative' }}>
      {/* Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Map tile layer using OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Render a marker for each property */}
        {properties.map((property) => (
          <PropertyMapMarker key={property._id} property={property} />
        ))}
      </MapContainer>
      
      {/* Message to display when no properties are available */}
      {properties.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 2,
            borderRadius: 1,
          }}
        >
          <Typography>No properties to display</Typography>
        </Box>
      )}
    </Box>
  );
};

export default PropertyMap;