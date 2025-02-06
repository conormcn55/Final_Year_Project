import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, IconButton, Divider } from '@mui/material';
import { CalendarToday, ExpandMore, ExpandLess } from '@mui/icons-material';
import DOMPurify from 'dompurify';
import io from 'socket.io-client';
import useUserData from '../utils/useUserData';
import BidBot from './BidBot';
const socket = io.connect("http://localhost:3002");

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-IE', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

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
  const [showBids, setShowBids] = useState(false);
  const [isApproved, setIsApproved] = useState();
  const [winningBid, setWinningBid] = useState(null);
  const { _id: userId, name: userName } = useUserData();
  const [requestPending, setRequestPending] = useState(false);
  const [amountAllowed, setAmountAllowed] = useState(null);
  const [biddingEnded, setBiddingEnded] = useState(false);

  const sortBidsByTime = (bidsArray) => {
    return [...bidsArray].sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  useEffect(() => {
    const fetchPropertyInfo = async () => {
      if (userId) {
        try {
          const { data } = await axios.get(`http://localhost:3001/api/property/${id}`);
          setLatestBid({ bid: data.currentBid.amount });
          setGuidePrice(data.guidePrice);
          setApprover(data.listedBy.listerID);
          setSaleDate(data.saleDate);
          const saleTime = new Date(data.saleDate);
          const now = new Date();
          if (saleTime < now && !data.sold) {
            try {
              await axios.put(`http://localhost:3001/api/property/sold/${id}`);
              setBiddingEnded(true);
            } catch (error) {
              console.error('Error marking property as sold:', error);
            }
          }
  
          const approvalResponse = await axios.get(`http://localhost:3001/api/request/check/${userId}/${id}`);
          setIsApproved(approvalResponse.data.approved);
          setRequestPending(approvalResponse.data.exists && !approvalResponse.data.approved);
          setAmountAllowed(approvalResponse.data.amountAllowed);
  
          const bidsResponse = await axios.get(`http://localhost:3001/api/bids/propertyBid/${id}`);
          const sanitizedBids = bidsResponse.data.map(bid => ({
            ...bid,
            userName: DOMPurify.sanitize(bid.userName)
          }));
          setBids(sortBidsByTime(sanitizedBids));
        } catch (err) {
          console.error('Error fetching property info:', err);
        }
      }
    };
    fetchPropertyInfo();
  }, [id, userId]);

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
              await axios.put(`http://localhost:3001/api/property/sold/${id}`);
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
  }, [saleDate]);

  const submitBid = async () => {
    try {
      if (!userId || !userName) {
        setError("User details not found. Please login again.");
        return;
      }

      const bidAmount = parseFloat(bid);
      const currentBid = parseFloat(latestBid.bid);

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

      const bidResponse = await fetch('http://localhost:3001/api/bids/newbid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bidData)
      });

      if (!bidResponse.ok) {
        const errorData = await bidResponse.json();
        throw new Error(errorData.message || 'Failed to submit bid to API');
      }

      const newBid = await bidResponse.json();
      
      const propertyUpdateResponse = await fetch(`http://localhost:3001/api/property/${id}/bid`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bidId: newBid._id,
          amount: bidAmount
        })
      });

      if (!propertyUpdateResponse.ok) {
        throw new Error('Failed to update property with new bid');
      }

      const updatedProperty = await propertyUpdateResponse.json();
      setSaleDate(updatedProperty.property.saleDate);

      socket.emit("submit_bid", { 
        bid: bidAmount, 
        room, 
        userName: DOMPurify.sanitize(userName),
        newSaleDate: updatedProperty.property.saleDate
      });

      setLatestBid({ bid: bidAmount });
      setBid("");
      setError("");

      const bidsResponse = await axios.get(`http://localhost:3001/api/bids/propertyBid/${id}`);
      const sanitizedBids = bidsResponse.data.map(bid => ({
        ...bid,
        userName: DOMPurify.sanitize(bid.userName)
      }));
      setBids(sortBidsByTime(sanitizedBids));

      setAnimateUpdate(true);
      setTimeout(() => setAnimateUpdate(false), 1000);
    } catch (err) {
      setError(err.message || 'Failed to submit bid');
      console.error('Error submitting bid:', err);
    }
  };

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  useEffect(() => {
    joinRoom();

    socket.on("receive_bid", (data) => {
      setLatestBid({ bid: data.bid });
      if (data.newSaleDate) {
        setSaleDate(data.newSaleDate);
      }
    });

    return () => {
      socket.off("receive_bid");
    };
  }, [socket, room]);

  const toggleBids = () => {
    setShowBids(!showBids);
  };

  const requestApproval = async () => {
    try {
      await axios.post(`http://localhost:3001/api/request/new`, {
        requesterId: userId,
        approverId: approver,
        propertyId: id
      });
      setRequestPending(true);
    } catch (err) {
      setError(err.message || 'Failed to submit approval request');
      console.error('Error submitting approval request:', err);
    }
  };

  useEffect(() => {
    if (bids && bids.length > 0) {
      const recentBid = bids.reduce((latest, bid) => {
        return new Date(bid.time) > new Date(latest.time) ? bid : latest;
      });
      setWinningBid(recentBid.userId);
    }
  }, [bids]);

  const handleMessageSeller = async () => {
    try {
      const roomResponse = await axios.post('http://localhost:3001/api/room/new', {
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

  return (
    <Box>
      <Card sx={{ position: 'sticky', top: '1rem' }}>
        <CardContent sx={{ p: { xs: 2, md: 1.5 } }}>
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
  
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
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
                  <>
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
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={submitBid}
                      disabled={!bid}
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
                      onBidSubmit={(newBidAmount) => {
                        setLatestBid({ bid: newBidAmount }); 
                        setError('');
                        
                        const refreshBids = async () => {
                          try {
                            const bidsResponse = await axios.get(`http://localhost:3001/api/bids/propertyBid/${id}`);
                            const sanitizedBids = bidsResponse.data.map(bid => ({
                              ...bid,
                              userName: DOMPurify.sanitize(bid.userName)
                            }));
                            setBids(sortBidsByTime(sanitizedBids));
                          } catch (err) {
                            console.error('Error refreshing bids:', err);
                          }
                        };
                        
                        refreshBids();
                      }} 
                      onError={(errorMessage) => { 
                        setError(errorMessage); 
                      }} 
                    />
                  </>
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
                        : 'You need approval to place bids on this property'}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={requestApproval}
                      disabled={requestPending}
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
                      {requestPending ? 'Approval Pending' : 'Request Approval'}
                    </Button>
                  </Box>
                )}
              </Box>
            )
          )}
  
          <Divider sx={{ mb: 2 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              gap: 0.5,
              fontWeight: 'bold'
            }}
            onClick={toggleBids}
          >
            {showBids ? <ExpandLess /> : <ExpandMore />}
            Bid History
          </Typography>
          <Collapse in={showBids}>
            {bids.length ? (
              <TableContainer 
                component={Paper}
                sx={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#555',
                    },
                  },
                }}
              >
                <Table 
                  size="small" 
                  aria-label="bid history"
                  stickyHeader
                >
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          bgcolor: '#f5f5f5',
                          fontWeight: 'bold'
                        }}
                      >
                        User
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          bgcolor: '#f5f5f5',
                          fontWeight: 'bold'
                        }}
                      >
                        Amount (€)
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          bgcolor: '#f5f5f5',
                          fontWeight: 'bold'
                        }}
                      >
                        Time
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bids.map((bid) => (
                      <TableRow 
                        key={bid._id}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: '#fafafa',
                          },
                        }}
                      >
                        <TableCell>{bid.userName}</TableCell>
                        <TableCell align="right">{bid.amount?.toLocaleString()}</TableCell>
                        <TableCell align="right">{new Date(bid.time).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" sx={{ mt: 1 }}>
                No bids have been placed yet.
              </Typography>
            )}
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
}