// This custom hook manages and fetches user data
import { useState, useEffect } from 'react';

const useUserData = () => {
  // Initialize state with empty user data structure
  const [userData, setUserData] = useState({
    _id: '',
    name: '',
    googleId: '',
    email: '',
    number: '',
    files: [],
    description: '',
    userType: '',
    regNumber: '',
  });
  
  // Effect runs once when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data from API with credentials included
        const response = await fetch(`${process.env.REACT_APP_API_URL}/user/me`, {
          credentials: 'include',
        });
        if (response.ok) {
          const user = await response.json();
          setUserData(user);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    
    fetchUserData();
  }, []); // Empty dependency array means this runs once on mount
  
  // Return the current user data state
  return userData;
};

export default useUserData;