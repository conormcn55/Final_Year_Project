import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OtherUserInfo from '../components/OtherUserInfo';
import axios from 'axios';

const OtherProfiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/user/basic/${id}`);
        setUserData(data.user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {userData ? (
        <OtherUserInfo userId={id} />
      ) : (
        <div>User not found</div>
      )}
    </div>
  );
};

export default OtherProfiles;