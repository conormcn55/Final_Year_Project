import { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import OtherUserInfo from '../components/OtherUserInfo'; 
import axios from 'axios'; 

// Define the OtherProfiles functional component, displays another user's profile
const OtherProfiles = () => {
 const { id } = useParams(); // Get user ID from URL parameters
 const navigate = useNavigate(); // Initialize navigation function
 const [userData, setUserData] = useState(null); // State for storing user data
 const [loading, setLoading] = useState(true); // State for tracking loading status
 
 useEffect(() => {
   // Function to fetch user data based on ID from params
   const fetchUserData = async () => {
     try {
       const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/user/basic/${id}`); // Get user data
       setUserData(data.user); // Set user data to state
     } catch (error) {
       console.error('Failed to fetch user data:', error); // Log error
       navigate('/'); // Redirect to home page on error
     } finally {
       setLoading(false); // Set loading state to false when done
     }
   };
   
   fetchUserData(); // Call fetch function
 }, [id, navigate]); // Re-run effect when id or navigate changes
 
 // Display loading indicator while data is being fetched
 if (loading) {
   return <div>Loading...</div>;
 }
 
 // Main component render - display user profile or not found message
 return (
   <div>
     {userData ? (
       <OtherUserInfo userId={id} /> // Render OtherUserInfo component if user data exists
     ) : (
       <div>User not found</div> // Show not found message if no user data
     )}
   </div>
 );
};

// Export the OtherProfiles component
export default OtherProfiles;