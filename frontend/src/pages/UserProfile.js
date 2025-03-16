import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserInfo from '../components/UserInfo';
import { Box, CircularProgress } from '@mui/material';

// UserProfile component, displays users info and allows them to edit
const UserProfile = () => {
  const navigate = useNavigate();  // Initialize navigate function for redirecting users
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // State to track if user is authenticated
  const [loading, setLoading] = useState(true);  // State to track if data is still loading
  // Effect hook that runs 
  useEffect(() => {
    // Log the current URL 
    console.log("Profile component mounted, URL:", window.location.href);
    
    // Async function to fetch user data from API
    const fetchUserData = async () => {
      console.log("Fetching user data...");
      try {
        // Construct API URL using environment variable
        const apiUrl = `${process.env.REACT_APP_API_URL}/user/me`;
        console.log("API URL:", apiUrl);
        
        // Make API request with credentials included (for cookies/session)
        const response = await fetch(apiUrl, {
          credentials: 'include',
        });
        
        // Log response details for debugging
        console.log("Response status:", response.status);
        console.log("Response headers:", [...response.headers].map(h => `${h[0]}: ${h[1]}`).join(', '));
        
        // If response is successful, update authentication state
        if (response.ok) {
          const userData = await response.json();
          console.log("User data:", userData);
          setIsAuthenticated(true);
        } else {
          // If not authenticated, redirect to home page
          console.log("Not authenticated, redirecting");
          navigate('/');
        }
      } catch (error) {
        // Handle any errors in the fetch operation
        console.error('Failed to fetch user data:', error);
        navigate('/');
      } finally {
        // Always set loading to false when done, regardless of success/failure
        setLoading(false);
      }
    };
    
    // Call the fetch function
    fetchUserData();
  }, [navigate]); // Re-run effect if navigate function changes

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
        color="text.primary"
      >
        <CircularProgress />
      </Box>
    );
  }
  // Render the main component content
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
        p: 3
      }}
    >
      {/* Conditionally render UserInfo or login message based on authentication state */}
      {isAuthenticated ? <UserInfo /> : <Box>Please Log In</Box>}
    </Box>
  );
};

// Export the component 
export default UserProfile;