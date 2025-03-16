import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
 Box,
 Typography,
 Grid,
 CircularProgress
} from '@mui/material'; 
import PropertyCard from '../utils/PropertyCard'; // Import PropertyCard component
import useUserData from '../utils/useUserData'; // Import custom hook for user data

// Define the FavouritesPage functional component, displays user's favorite properties
const FavouritesPage = () => {
 const [favourites, setFavourites] = useState([]); // State for storing favorite data
 const [properties, setProperties] = useState([]); // State for storing property data
 const [loading, setLoading] = useState(true); // State for tracking loading status
 const [error, setError] = useState(null); // State for handling errors
 const { _id: userId } = useUserData(); // Get user ID from custom hook
 const navigate = useNavigate(); // Initialize navigation function
 
 useEffect(() => {
   // Function to fetch user's favorite properties
   const fetchFavorites = async () => {
     try {
       setLoading(true); // Set loading state to true
       const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/favourites/${userId}`); // Get user favorites
       const propertyIds = data.favourites.map(fav => fav.property); // Extract property IDs

       if (propertyIds.length) {
         // If user has favorites, fetch the property details
         const response = await axios.post(`${process.env.REACT_APP_API_URL}/property/ids`, { ids: propertyIds });
         setProperties(response.data.properties); // Set property data to state
       }
       setError(null); // Clear any existing errors
     } catch (err) {
       setError('Error fetching favorites'); // Set error message
       console.error('Error fetching favorites:', err); // Log detailed error
     } finally {
       setLoading(false); // Set loading state to false when done
     }
   };

   if (userId) {
     fetchFavorites(); // Call fetch function if user ID exists
   }
 }, [userId]); // Re-run effect when userId changes

 // Function to handle property card click
 const handleCardClick = (propertyId) => {
   navigate(`/property/${propertyId}`); // Navigate to property detail page
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

 // Display message if user has no favorites
 if (!properties.length) {
   return (
     <Box p={3}>
       <Typography variant="h6">You have no favorite properties yet.</Typography>
     </Box>
   );
 }

 // Main component render - display grid of favorite properties
 return (
   <Box sx={{ p: 3 }}> {/* Container with padding */}
     <Typography variant="h4" sx={{ mb: 3 }}>
       My Favorites {/* Page title */}
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
             <PropertyCard property={property} /> {/* Render property card with property data */}
           </Box>
         </Grid>
       ))}
     </Grid>
   </Box>
 );
};

// Export the FavouritesPage component
export default FavouritesPage;