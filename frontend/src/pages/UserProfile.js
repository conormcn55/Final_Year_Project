import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserInfo from '../components/UserInfo';
import { Box, CircularProgress } from '@mui/material';

const UserProfile = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Profile component mounted, URL:", window.location.href);
    
    const fetchUserData = async () => {
      console.log("Fetching user data...");
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/user/me`;
        console.log("API URL:", apiUrl);
        
        const response = await fetch(apiUrl, {
          credentials: 'include',
        });
        
        console.log("Response status:", response.status);
        console.log("Response headers:", [...response.headers].map(h => `${h[0]}: ${h[1]}`).join(', '));
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User data:", userData);
          setIsAuthenticated(true);
        } else {
          console.log("Not authenticated, redirecting");
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
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

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
        p: 3
      }}
    >
      {isAuthenticated ? <UserInfo /> : <Box>Please Log In</Box>}
    </Box>
  );
};

export default UserProfile;