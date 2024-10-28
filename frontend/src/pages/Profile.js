import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserInfo from '../components/UserInfo';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userAuth = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/user/me', {
                    credentials: 'include', 
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                console.log('Response:', response);

                if (!response.ok) {
                    navigate('/');
                    return;
                }

                const user = await response.json();

                console.log('User Data:', user);
                setUserData(user);
                const { email, avatar, _id } = user; 
                localStorage.setItem('email', email);
                localStorage.setItem('avatar', JSON.stringify(avatar));
                localStorage.setItem('userId', _id); 

            } catch (error) {
                console.error('Failed to fetch user data:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        userAuth();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {userData ? (
                <UserInfo  />
            ) : (
                <p>Please Log In</p>
            )}
        </div>
    );
};

export default Profile;
