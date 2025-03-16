import { useEffect, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Button, TextField, Box, MenuItem, InputAdornment, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/system';
import axios from 'axios';
import propertyType from '../utils/propertyType';
import counties from '../utils/counties'; 
import useUserData from '../utils/useUserData';
import listingPageImage from '../images/listingpage.png';

/**
 * Styled component for a hidden file input
 * This creates a visually hidden input that can be triggered by a Button component
 */
const VisuallyHiddenInput = styled('input')({
  display: 'none',
});

/**
 * ListingForum Component
 * 
 * A form component for property agents/owners to create new property listings.
 * Handles collection of address details, property specifications, images, and other
 * information before submitting to the API.
 */
export default function ListingForum() {
    // Extract user data from custom hook for the listing creator information
    const { _id: userId, name: userName } = useUserData();
    
    // State for handling property images as base64 strings
    const [images, setImages] = useState([]);
    
    // Loading state for form submission
    const [loading, setLoading] = useState(false);
    
    // Main state object containing all property listing information
    const [propertyData, setPropertyData] = useState({
        // Nested address object
        address: {
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            addressTown: '',
            addressCounty: '',
            addressEircode: ''
        },
        guidePrice: '',
        // Initial bid information structure
        currentBid: {
            bidId: "null",
            amount: "0"
        },
        // Property lister information (populated on submission)
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
        listingType: '',
        description: ''
    });

    /**
     * Handles image file uploads
     * Converts uploaded image files to base64 strings for storage/transmission
     */
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
   
    /**
     * Handles form input changes
     * Updates the propertyData state based on input changes
     * Handles both nested address fields and top-level fields
     */
    const handleForum = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address')) {
            // Handle nested address object fields
            setPropertyData(prevState => ({
                ...prevState,
                address: {
                    ...prevState.address,
                    [name]: value
                }
            }));
        } else if (name === 'sold') {
            // Toggle boolean value for sold field
            setPropertyData(prevState => ({
                ...prevState,
                [name]: !prevState.sold
            }));
        } else {
            // Handle top-level fields
            setPropertyData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    /**
     * Submits the form data to the API
     * Combines images and property data, adds lister information
     */
    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const requestData = {
                images,
                ...propertyData,
                listedBy: {
                    listerID: userId,
                    listerName: userName
                }
            };
    
            console.log('Request Data:', JSON.stringify(requestData, null, 2)); // Log the payload
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/property/new`, requestData);
    
            if (data.success === true) {
                setLoading(false);
                // Reset form state after successful submission
                setImages([]);
                setPropertyData({
                    address: {
                        addressLine1: '',
                        addressLine2: '',
                        addressLine3: '',
                        addressTown: '',
                        addressCounty: '',
                        addressEircode: ''
                    },
                    guidePrice: '',
                    currentBid: {
                        bidId: "null",
                        amount: "0"
                    },
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
                    listingType: '',
                    description: ''
                });
            }
            console.log(data);
        } catch (error) {
            console.error('Error submitting form:', error);
            setLoading(false);
        }
    };

    // Common styling for text fields to maintain consistent theme
    const TextFieldSx = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'secondary.main',
            },
            '&:hover fieldset': {
                borderColor: 'secondary.main',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'secondary.main',
            }
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: 'secondary.main'
        }
    };

    return (
        // LocalizationProvider is required for DateTimePicker to work
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                component="form"
                sx={{
                    maxWidth: 1200,
                    margin: '2rem auto',
                    padding: '0 2rem',
                    position: 'relative', // Enables positioning for child elements
                }}
                noValidate
                autoComplete="off"
                onSubmit={submitForm}
            >
                <Grid container spacing={3}>
                    {/* Hero section with background image */}
                    <Grid item xs={12} sx={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                        {/* Background image container */}
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${listingPageImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        
                        {/* Text overlay positioned above the background */}
                        <Box 
                            sx={{ 
                                position: 'relative', 
                                zIndex: 2, 
                                p: 3, 
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                height: '100%'
                            }}
                        >
                            <Typography 
                                variant="h3" 
                                color="background.paper"
                                sx={{ 
                                    fontWeight: 'bold',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)' 
                                }}
                            >
                                List Your Property
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Address Section - Paper provides a card-like container */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                Address Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField 
                                        required 
                                        name="addressLine1" 
                                        label="Address Line 1" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.address.addressLine1} 
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        name="addressLine2" 
                                        label="Address Line 2" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.address.addressLine2} 
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        name="addressLine3" 
                                        label="Address Line 3" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.address.addressLine3} 
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField 
                                        required 
                                        name="addressTown" 
                                        label="Town/City" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.address.addressTown} 
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    {/* Dropdown menu for County selection from the imported counties data */}
                                    <TextField 
                                        required 
                                        select
                                        name="addressCounty" 
                                        label="County" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.address.addressCounty} 
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    >
                                        {counties.map((county, index) => (
                                            <MenuItem key={index} value={county.value}>
                                                {county.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField 
                                        required 
                                        name="addressEircode" 
                                        label="EirCode" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.address.addressEircode} 
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
    
                    {/* Property Details Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                Property Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    {/* Guide price with Euro symbol prefix */}
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
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {/* Date and time picker for sale date */}
                                    <DateTimePicker
                                        label="Sale Date And Time"
                                        value={propertyData.saleDate}
                                        onChange={(newValue) => setPropertyData(prevState => ({ ...prevState, saleDate: newValue }))}
                                        slotProps={{ 
                                            textField: { 
                                                fullWidth: true,
                                                sx: { TextFieldSx }
                                            } 
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {/* Property type dropdown using imported property types */}
                                    <TextField
                                        required
                                        select
                                        name="propertyType"
                                        label="Property Type"
                                        variant="outlined"
                                        fullWidth
                                        value={propertyData.propertyType}
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    >
                                        {propertyType.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {/* Listing type selection (sale or rental) */}
                                    <TextField
                                        required
                                        select
                                        name="listingType"
                                        label="Listing Type"
                                        variant="outlined"
                                        fullWidth
                                        value={propertyData.listingType}
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    >
                                        <MenuItem value="sale">For Sale</MenuItem>
                                        <MenuItem value="rental">For Rent</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {/* Number input for bedrooms with minimum value of 0 */}
                                    <TextField 
                                        required 
                                        name="bedrooms" 
                                        label="Bedrooms" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.bedrooms} 
                                        onChange={handleForum}
                                        type="number"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {/* Number input for bathrooms with minimum value of 0 */}
                                    <TextField 
                                        required 
                                        name="bathrooms" 
                                        label="Bathrooms" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.bathrooms}
                                        onChange={handleForum}
                                        type="number"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {/* Number input for square meters with unit symbol (m²) */}
                                    <TextField 
                                        required 
                                        name="sqdMeters" 
                                        label="Square Meters" 
                                        variant="outlined" 
                                        fullWidth 
                                        value={propertyData.sqdMeters} 
                                        onChange={handleForum}
                                        type="number"
                                        InputProps={{ 
                                            inputProps: { min: 0 },
                                            endAdornment: <InputAdornment position="end">m²</InputAdornment>
                                        }}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {/* Multiline text area for detailed property description */}
                                    <TextField
                                        required
                                        name="description"
                                        label="Property Description"
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={propertyData.description}
                                        onChange={handleForum}
                                        sx={TextFieldSx}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
    
                    {/* Image Upload Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                Property Images
                            </Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    {/* Custom styled button that acts as a file input trigger */}
                                    <Button
                                        component="label"
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                        sx={TextFieldSx}
                                    >
                                        Upload Images
                                        {/* Hidden file input that gets triggered by the button */}
                                        <VisuallyHiddenInput
                                            type="file"
                                            onChange={handleImages}
                                            multiple
                                            accept="image/*"
                                        />
                                    </Button>
                                </Grid>
                                <Grid item>
                                    {/* Dynamic text showing number of images selected */}
                                    <Typography color="text.secondary">
                                        {images.length > 0 
                                            ? `${images.length} ${images.length === 1 ? 'image' : 'images'} selected`
                                            : 'No images uploaded yet'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        {/* Form submission button centered at the bottom */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={loading}
                                size="large"
                                sx={{
                                    ...TextFieldSx,
                                    color: 'primary.main',
                                    backgroundColor: 'secondary.main',
                                    '&:hover': {
                                        backgroundColor: 'secondary.dark' }
                                }}
                            >
                                {/* Conditional rendering based on loading state */}
                                {loading ? (
                                    <>
                                        {/* Loading spinner with accompanying text */}
                                        <CircularProgress size={24} sx={{ mr: 1 }} />
                                        Submitting...
                                    </>
                                ) : 'List Property'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
}