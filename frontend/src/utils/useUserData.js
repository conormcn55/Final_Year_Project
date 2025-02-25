import { useState, useEffect } from 'react';

const useUserData = () => {
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
  }, []);

  return userData;
};

export default useUserData;