import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Avatar, Button, TextField, Link, Snackbar, Alert, CircularProgress, Box } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import useUserData from '../utils/useUserData';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ApprovalList = () => {
    const { _id: userId } = useUserData();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [requesters, setRequesters] = useState({});
    const [properties, setProperties] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: requestsData } = await axios.get(`${process.env.REACT_APP_API_URL}/request/approver/${userId}`);
      
      // Filter for unapproved requests only
      const pendingRequests = requestsData.requests.filter(request => request.approved === false);
      console.log('Pending requests found:', pendingRequests.length);
      setRequests(pendingRequests);

      // Only fetch user and property data for pending requests to improve performance
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

  const handleAmountChange = (request, newAmount) => {
    const updatedRequests = requests.map(req => 
      req._id === request._id 
        ? { ...req, amountAllowed: newAmount } 
        : req
    );
    setRequests(updatedRequests);
  };

  const handleApprove = async (request) => {
    setActionInProgress(request._id);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/request/edit/${request._id}`, {
        amountAllowed: request.amountAllowed,
        approved: true
      });
      setSnackbar({
        open: true,
        message: 'Request approved successfully',
        severity: 'success'
      });
      await fetchData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to approve request',
        severity: 'error'
      });
      console.error('Error approving request:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDecline = async (request) => {
    setActionInProgress(request._id);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/request/${request._id}`);
      setSnackbar({
        open: true,
        message: 'Request declined successfully',
        severity: 'success'
      });
      await fetchData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to decline request',
        severity: 'error'
      });
      console.error('Error declining request:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  if (!Array.isArray(requests) || requests.length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={200} gap={2}>
        <Typography color="text.secondary">
          No pending approval requests found.
        </Typography>

      </Box>
    );
  }
  
  const handleProfileClick = (requesterId) => {
    const requesterData = requesters[requesterId];
    if (requesterId === userId) {
      navigate('/profile');
    } else if (requesterData) {
      navigate(`/profile/${requesterId}`);
    }
  };
  
  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', pt: 3 }}>
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
          <Card key={request._id} sx={{ mb: 2, position: 'relative' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              height: { xs: 'auto', sm: 180 }
            }}>
              {/* Content */}
              <Box sx={{ flex: 1 }}>
                <CardContent sx={{ py: 2 }}>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Avatar
                      src={requester?.avatar?.url}
                      sx={{ width: 48, height: 48 }}
                    >
                      {requester?.name?.[0] || '?'}
                    </Avatar>

                    <Box flex={1}>
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
                          color: isCurrentUser ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {requester?.name || 'Unknown User'}
                        {isCurrentUser && ' (You)'}
                      </Link>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Requesting approval to bid on property
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1.5 }}>
                        {addressText}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={2}>
                        <TextField
                          label="Amount"
                          type="number"
                          size="small"
                          value={request.amountAllowed === "0" ? "" : request.amountAllowed || ""}
                          onChange={(e) => handleAmountChange(request, e.target.value)}
                          sx={{ width: 150 }}
                          InputProps={{
                            inputProps: { min: 0 }
                          }}
                          placeholder="Enter amount"
                        />
                        
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleApprove(request)}
                            disabled={actionInProgress === request._id}
                            startIcon={actionInProgress === request._id ? 
                              <CircularProgress size={20} color="inherit" /> : 
                              <CheckIcon />
                            }
                          >
                            Approve
                          </Button>

                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDecline(request)}
                            disabled={actionInProgress === request._id}
                            startIcon={actionInProgress === request._id ? 
                              <CircularProgress size={20} color="inherit" /> : 
                              <CloseIcon />
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

              {/* Property Image */}
              <Box sx={{ 
                width: { xs: '100%', sm: 250 },
                height: { xs: 200, sm: '100%' },
                position: 'relative',
                flexShrink: 0
              }}>
                {propertyImage ? (
                  <CardMedia
                    component="img"
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                    image={propertyImage}
                    alt={`Property at ${addressText}`}
                  />
                ) : (
                  <Box
                    sx={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
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

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovalList;