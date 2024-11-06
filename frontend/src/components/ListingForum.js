import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Button, TextField, Box, MenuItem, InputAdornment, Typography, Grid } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/system';
import axios from 'axios';
import boxStyle from '../utils/boxStyle';
import propertyType from '../utils/propertyType';
import counties from '../utils/counties'; 

const VisuallyHiddenInput = styled('input')({
  display: 'none',
});

export default function ListingForum() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [propertyData, setPropertyData] = useState({
        address: {
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            addressTown: '',
            addressCounty: '',
            addressEirecode: ''
        },
        guidePrice: '',
        currentBid: '100000',
        listedBy: {
            listerID: '',
            listerName: ''
        },
        saleDate: null,
        sold: false,
        bedrooms: '',
        bathrooms: '',
        sqdMeters: '',
        propertyType: '',
        listingType: 'sale',
        description: ''
    });

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [];
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                newImages.push(reader.result);
                // If we've processed all files, update state
                if (newImages.length === files.length) {
                    setImages(oldArray => [...oldArray, ...newImages]);
                }
            };
        });
    };

    const handleForum = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address')) {
            setPropertyData(prevState => ({
                ...prevState,
                address: {
                    ...prevState.address,
                    [name]: value
                }
            }));
        } else if (name === 'sold') {
            setPropertyData(prevState => ({
                ...prevState,
                [name]: !prevState.sold
            }));
        } else {
            setPropertyData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Get user data from localStorage
            const userId = localStorage.getItem('userId');
            const userName = localStorage.getItem('name');

            if (!userId || !userName) {
                throw new Error('User information not found. Please login again.');
            }

            const requestData = {
                images,
                ...propertyData,
                listedBy: {
                    listerID: userId,
                    listerName: userName
                }
            };

            console.log('Request Data:', JSON.stringify(requestData, null, 2)); 
            const { data } = await axios.post('http://localhost:3001/api/property/new', requestData);
            
            if (data.success === true) {
                setLoading(false);
                setImages([]);
                setPropertyData({
                    address: {
                        addressLine1: '',
                        addressLine2: '',
                        addressLine3: '',
                        addressTown: '',
                        addressCounty: '',
                        addressEirecode: ''
                    },
                    guidePrice: '',
                    currentBid: '',
                    listedBy: {
                        listerID: '',
                        listerName: ''
                    },
                    saleDate: null,
                    sold: false,
                    bedrooms: '',
                    bathrooms: '',
                    sqdMeters: '',
                    propertyType: '',
                    listingType: 'sale',
                    description: ''
                });
            }
            console.log(data);
        } catch (error) {
            console.error('Error submitting form:', error);
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                component="form"
                sx={{ margin: '2rem 4rem' }}
                noValidate
                autoComplete="off"
                onSubmit={submitForm}
            >
                {/* Previous form sections remain the same */}
                <Box sx={boxStyle}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Address Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                name="addressLine1" 
                                label="Address Line 1" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.address.addressLine1} 
                                onChange={handleForum} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                 
                                name="addressLine2" 
                                label="Address Line 2" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.address.addressLine2} 
                                onChange={handleForum} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                name="addressLine3" 
                                label="Address Line 3" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.address.addressLine3} 
                                onChange={handleForum} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                name="addressTown" 
                                label="Town/City" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.address.addressTown} 
                                onChange={handleForum} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                select
                                name="addressCounty" 
                                label="County" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.address.addressCounty} 
                                onChange={handleForum}
                            >
                                {counties.map((county, index) => (
                                    <MenuItem key={index} value={county.value}>
                                        {county.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                name="addressEirecode" 
                                label="EirCode" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.address.addressEirecode} 
                                onChange={handleForum} 
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={boxStyle}>
                    <Typography variant="h6" sx={{ mb: 2 }}>House Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                name="guidePrice"
                                label="Guide Price"
                                variant="outlined"
                                fullWidth
                                value={propertyData.guidePrice}
                                onChange={handleForum}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DateTimePicker
                                label="Sale Date And Time"
                                value={propertyData.saleDate}
                                onChange={(newValue) => setPropertyData(prevState => ({ ...prevState, saleDate: newValue }))}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                name="propertyType"
                                label="Property Type"
                                variant="outlined"
                                fullWidth
                                value={propertyData.propertyType}
                                onChange={handleForum}
                            >
                                {propertyType.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                name="bedrooms" 
                                label="Bedrooms" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.bedrooms} 
                                onChange={handleForum} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                name="bathrooms" 
                                label="Bathrooms" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.bathrooms} 
                                onChange={handleForum} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                required 
                                name="sqdMeters" 
                                label="Square Meters" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.sqdMeters} 
                                onChange={handleForum} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                name="description"
                                label="Description"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={propertyData.description}
                                onChange={handleForum}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={boxStyle}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Upload Pictures</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                                Upload Images
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleImages}
                                    multiple
                                />
                            </Button>
                        </Grid>
                        <Grid item>
                            <Typography>
                                {images.length > 0 
                                    ? `${images.length} ${images.length === 1 ? 'image' : 'images'} uploaded`
                                    : ''}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Listing'}
                </Button>
            </Box>
        </LocalizationProvider>
    );
}