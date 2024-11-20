import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';
import Carousel from 'react-material-ui-carousel';

const RecentlyListed = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentlyListed = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/property/recent'); // Call the backend route
                setProperties(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentlyListed();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="error">Error: {error}</Typography>
            </Box>
        );
    }

    if (!properties.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography>No recently listed properties found.</Typography>
            </Box>
        );
    }

    return (
        <Box margin={2}>
            <Typography variant="h5" gutterBottom>
                Recently Listed Properties
            </Typography>
            <Carousel
                animation="slide"
                indicators={true}
                navButtonsAlwaysVisible={true}
                navButtonsProps={{
                    style: {
                        backgroundColor: '#fff',
                        color: '#000',
                    },
                }}
            >
                {properties.map((property) => (
                    <Box
                        key={property._id}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        sx={{ p: 2 }}
                    >
                        <img
                            src={property.images[0]?.url}
                            alt={`Property in ${property.address.addressTown}`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                objectFit: 'cover',
                                borderRadius: '10px',
                            }}
                        />
                        <Typography variant="subtitle1" sx={{ mt: 1 }}>
                            {property.address.addressTown}, {property.address.addressCounty}
                        </Typography>
                    </Box>
                ))}
            </Carousel>
        </Box>
    );
};

export default RecentlyListed;
