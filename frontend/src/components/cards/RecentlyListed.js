import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
 Box,
 Typography,
 Skeleton,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import PropertyCard from '../../utils/PropertyCard';

// RecentlyListed component - displays recently listed properties in a carousel
const RecentlyListed = () => {
 const navigate = useNavigate(); // Initialize navigate function for routing
 const [properties, setProperties] = useState([]); // State for storing property data
 const [loading, setLoading] = useState(true); // State for tracking loading status
 const [error, setError] = useState(null); // State for storing any error messages

 // Effect hook 
 useEffect(() => {
   // Async function to fetch recently listed properties
   const fetchRecentlyListed = async () => {
     try {
       // API call to get recent properties
       const response = await axios.get(`${process.env.REACT_APP_API_URL}/property/recent`);
       // Filter out invalid properties (those without an ID)
       const validProperties = response.data.filter(prop => prop && prop._id);
       // Update properties state with valid data
       setProperties(validProperties);
     } catch (err) {
       // Store error message if API call fails
       setError(err.message);
     } finally {
       // Set loading to false when operation completes (success or failure)
       setLoading(false);
     }
   };

   // Call the fetch function
   fetchRecentlyListed();
 }, []); // Empty dependency array means this effect runs once on mount

 // Handler for location search - navigates to search results with location parameter
 const handleLocationSearch = (location, e) => {
   // Prevent event propagation to parent elements
   e.stopPropagation();
   // Navigate to search results page with location parameter
   navigate(`/search-results?location=${location}`);
 };

 // Handler for property card clicks - navigates to property detail page
 const handleCardClick = (propertyId) => {
   navigate(`/property/${propertyId}`);
 };

 // Show loading skeletons while data is being fetched
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

 // Show error message if API request failed
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

 // Show message if no properties were found
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

 // Render carousel of property cards
 return (
   <Box margin={2} maxWidth={800} mx="auto">
     {/* Component title */}
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
     {/* Carousel component for property cards */}
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
       // Custom styling for navigation buttons
       navButtonsProps={{
         style: {
           backgroundColor: 'rgba(255,255,255,0.8)',
           color: '#000',
           borderRadius: '50%',
           boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
           position: 'absolute',
           transform: 'translateX(-50px)',  // Positions the left navigation button
         }
       }}
       // Custom styling for navigation buttons wrapper
       NavButtonsWrapperProps={{   
         style: {
           position: 'absolute',
           padding: '0 50px',
           height: '100%'
         }
       }}
     >
       {/* Map through properties to create carousel items */}
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
           {/* Property card component with click handlers */}
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

// Export the component
export default RecentlyListed;