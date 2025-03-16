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

// EndingSoon component definition - displays properties that are ending soon in a carousel
const EndingSoon = () => {
 const navigate = useNavigate(); // Initialize navigation hook for routing
 const [properties, setProperties] = useState([]); // State to store property data
 const [loading, setLoading] = useState(true); // State to track loading status
 const [error, setError] = useState(null); // State to store any error messages

 // Effect hook that runs when component mounts
 useEffect(() => {
   //Function to fetch properties ending soon from API
   const fetchEndingSoon = async () => {
     try {
       // Make GET request to the API endpoint
       const response = await axios.get(`${process.env.REACT_APP_API_URL}/property/endingsoon`);
       console.log('API Response:', response.data);

       // Check if response contains valid data
       if (response.data && response.data.data) {
         // Filter out any invalid properties (missing ID)
         const validProperties = response.data.data.filter(prop => prop && prop._id);
         setProperties(validProperties);
       } else {
         throw new Error('Invalid response format from API');
       }
     } catch (err) {
       // Log and store any errors
       console.error('API Error:', err);
       setError(err.message || 'Failed to fetch properties');
     } finally {
       // Always set loading to false when done
       setLoading(false);
     }
   };

   // Call the fetch function
   fetchEndingSoon();
 }, []); 

 // Handler for location search - navigates to search results with location parameter
 const handleLocationSearch = (location, e) => {
   // Prevent event propagation to avoid triggering card click
   e.stopPropagation();
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
     <Alert severity="error" sx={{ m: 2, maxWidth: 600, mx: "auto" }}>
       {error}
     </Alert>
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
       p={4}
     >
       <Typography variant="h6">
         No properties ending soon found
       </Typography>
     </Box>
   );
 }

 // Render carousel of property cards
 return (
   <Box margin={2} maxWidth={800} mx="auto">
     {/* Section title */}
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
     {/* Property carousel */}
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
           transform: 'translateX(-50px)',  
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
export default EndingSoon;