import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import {
 Box,
 Typography,
 Grid,
 CircularProgress
} from '@mui/material'; 
import MyListingCard from '../utils/MyListingCard'; 
import useUserData from '../utils/useUserData'; 

// Define the MyListings functional component, displays properties listed by the current user
const MyListings = () => {
 const [properties, setProperties] = useState([]); // State for storing property data
 const [loading, setLoading] = useState(true); // State for tracking loading status
 const [error, setError] = useState(null); // State for handling errors
 const { _id: userId } = useUserData(); // Get user ID from custom hook
 const navigate = useNavigate(); // Initialize navigation function

 useEffect(() => {
   // Function to fetch user's listed properties
   const fetchListings = async () => {
     try {
       setLoading(true); // Set loading state to true
       const response = await axios.get(`${process.env.REACT_APP_API_URL}/property/lister/${userId}`); // Get properties by lister ID
       setProperties(response.data || []); // Set property data to state, default to empty array
       setError(null); // Clear any existing errors
     } catch (err) {
       setError('No Listings Found'); // Set error message
       console.error('Error fetching listings:', err); // Log detailed error
       setProperties([]); // Ensure properties is an empty array on error
     } finally {
       setLoading(false); // Set loading state to false when done
     }
   };

   if (userId) {
     fetchListings(); // Call fetch function if user ID exists
   }
 }, [userId]); // Re-run effect when userId changes

 // Function to handle property card click
 const handleCardClick = (propertyId) => {
   navigate(`/property/${propertyId}`); // Navigate to property detail page
 };

 // Function to handle property deletion
 const handleDeleteProperty = (deletedPropertyId) => {
   setProperties(prevProperties => 
     prevProperties.filter(property => property._id !== deletedPropertyId) // Remove deleted property from state
   );
 };

 // Display loading spinner while data is being fetched
 if (loading) return (
   <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
     <CircularProgress /> {/* Show loading indicator */}
   </Box>
 );

 // Display error message if there was an error
 if (error) return (
   <Box p={3}>
     <Typography color="error">{error}</Typography> {/* Show error message */}
   </Box>
 );

 // Display message if user has no listings
 if (!properties?.length) {
   return (
     <Box p={3}>
       <Typography variant="h6">You haven't listed any properties yet.</Typography>
     </Box>
   );
 }

 // Main component render - display grid of user's listings
 return (
   <Box sx={{ p: 3 }}> {/* Container with padding */}
     <Typography variant="h4" sx={{ mb: 3 }}>
       My Listings {/* Page title */}
     </Typography>
     <Grid container spacing={3}> {/* Grid layout with spacing */}
       {properties.map((property) => (
         <Grid item xs={12} sm={6} md={4} key={property._id}> {/* Responsive grid item */}
           <Box
             sx={{
               cursor: 'pointer', // Show pointer cursor on hover
               '&:hover': {
                 transform: 'scale(1.02)', // Slightly enlarge on hover
                 transition: 'transform 0.2s ease-in-out' // Smooth transition effect
               }
             }}
             onClick={() => handleCardClick(property._id)} // Navigate on click
           >
               <MyListingCard 
               property={property} // Pass property data to card
               onDelete={handleDeleteProperty} // Pass delete handler to card
               />
           </Box>
         </Grid>
       ))}
     </Grid>
   </Box>
 );
};

// Export the MyListings component
export default MyListings;