import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Avatar, Button, TextField, Link, Snackbar, Alert, CircularProgress, Box } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import useUserData from '../utils/useUserData';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * ApprovalList Component
 * This component is where a user can approve other users to bid on their listing
 */
const ApprovalList = () => {
    // Get current user data and navigation function
    const { _id: userId } = useUserData();
    const navigate = useNavigate();
    
    // State management for requests data
    const [requests, setRequests] = useState([]); // List of pending approval requests
    const [requesters, setRequesters] = useState({}); // Map of requester IDs to user data
    const [properties, setProperties] = useState({}); // Map of property IDs to property data
    
    // UI state management
    const [loading, setLoading] = useState(true); // Controls loading state
    const [error, setError] = useState(null); // Tracks error messages
    const [actionInProgress, setActionInProgress] = useState(null); // Tracks active request action
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // Controls notification display
  
  /**
   * Effect hook to fetch initial data
   */
  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          // Fetch all requests for the current approver
          const { data: requestsData } = await axios.get(`${process.env.REACT_APP_API_URL}/request/approver/${userId}`);
          
          // Filter to show only pending  requests
          const pendingRequests = requestsData.requests.filter(request => request.approved === false);
          console.log('Pending requests found:', pendingRequests.length);
          setRequests(pendingRequests);

          // If there are pending requests, fetch additional data for each one
          if (pendingRequests.length > 0) {
            // Fetch requester information for each request
            const requestersData = await Promise.all(
              pendingRequests.map(async (request) => {
                try {
                  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/user/basic/${request.requesterId}`);
                  return { [request.requesterId]: data };
                } catch (err) {
                  console.error(`Error fetching requester ${request.requesterId}:`, err);
                  // Provide fallback data if user info can't be fetched
                  return { [request.requesterId]: { user: { name: 'Unknown User' } } };
                }
              })
            );
            // Combine all requester data into one object
            setRequesters(Object.assign({}, ...requestersData));

            // Fetch property information for each request
            const propertiesData = await Promise.all(
              pendingRequests.map(async (request) => {
                try {
                  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/property/${request.propertyId}`);
                  return { [request.propertyId]: data };
                } catch (err) {
                  console.error(`Error fetching property ${request.propertyId}:`, err);
                  // Provide fallback data if property info can't be fetched
                  return { [request.propertyId]: { address: { addressLine1: 'Unknown', addressTown: '', addressCounty: '' } } };
                }
              })
            );
            // Combine all property data into one object
            setProperties(Object.assign({}, ...propertiesData));
          }

          setError(null);
        } catch (err) {
          setError('Failed to load approval requests');
          console.error('Error fetching Requests:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [userId]);

  /**
   * Updates the amount allocated to the requestee
   */
  const handleAmountChange = (request, newAmount) => {
    const updatedRequests = requests.map(req => 
      req._id === request._id 
        ? { ...req, amountAllowed: newAmount } 
        : req
    );
    setRequests(updatedRequests);
  };

  /**
   * Handles approving a request
   */
  const handleApprove = async (request) => {
    // Set action in progress whcih shows loading state for this specific request
    setActionInProgress(request._id);
    try {
      // Update the request status to approved
      await axios.put(`${process.env.REACT_APP_API_URL}/request/edit/${request._id}`, {
        amountAllowed: request.amountAllowed,
        approved: true
      });
      // Show success message
      setSnackbar({
        open: true,
        message: 'Request approved successfully',
        severity: 'success'
      });
      
      // Fetch updated data to refresh the list
      const fetchData = async () => {
        try {
          setLoading(true);
          const { data: requestsData } = await axios.get(`${process.env.REACT_APP_API_URL}/request/approver/${userId}`);
          
          const pendingRequests = requestsData.requests.filter(request => request.approved === false);
          console.log('Pending requests found:', pendingRequests.length);
          setRequests(pendingRequests);

          if (pendingRequests.length > 0) {
            const requestersData = await Promise.all(
              pendingRequests.map(async (request) => {
                try {
                  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/user/basic/${request.requesterId}`);
                  return { [request.requesterId]: data };
                } catch (err) {
                  console.error(`Error fetching requester ${request.requesterId}:`, err);
                  return { [request.requesterId]: { user: { name: 'Unknown User' } } };
                }
              })
            );
            setRequesters(Object.assign({}, ...requestersData));

            const propertiesData = await Promise.all(
              pendingRequests.map(async (request) => {
                try {
                  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/property/${request.propertyId}`);
                  return { [request.propertyId]: data };
                } catch (err) {
                  console.error(`Error fetching property ${request.propertyId}:`, err);
                  return { [request.propertyId]: { address: { addressLine1: 'Unknown', addressTown: '', addressCounty: '' } } };
                }
              })
            );
            setProperties(Object.assign({}, ...propertiesData));
          }

          setError(null);
        } catch (err) {
          setError('Failed to load approval requests');
          console.error('Error fetching Requests:', err);
        } finally {
          setLoading(false);
        }
      };
      
      await fetchData();
    } catch (err) {
      // Show error message if approval fails
      setSnackbar({
        open: true,
        message: 'Failed to approve request',
        severity: 'error'
      });
      console.error('Error approving request:', err);
    } finally {
      // Reset action in progress state
      setActionInProgress(null);
    }
  };

  /**
   * Handles declining (deleting) a request
   */
  const handleDecline = async (request) => {
    // Set action in progress to show loading state for this specific request
    setActionInProgress(request._id);
    try {
      // Delete the request
      await axios.delete(`${process.env.REACT_APP_API_URL}/request/${request._id}`);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Request declined successfully',
        severity: 'success'
      });
      
      // Fetch updated data to refresh the list
      const fetchData = async () => {
        try {
          setLoading(true);
          const { data: requestsData } = await axios.get(`${process.env.REACT_APP_API_URL}/request/approver/${userId}`);
          
          const pendingRequests = requestsData.requests.filter(request => request.approved === false);
          console.log('Pending requests found:', pendingRequests.length);
          setRequests(pendingRequests);

          if (pendingRequests.length > 0) {
            const requestersData = await Promise.all(
              pendingRequests.map(async (request) => {
                try {
                  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/user/basic/${request.requesterId}`);
                  return { [request.requesterId]: data };
                } catch (err) {
                  console.error(`Error fetching requester ${request.requesterId}:`, err);
                  return { [request.requesterId]: { user: { name: 'Unknown User' } } };
                }
              })
            );
            setRequesters(Object.assign({}, ...requestersData));

            const propertiesData = await Promise.all(
              pendingRequests.map(async (request) => {
                try {
                  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/property/${request.propertyId}`);
                  return { [request.propertyId]: data };
                } catch (err) {
                  console.error(`Error fetching property ${request.propertyId}:`, err);
                  return { [request.propertyId]: { address: { addressLine1: 'Unknown', addressTown: '', addressCounty: '' } } };
                }
              })
            );
            setProperties(Object.assign({}, ...propertiesData));
          }

          setError(null);
        } catch (err) {
          setError('Failed to load approval requests');
          console.error('Error fetching Requests:', err);
        } finally {
          setLoading(false);
        }
      };
      
      await fetchData();
    } catch (err) {
      // Show error message if decline fails
      setSnackbar({
        open: true,
        message: 'Failed to decline request',
        severity: 'error'
      });
      console.error('Error declining request:', err);
    } finally {
      // Reset action in progress state
      setActionInProgress(null);
    }
  };

  /**
   * Closes the snackbar notification
   */
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return; // Don't close on clickaway
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * Fetches fresh data for the requests list
   * This function is used for the refresh button
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all requests for the current approver
      const { data: requestsData } = await axios.get(`${process.env.REACT_APP_API_URL}/request/approver/${userId}`);
      
      // Filter to show only pending (unapproved) requests
      const pendingRequests = requestsData.requests.filter(request => request.approved === false);
      console.log('Pending requests found:', pendingRequests.length);
      setRequests(pendingRequests);

      // If there are pending requests, fetch additional data for each one
      if (pendingRequests.length > 0) {
        // Fetch requester information for each request
        const requestersData = await Promise.all(
          pendingRequests.map(async (request) => {
            try {
              const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/user/basic/${request.requesterId}`);
              return { [request.requesterId]: data };
            } catch (err) {
              console.error(`Error fetching requester ${request.requesterId}:`, err);
              return { [request.requesterId]: { user: { name: 'Unknown User' } } };
            }
          })
        );
        // Combine all requester data into one object
        setRequesters(Object.assign({}, ...requestersData));

        // Fetch property information for each request
        const propertiesData = await Promise.all(
          pendingRequests.map(async (request) => {
            try {
              const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/property/${request.propertyId}`);
              return { [request.propertyId]: data };
            } catch (err) {
              console.error(`Error fetching property ${request.propertyId}:`, err);
              return { [request.propertyId]: { address: { addressLine1: 'Unknown', addressTown: '', addressCounty: '' } } };
            }
          })
        );
        // Combine all property data into one object
        setProperties(Object.assign({}, ...propertiesData));
      }

      setError(null);
    } catch (err) {
      setError('Failed to load approval requests');
      console.error('Error fetching Requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if data fetching failed
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  // Show empty state message if no pending requests
  if (!Array.isArray(requests) || requests.length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={200} gap={2}>
        <Typography color="text.secondary">
          No pending approval requests found.
        </Typography>
      </Box>
    );
  }
  
  /**
   * Handles navigation to user profile pages
   */
  const handleProfileClick = (requesterId) => {
    const requesterData = requesters[requesterId];
    if (requesterId === userId) {
      // Navigate to current user's profile
      navigate('/profile');
    } else if (requesterData) {
      // Navigate to other user's profile
      navigate(`/profile/${requesterId}`);
    }
  };
  
  // Main component render
  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', pt: 3 }}>
      {/* Header with count and refresh button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Pending Approval Requests ({requests.length})
        </Typography>
        <Button 
          variant="outlined" 
          onClick={fetchData}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {requests.map((request) => {
        const property = properties[request.propertyId] || { address: { addressLine1: 'Loading...', addressTown: '', addressCounty: '' } };
        const requester = requesters[request.requesterId]?.user || { name: 'Unknown User' };
        const addressText = property ? 
          `${property.address.addressLine1}, ${property.address.addressTown}, ${property.address.addressCounty}` :
          'Loading address...';
        
        const propertyImage = property?.images?.[0]?.url;
        const isCurrentUser = requester?._id === userId;

        return (
          // Card for a single request
          <Card key={request._id} sx={{ mb: 2, position: 'relative' }}>
            {/* Container for card content with responsive layout */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, side-by-side on desktop
              height: { xs: 'auto', sm: 180 }
            }}>
              {/* Left side: User info and action controls */}
              <Box sx={{ flex: 1 }}>
                <CardContent sx={{ py: 2 }}>
                  {/* User avatar and request details layout */}
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    {/* User avatar with fallback to first letter of name */}
                    <Avatar
                      src={requester?.avatar?.url}
                      sx={{ width: 48, height: 48 }}
                    >
                      {requester?.name?.[0] || '?'}
                    </Avatar>

                    {/* Request details and action controls */}
                    <Box flex={1}>
                      {/* User name with link to profile */}
                      <Link
                        component="button"
                        variant="h6"
                        onClick={() => handleProfileClick(request.requesterId)}
                        sx={{
                          mb: 0.5,
                          textAlign: 'left',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          },
                          color: isCurrentUser ? 'primary.main' : 'text.primary' // Highlight current user
                        }}
                      >
                        {requester?.name || 'Unknown User'}
                        {isCurrentUser && ' (You)'} {/* Label if requester is current user */}
                      </Link>

                      {/* Request body text */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Requesting approval to bid on property
                      </Typography>
                      
                      {/* Property address */}
                      <Typography variant="body2" sx={{ mb: 1.5 }}>
                        {addressText}
                      </Typography>

                      {/* Amount input and action buttons */}
                      <Box display="flex" alignItems="center" gap={2}>
                        {/* Amount input field */}
                        <TextField
                          label="Amount"
                          type="number"
                          size="small"
                          value={request.amountAllowed === "0" ? "" : request.amountAllowed || ""} // Don't display "0"
                          onChange={(e) => handleAmountChange(request, e.target.value)}
                          sx={{ width: 150 }}
                          InputProps={{
                            inputProps: { min: 0 } // Prevents negative values
                          }}
                          placeholder="Enter amount"
                        />
                        
                        {/* Approve and Decline buttons */}
                        <Box display="flex" gap={1}>
                          {/* Approve button with loading state */}
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleApprove(request)}
                            disabled={actionInProgress === request._id} // Disable during action
                            startIcon={actionInProgress === request._id ? 
                              <CircularProgress size={20} color="inherit" /> : // Show spinner during action
                              <CheckIcon /> // Show check icon otherwise
                            }
                          >
                            Approve
                          </Button>

                          {/* Decline button with loading state */}
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDecline(request)}
                            disabled={actionInProgress === request._id} // Disable during action
                            startIcon={actionInProgress === request._id ? 
                              <CircularProgress size={20} color="inherit" /> : // Show spinner during action
                              <CloseIcon /> // Show close icon otherwise
                            }
                          >
                            Decline
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Box>

              {/* Right side: Property Image */}
              <Box sx={{ 
                width: { xs: '100%', sm: 250 }, 
                height: { xs: 200, sm: '100%' }, 
                position: 'relative',
                flexShrink: 0 // Prevent image container from shrinking
              }}>
                {/* Conditional rendering based on image availability */}
                {propertyImage ? (
                  // If image is available, display it
                  <CardMedia
                    component="img"
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover', // Maintain aspect ratio and fill container
                    }}
                    image={propertyImage}
                    alt={`Property at ${addressText}`}
                  />
                ) : (
                  // If no image is available, display a placeholder
                  <Box
                    sx={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100', // Light gray background
                    }}
                  >
                    <BrokenImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                )}
              </Box>
            </Box>
          </Card>
        );
      })}

      {/* Notification system for user feedback */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} // Auto close after 6 seconds
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position at bottom center
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} // Controls the color/icon (success, error, etc.)
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovalList;