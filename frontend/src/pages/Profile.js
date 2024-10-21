import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SignUpForum from "../components/SignUpForum";
import axios from 'axios'; 

const Profile = () => {
    const location = useLocation();
    const navigate = useNavigate(); 
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userId = params.get('userId'); 

        if (userId) {
            localStorage.setItem('userId', userId);

            fetchUserDetails(userId);
        }


        const loaded = localStorage.getItem('loaded');
        if (!loaded) {
            localStorage.setItem('loaded', 'true');
            window.location.reload();
        }

    }, [location, navigate]);

    const fetchUserDetails = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/user/${userId}`);
            const user = response.data;

            localStorage.setItem('name', user.name);
            localStorage.setItem('userID', user.userID);
            localStorage.setItem('avatar', user.avatar);
            localStorage.setItem('email', user.email);

            // Update userData state
            setUserData(user);
            console.log('User data stored in localStorage:', user);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const usersID = localStorage.getItem('userId'); 

    return (
        <div>
            { userData ? (
                <SignUpForum userId={usersID}/>
            ) : (
                <p> Please Log In </p>
            )}
        </div>
    );
}

export default Profile;
