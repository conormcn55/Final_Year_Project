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
        listedBy: 'CONOR',
        saleDate: null,
        sold: false,
        bedrooms: '',
        bathrooms: '',
        sqdMeters: '',
        propertyType: '',
        listingType: 'sale',
        description: ''
    });

    // Image upload handler
    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setImages(oldArray => [...oldArray, reader.result]);
            };
        });
    };

    // Form field change handler
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

    // Form submission handler
    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare the request data
            const requestData = {
                images,
                ...propertyData
            };
    
            // Log the request data before sending
            console.log('Request Data:', JSON.stringify(requestData, null, 2)); // Log the request data in a readable format
            
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
                    listedBy: '',
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
            const requestData = {
                images,
                ...propertyData
            };
            console.log(requestData);
            console.error('Error submitting form:', error); // Log the error
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
                {/* Address Information Section */}
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
                                required 
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
                                name="addressCounty" 
                                label="County" 
                                variant="outlined" 
                                fullWidth 
                                value={propertyData.address.addressCounty} 
                                onChange={handleForum} 
                            />
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

                {/* House Information Section */}
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

                {/* Image Upload Section */}
                <Box sx={boxStyle}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Upload Pictures</Typography>
                    <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                        Upload Images
                        <VisuallyHiddenInput
                            type="file"
                            onChange={handleImages}
                            multiple
                        />
                    </Button>
                </Box>
                
        
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Listing'}
                </Button>
            </Box>
        </LocalizationProvider>
    );
}
