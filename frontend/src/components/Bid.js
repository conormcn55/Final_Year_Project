import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Button, Card, CardContent, Divider, CircularProgress } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import DOMPurify from 'dompurify';
import io from 'socket.io-client';
import useUserData from '../utils/useUserData';
import BidBot from './BidBot';
import BidHistory from './BidHistory';

export default function Bid() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bid, setBid] = useState("");
  const [latestBid, setLatestBid] = useState({ bid: null });
  const [approver, setApprover] = useState(null);
  const [guidePrice, setGuidePrice] = useState(null);
  const [saleDate, setSaleDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [room, setRoom] = useState(id);
  const [animateUpdate, setAnimateUpdate] = useState(false);
  const [error, setError] = useState("");
  const [bids, setBids] = useState([]);
  const [isApproved, setIsApproved] = useState();
  const [winningBid, setWinningBid] = useState(null);
  const { _id: userId, name: userName } = useUserData();
  const [requestPending, setRequestPending] = useState(false);
  const [amountAllowed, setAmountAllowed] = useState(null);
  const [biddingEnded, setBiddingEnded] = useState(false);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Refs to track state without causing re-renders
  const refreshInProgress = useRef(false);
  const latestBidRef = useRef(null);
  const winningBidRef = useRef(null);
  
  // Update refs when state changes
  useEffect(() => {
    latestBidRef.current = latestBid?.bid;
    winningBidRef.current = winningBid;
  }, [latestBid, winningBid]);

  // Sort bids by time (most recent first)
  const sortBidsByTime = (bidsArray) => {
    return [...bidsArray].sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  // Function to refresh bid history with debounce control
  const refreshBidHistory = useCallback(async () => {
    // Only refresh if not already in progress
    if (refreshInProgress.current) return;
    
    try {
      refreshInProgress.current = true;
      
      const bidsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/bids/propertyBid/${id}`);
      const sanitizedBids = bidsResponse.data.map(bid => ({
        ...bid,
        userName: DOMPurify.sanitize(bid.userName)
      }));
      
      setBids(sortBidsByTime(sanitizedBids));
      
      // Update winning bidder
      if (sanitizedBids.length > 0) {
        const sortedBids = sortBidsByTime(sanitizedBids);
        const recentBid = sortedBids[0]; // Most recent bid after sorting
        setWinningBid(recentBid.userId);
      }
      
    } catch (err) {
      console.error('Error refreshing bids:', err);
    } finally {
      // Wait a bit before allowing another refresh
      setTimeout(() => {
        refreshInProgress.current = false;
      }, 500);
    }
  }, [id]);

  // Socket connection setup
  useEffect(() => {
    // Clean any previous socket connections to prevent duplicates
    let socketInstance = null;
    
    const setupSocket = () => {
      console.log("Setting up socket connection...");
      
      // Create socket instance with retry settings
      socketInstance = io(process.env.REACT_APP_SOCKET_URL, {
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
        timeout: 10000
      });
      
      // Connection event handlers
      socketInstance.on("connect", () => {
        console.log(`Socket connected: ${socketInstance.id}`);
        setSocketConnected(true);
        setError("");
        
        // Join auction room
        socketInstance.emit("join_room", id);
        console.log(`Joined auction room: ${id}`);
      });
      
      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setSocketConnected(false);
        setError(`Connection issue: Please refresh. (${err.message})`);
      });
      
      socketInstance.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        setSocketConnected(false);
        
        if (reason === "io server disconnect") {
          // Server disconnected us, try to reconnect
          socketInstance.connect();
        }
      });
      
      // Bid update handler
      socketInstance.on("receive_bid", (data) => {
        console.log("Received bid update:", data);
        if (data.room === id) {
          // Only update if it's a new bid value
          if (latestBidRef.current !== data.bid) {
            setLatestBid({ bid: data.bid });
            
            if (data.newSaleDate) {
              setSaleDate(data.newSaleDate);
            }
            
            setAnimateUpdate(true);
            setTimeout(() => setAnimateUpdate(false), 1000);
            
            // Refresh bid history only when necessary
            if (!refreshInProgress.current) {
              refreshBidHistory();
            }
          }
        }
      });
      
      return socketInstance;
    };
    
    // Setup socket connection
    socketInstance = setupSocket();
    setSocket(socketInstance);
    
    // Cleanup on component unmount
    return () => {
      console.log("Cleaning up socket connection");
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [id, refreshBidHistory]);

  // Initial property data load
  useEffect(() => {
    const fetchPropertyInfo = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/property/${id}`);
        setLatestBid({ bid: data.currentBid.amount });
        setGuidePrice(data.guidePrice);
        setApprover(data.listedBy.listerID);
        setSaleDate(data.saleDate);
        
        const saleTime = new Date(data.saleDate);
        const now = new Date();
        if (saleTime < now && !data.sold) {
          try {
            await axios.put(`${process.env.REACT_APP_API_URL}/property/sold/${id}`);
            setBiddingEnded(true);
          } catch (error) {
            console.error('Error marking property as sold:', error);
          }
        }

        await refreshBidHistory();
        
        if (userId) {
          try {
            const approvalResponse = await axios.get(`${process.env.REACT_APP_API_URL}/request/check/${userId}/${id}`);
            setIsApproved(approvalResponse.data.approved);
            setRequestPending(approvalResponse.data.exists && !approvalResponse.data.approved);
            setAmountAllowed(approvalResponse.data.amountAllowed);
          } catch (err) {
            console.error('Error checking approval status:', err);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property info:', err);
        setError('Failed to load property information. Please try refreshing the page.');
        setLoading(false);
      }
    };
    
    fetchPropertyInfo();
  }, [id, userId, refreshBidHistory]);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      if (saleDate) {
        const now = new Date();
        const saleTime = new Date(saleDate);
        const timeDiff = saleTime - now;

        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          const seconds = Math.floor((timeDiff / 1000) % 60);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("Bidding has ended for this property.");
          setBiddingEnded(true);
 
          const markPropertyAsSold = async () => {
            try {
              await axios.put(`${process.env.REACT_APP_API_URL}/property/sold/${id}`);
            } catch (error) {
              console.error('Error marking property as sold:', error);
            }
          };

          markPropertyAsSold();
        }
      }
    };

    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [saleDate, id]);

  // Function to parse various bid formats
  const parseBidAmount = (bidInput) => {
    if (!bidInput) return 0;
    
    // Remove euro symbol if present
    let cleanBid = bidInput.toString().replace(/€/g, '');
    
    // Remove commas and spaces
    cleanBid = cleanBid.replace(/,/g, '').replace(/\s/g, '');
    
    // Convert to number
    return parseFloat(cleanBid);
  };

  // Submit bid function
  const submitBid = async (event) => {
    // Prevent default form submission behavior
    if (event) event.preventDefault();
    
    try {
      if (!userId || !userName) {
        setError("User details not found. Please login again.");
        return;
      }

      if (!socketConnected) {
        setError("Connection to bidding server lost. Please refresh the page.");
        return;
      }

      // Parse the bid amount
      const bidAmount = parseBidAmount(bid);
      const currentBid = parseFloat(latestBid.bid);

      if (isNaN(bidAmount) || bidAmount <= 0) {
        setError("Please enter a valid bid amount.");
        return;
      }

      if (bidAmount <= currentBid) {
        setError("Your bid must be higher than the current bid.");
        return;
      }

      if (bidAmount > amountAllowed) {
        setError(`Your bid cannot exceed your approved limit of €${amountAllowed.toLocaleString()}`);
        return;
      }

      const bidData = {
        userName: DOMPurify.sanitize(userName),
        userId,
        propertyId: id,
        amount: bidAmount,
        time: new Date().toISOString()
      };

      // Submit bid to API using axios
      const bidResponse = await axios.post(`${process.env.REACT_APP_API_URL}/bids/newbid`, bidData);
      const newBid = bidResponse.data;
      
      // Update property with new bid
      const propertyUpdateResponse = await axios.put(`${process.env.REACT_APP_API_URL}/property/${id}/bid`, {
        bidId: newBid._id,
        amount: bidAmount
      });

      const updatedProperty = propertyUpdateResponse.data;
      setSaleDate(updatedProperty.property.saleDate);

      // Emit socket event for real-time updates
      socket.emit("submit_bid", { 
        bid: bidAmount, 
        room: id, 
        userName: DOMPurify.sanitize(userName),
        userId, // Include userId in emit
        newSaleDate: updatedProperty.property.saleDate
      });

      // Update local state
      setLatestBid({ bid: bidAmount });
      setBid("");
      setError("");

      // Visual feedback
      setAnimateUpdate(true);
      setTimeout(() => setAnimateUpdate(false), 1000);
      
      // Wait a moment before refreshing to avoid sync issues
      setTimeout(() => {
        if (!refreshInProgress.current) {
          refreshBidHistory();
        }
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit bid');
      console.error('Error submitting bid:', err);
    }
  };

  // Request approval function
  const requestApproval = async (event) => {
    // Prevent default form submission behavior
    if (event) event.preventDefault();
    
    // Redirect to login if not logged in
    if (!userId) {
      window.location.href = `${process.env.REACT_APP_API_URL}/user/auth/google`;
      return;
    }
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/request/new`, {
        requesterId: userId,
        approverId: approver,
        propertyId: id
      });
      setRequestPending(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit approval request');
      console.error('Error submitting approval request:', err);
    }
  };

  // Message seller function
  const handleMessageSeller = async (event) => {
    // Prevent default form submission behavior
    if (event) event.preventDefault();
    
    // Redirect to login if not logged in
    if (!userId) {
      window.location.href = `${process.env.REACT_APP_API_URL}/user/auth/google`;
      return;
    }
    
    try {
      const roomResponse = await axios.post(`${process.env.REACT_APP_API_URL}/room/new`, {
        bidder: userId,
        owner: approver
      });
  
      if (roomResponse.data && (roomResponse.data._id || roomResponse.data.message === "Room already exists")) {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      
      if (error.response && error.response.data.message === "Room already exists") {
        navigate('/messages');
      } else {
        setError('Failed to create messaging room. Please try again.');
      }
    }
  };
  
  // Direct login URL matching the one in NavBar
  const loginUrl = `${process.env.REACT_APP_API_URL}/user/auth/google`;
  
  return (
    <Box>
      <Card sx={{ position: 'sticky', top: '1rem' }}>
        <CardContent sx={{ p: { xs: 2, md: 1.5 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ 
                mb: 2, 
                p: 1.5, 
                bgcolor: '#123871', 
                borderRadius: 1,
                color: 'white',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <CalendarToday sx={{ color: 'white', fontSize: '1rem' }} />
                  <Typography variant="subtitle1" sx={{ color: 'white' }}>
                    Auction Ends In:
                  </Typography>
                </Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    animation: animateUpdate ? 'flash 0.5s ease-in-out' : 'none',
                    '@keyframes flash': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 }
                    }
                  }}
                >
                  {timeLeft}
                </Typography>
              </Box>
      
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Guide Price: €{guidePrice?.toLocaleString()}
              </Typography>
      
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  animation: animateUpdate ? 'flash 0.5s ease-in-out' : 'none',
                  '@keyframes flash': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 }
                  }
                }}
              >
                Current Bid: €{latestBid?.bid?.toLocaleString() || "N/A"}
              </Typography>
      
              {biddingEnded && winningBid === userId ? (
                <Box sx={{ 
                  bgcolor: '#4CAF50', 
                  color: 'white', 
                  p: 2, 
                  borderRadius: 1, 
                  textAlign: 'center',
                  mb: 2 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Congratulations! 
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    You have won this property auction.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ 
                      bgcolor: 'white', 
                      color: '#123871',
                      '&:hover': {
                        bgcolor: '#f0f0f0'
                      }
                    }}
                    onClick={handleMessageSeller}
                  >
                    Message Seller
                  </Button>
                </Box>
              ) : (
                !biddingEnded && (
                  <Box sx={{ mb: 2 }}>
                    {error && (
                      <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
                        {error}
                      </Typography>
                    )}
      
                    {isApproved ? (
                      <form onSubmit={submitBid}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          Your approved bid limit: €{amountAllowed?.toLocaleString()}
                        </Typography>
                        <TextField
                          color='text.primary'
                          size="small"
                          fullWidth
                          label="Enter Bid"
                          value={bid}
                          onChange={(event) => {
                            setBid(event.target.value);
                          }}
                          sx={{ mb: 1 }}
                          placeholder="e.g. 100,000 or 100000"
                          inputProps={{
                            inputMode: 'text',
                          }}
                        />
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          type="submit"
                          disabled={!bid || !socketConnected}
                          sx={{ 
                            bgcolor: '#123871',
                            color: "white"
                          }}
                        >
                          Submit Bid
                        </Button>
                        <BidBot 
                          propertyId={id} 
                          userId={userId} 
                          userName={userName} 
                          currentBid={latestBid?.bid} 
                          amountAllowed={amountAllowed} 
                          lastBidderId={winningBid}
                          socket={socket}
                          socketConnected={socketConnected}
                          onBidSubmit={(newBidAmount) => {
                            setLatestBid({ bid: newBidAmount }); 
                            setError('');
                            // Add delay to avoid multiple refreshes
                            setTimeout(() => {
                              if (!refreshInProgress.current) {
                                refreshBidHistory();
                              }
                            }, 300);
                          }} 
                          onError={(errorMessage) => { 
                            setError(errorMessage); 
                          }} 
                        />
                      </form>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 1,
                            color: requestPending ? '#666' : '#123871'
                          }}
                        >
                          {requestPending 
                            ? ''
                            : (userId ? 'You need approval to place bids on this property' : 'Please log in to bid on this property')}
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          onClick={requestPending ? null : requestApproval}
                          disabled={requestPending}
                          href={requestPending ? undefined : (!userId ? loginUrl : undefined)}
                          sx={{ 
                            color: "white",
                            bgcolor: requestPending ? '#ccc' : '#123871',
                            '&:hover': {
                              bgcolor: requestPending ? '#ccc' : '#1a4c94'
                            },
                            '&.Mui-disabled': {
                              bgcolor: '#ccc',
                              color: '#666'
                            }
                          }}
                        >
                          {requestPending ? 'Approval Pending' : (userId ? 'Request Approval' : 'Sign In')}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )
              )}
      
              <BidHistory bids={bids} />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}