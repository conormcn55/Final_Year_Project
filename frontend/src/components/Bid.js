import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import DOMPurify from 'dompurify';
import io from 'socket.io-client';
import useUserData from '../utils/useUserData';
import BidBot from './BidBot';
import BidHistory from './BidHistory';

/**
 * Bid Component
 * This component handles the bidding functionality for a property auction, which is the core feature of the webiste.
 * It allows users to view current bids, bid history, set up the bidbot, and place their own bids if they have the necessary approval.
 */
export default function Bid() {
  // Get property ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for bid input and tracking
  const [bid, setBid] = useState(""); // User's input for a new bid
  const [latestBid, setLatestBid] = useState({ bid: null }); // Most recent bid on the property
  const [approver, setApprover] = useState(null); // ID of the property lister/seller
  const [guidePrice, setGuidePrice] = useState(null); // Starting guide price for the property
  const [saleDate, setSaleDate] = useState(null); // Date when the auction ends
  const [timeLeft, setTimeLeft] = useState(""); // Countdown timer display
  const [room, setRoom] = useState(id); // Socket room ID (same as property ID)
  const [animateUpdate, setAnimateUpdate] = useState(false); // Controls animation when bid updates
  const [error, setError] = useState(""); // Error message display
  const [bids, setBids] = useState([]); // Array of all bids for this property
  const [isApproved, setIsApproved] = useState(); // Whether current user is approved to bid
  const [winningBid, setWinningBid] = useState(null); // ID of user with highest bid
  
  // User information from custom hook
  const { _id: userId, name: userName } = useUserData();
  
  // States for user interaction and UI
  const [requestPending, setRequestPending] = useState(false); // Whether approval request is pending
  const [amountAllowed, setAmountAllowed] = useState(null); // Max bid amount user is approved for
  const [biddingEnded, setBiddingEnded] = useState(false); // Whether auction has ended
  const [socket, setSocket] = useState(null); // Socket.io connection
  const [socketConnected, setSocketConnected] = useState(false); // Whether socket is connected
  const [loading, setLoading] = useState(true); // Initial loading state
  
  // Refs to track state without causing re-renders
  const refreshInProgress = useRef(false); // Prevents multiple simultaneous refreshes
  const latestBidRef = useRef(null); // Reference to latest bid for socket comparisons
  const winningBidRef = useRef(null); // Reference to winning bidder for comparisons
  
  // Update refs when state changes to keep them in sync
  useEffect(() => {
    latestBidRef.current = latestBid?.bid;
    winningBidRef.current = winningBid;
  }, [latestBid, winningBid]);

  /**
   * Sorts bids array by timestamp (most recent first)
   */
  const sortBidsByTime = (bidsArray) => {
    return [...bidsArray].sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  /**
   * Refreshes the bid history from the server
   * Implements debounce control to prevent excessive API calls
   */
  const refreshBidHistory = useCallback(async () => {
    // Only refresh if not already in progress (debounce mechanism)
    if (refreshInProgress.current) return;
    
    try {
      refreshInProgress.current = true;
      
      // Fetch latest bids for this property
      const bidsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/bids/propertyBid/${id}`);
      
      // Sanitize user names to prevent XSS attacks
      const sanitizedBids = bidsResponse.data.map(bid => ({
        ...bid,
        userName: DOMPurify.sanitize(bid.userName)
      }));
      
      // Update bids state with sorted array
      setBids(sortBidsByTime(sanitizedBids));
      
      // Update winning bidder information
      if (sanitizedBids.length > 0) {
        const sortedBids = sortBidsByTime(sanitizedBids);
        const recentBid = sortedBids[0]; // Most recent bid after sorting
        setWinningBid(recentBid.userId);
      }
      
    } catch (err) {
      console.error('Error refreshing bids:', err);
    } finally {
      // Wait a bit before allowing another refresh (continued debounce)
      setTimeout(() => {
        refreshInProgress.current = false;
      }, 500);
    }
  }, [id]);

  /**
   * Setup socket connection for real-time bidding updates
   * Establishes and manages WebSocket connection to the bidding server
   */
  useEffect(() => {
    // Clean any previous socket connections to prevent duplicates
    let socketInstance = null;
    
    const setupSocket = () => {
      console.log("Setting up socket connection...");
      
      // Create socket instance with retry settings for reliability
      socketInstance = io(process.env.REACT_APP_SOCKET_URL, {
        withCredentials: true,
        reconnectionAttempts: 5, // Try to reconnect 5 times
        reconnectionDelay: 1000, // Wait 1 second between attempts
        transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
        timeout: 10000 // 10 second connection timeout
      });
      
      // Connection event handlers
      socketInstance.on("connect", () => {
        console.log(`Socket connected: ${socketInstance.id}`);
        setSocketConnected(true);
        setError("");
        
        // Join the room for this specific property
        socketInstance.emit("join_room", id);
        console.log(`Joined auction room: ${id}`);
      });
      
      // Handle connection errors
      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setSocketConnected(false);
        setError(`Connection issue: Please refresh. (${err.message})`);
      });
      
      // Handle disconnections
      socketInstance.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        setSocketConnected(false);
        
        // If server deliberately disconnected us, try to reconnect
        if (reason === "io server disconnect") {
          socketInstance.connect();
        }
      });
      
      // Handle incoming bid updates from other users
      socketInstance.on("receive_bid", (data) => {
        console.log("Received bid update:", data);
        if (data.room === id) {
          // Only update if it's a new bid value (prevents duplicate updates)
          if (latestBidRef.current !== data.bid) {
            setLatestBid({ bid: data.bid });
            
            // Update sale date if it was extended
            if (data.newSaleDate) {
              setSaleDate(data.newSaleDate);
            }
            
            // Provide visual feedback for the update
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

  /**
   * Fetch initial property information and user approval status
   */
  useEffect(() => {
    const fetchPropertyInfo = async () => {
      try {
        setLoading(true);
        
        // Get property details
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/property/${id}`);
        setLatestBid({ bid: data.currentBid.amount });
        setGuidePrice(data.guidePrice);
        setApprover(data.listedBy.listerID);
        setSaleDate(data.saleDate);
        
        // Check if auction has ended
        const saleTime = new Date(data.saleDate);
        const now = new Date();
        if (saleTime < now && !data.sold) {
          // Mark property as sold if auction time has passed
          try {
            await axios.put(`${process.env.REACT_APP_API_URL}/property/sold/${id}`);
            setBiddingEnded(true);
          } catch (error) {
            console.error('Error marking property as sold:', error);
          }
        }

        // Get bid history
        await refreshBidHistory();
        
        // Check if user is approved to bid on this property
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

  /**
   * Updates the countdown timer for the auction
   * Runs every second to show remaining time
   */
  useEffect(() => {
    const updateCountdown = () => {
      if (saleDate) {
        const now = new Date();
        const saleTime = new Date(saleDate);
        const timeDiff = saleTime - now;

        if (timeDiff > 0) {
          // Calculate and format remaining time
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          const seconds = Math.floor((timeDiff / 1000) % 60);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          // Auction has ended
          setTimeLeft("Bidding has ended for this property.");
          setBiddingEnded(true);
 
          // Mark property as sold in database
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

    // Update countdown every second
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [saleDate, id]);

  /**
   * Parses and sanitizes bid input from user
   */
  const parseBidAmount = (bidInput) => {
    if (!bidInput) return 0;
    
    // Remove currency symbol if present
    let cleanBid = bidInput.toString().replace(/€/g, '');
    
    // Remove commas and spaces for proper parsing
    cleanBid = cleanBid.replace(/,/g, '').replace(/\s/g, '');
    
    return parseFloat(cleanBid);
  };

  /**
   * Handles bid submission
   */
  const submitBid = async (event) => {
    if (event) event.preventDefault();
    
    try {
      // Verify user is logged in
      if (!userId || !userName) {
        setError("User details not found. Please login again.");
        return;
      }

      // Verify socket connection is active
      if (!socketConnected) {
        setError("Connection to bidding server lost. Please refresh the page.");
        return;
      }

      // Parse and validate the bid amount
      const bidAmount = parseBidAmount(bid);
      const currentBid = parseFloat(latestBid.bid);

      // Validate bid is a positive number
      if (isNaN(bidAmount) || bidAmount <= 0) {
        setError("Please enter a valid bid amount.");
        return;
      }

      // Validate bid is higher than current bid
      if (bidAmount <= currentBid) {
        setError("Your bid must be higher than the current bid.");
        return;
      }

      // Validate bid is within user's approved limit
      if (bidAmount > amountAllowed) {
        setError(`Your bid cannot exceed your approved limit of €${amountAllowed.toLocaleString()}`);
        return;
      }

      // Prepare bid data - sanitize user name for security
      const bidData = {
        userName: DOMPurify.sanitize(userName),
        userId,
        propertyId: id,
        amount: bidAmount,
        time: new Date().toISOString()
      };

      // Submit bid to API
      const bidResponse = await axios.post(`${process.env.REACT_APP_API_URL}/bids/newbid`, bidData);
      const newBid = bidResponse.data;
      
      // Update property with new bid information
      const propertyUpdateResponse = await axios.put(`${process.env.REACT_APP_API_URL}/property/${id}/bid`, {
        bidId: newBid._id,
        amount: bidAmount
      });

      // Get updated property data (may include extended auction time)
      const updatedProperty = propertyUpdateResponse.data;
      setSaleDate(updatedProperty.property.saleDate);

      // Emit socket event to notify other users of the bid in real-time
      socket.emit("submit_bid", { 
        bid: bidAmount, 
        room: id, 
        userName: DOMPurify.sanitize(userName),
        userId, // Include userId in emit to track winning bidder
        newSaleDate: updatedProperty.property.saleDate
      });

      // Update local state
      setLatestBid({ bid: bidAmount });
      setBid(""); // Clear input field
      setError(""); // Clear any error messages

      // Visual feedback for successful bid
      setAnimateUpdate(true);
      setTimeout(() => {
        if (!refreshInProgress.current) {
          refreshBidHistory();
        }
      }, 300);
    } catch (err) {
      // Handle any errors during bid submission
      setError(err.response?.data?.message || err.message || 'Failed to submit bid');
      console.error('Error submitting bid:', err);
    }
  };

  /**
   * Handles approval request process
   */
  const requestApproval = async (event) => {
    // Prevent default form submission behavior
    if (event) event.preventDefault();
    
    // Redirect to login if not logged in
    if (!userId) {
      window.location.href = `${process.env.REACT_APP_API_URL}/user/auth/google`;
      return;
    }
    
    try {
      // Submit approval request to the server
      await axios.post(`${process.env.REACT_APP_API_URL}/request/new`, {
        requesterId: userId,     // Current user requesting approval
        approverId: approver,    // Property lister who needs to approve
        propertyId: id           // Property being bid on
      });
      
      // Update UI to show pending status
      setRequestPending(true);
    } catch (err) {
      // Handle errors during request submission
      setError(err.response?.data?.message || err.message || 'Failed to submit approval request');
      console.error('Error submitting approval request:', err);
    }
  };
  /**
   * Handles creating a messaging room with the property seller
   */
  const handleMessageSeller = async (event) => {
    // Prevent default button behavior
    if (event) event.preventDefault();
    
    // Redirect to login if not logged in
    if (!userId) {
      window.location.href = `${process.env.REACT_APP_API_URL}/user/auth/google`;
      return;
    }
    
    try {
      // Create or get existing messaging room
      const roomResponse = await axios.post(`${process.env.REACT_APP_API_URL}/room/new`, {
        bidder: userId,    // Current user (potential buyer)
        owner: approver    // Property owner/seller
      });
  
      // Navigate to messages page if room created or already exists
      if (roomResponse.data && (roomResponse.data._id || roomResponse.data.message === "Room already exists")) {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      
      // Handle special case where room already exists
      if (error.response && error.response.data.message === "Room already exists") {
        navigate('/messages');
      } else {
        setError('Failed to create messaging room. Please try again.');
      }
    }
  };
  
  // Define login URL to match the one in NavBar for consistency
  const loginUrl = `${process.env.REACT_APP_API_URL}/user/auth/google`;
  
  /**
   * Component render method
   * Displays different UI states based on auction status and user permissions
   */
  return (
    <Box>
      {/* Card with sticky positioning to keep bid interface visible while scrolling */}
      <Card sx={{ position: 'sticky', top: '1rem' }}>
        <CardContent sx={{ p: { xs: 2, md: 1.5 } }}>
          {/* Show loading indicator while data is being fetched */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Auction countdown timer section */}
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
                {/* Countdown timer with flash animation when updated */}
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
      
              {/* Property guide price information */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Guide Price: €{guidePrice?.toLocaleString()}
              </Typography>
      
              {/* Current bid with flash animation when updated */}
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
      
              {/* Conditional rendering based on auction state */}
              {/* Case 1: User has won the auction */}
              {biddingEnded && winningBid === userId ? (
                <Box sx={{ 
                  bgcolor: '#4CAF50',  // Green success color
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
                  {/* Button to message seller after winning */}
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
                // Case 2: Auction is still active
                !biddingEnded && (
                  <Box sx={{ mb: 2 }}>
                    {/* Error message display */}
                    {error && (
                      <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
                        {error}
                      </Typography>
                    )}
      
                    {/* Case 2a: User is approved to bid */}
                    {isApproved ? (
                      <form onSubmit={submitBid}>
                        {/* Show user's approved bid limit */}
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          Your approved bid limit: €{amountAllowed?.toLocaleString()}
                        </Typography>
                        {/* Bid input field */}
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
                            inputMode: 'text',  // Better for numeric input with formatting
                          }}
                        />
                        {/* Bid submission button */}
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          type="submit"
                          disabled={!bid || !socketConnected}  // Disabled if no bid or no connection
                          sx={{ 
                            bgcolor: '#123871',
                            color: "white"
                          }}
                        >
                          Submit Bid
                        </Button>
                        {/* BidBot component for automated bidding */}
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
                      // Case 2b: User is not approved to bid
                      <Box sx={{ textAlign: 'center' }}>
                        {/* Different guidance text based on user state */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 1,
                            color: requestPending ? '#666' : '#123871'
                          }}
                        >
                          {requestPending 
                            ? ''  // No message if request is pending
                            : (userId ? 'You need approval to place bids on this property' : 'Please log in to bid on this property')}
                        </Typography>
                        {/* Button that adapts to user state: pending, needs approval, or needs login */}
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
      
              {/* Bid history component showing all bids */}
              <BidHistory bids={bids} />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}