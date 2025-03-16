import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

/**
 * BidBot Component - An automated bidding assistant for property auctions
 * This component creates an automated bidding system that places bids on behalf of users
 * during property auctions. When activated, it monitors incoming bids and automatically
 * places counter-bids up to a user-defined limit.
 */
const BidBot = ({ 
  propertyId, 
  userId, 
  userName, 
  currentBid, 
  amountAllowed,
  lastBidderId,
  socket,
  socketConnected,
  onBidSubmit,
  onError 
}) => {
  // State for bid bot configuration
  const [bidBotLimit, setBidBotLimit] = useState(''); // Maximum bid limit
  const [bidIncrement, setBidIncrement] = useState('500'); // Default increment amount
  const [isBidBotActive, setIsBidBotActive] = useState(false); // Whether bidbot is running
  const [openDialog, setOpenDialog] = useState(false); // Dialog visibility
  const [isFirstBid, setIsFirstBid] = useState(true); // Track if first automatic bid

  // Refs to access latest state values in async callbacks
  const bidBotLimitRef = useRef(bidBotLimit);
  const bidIncrementRef = useRef(bidIncrement);
  const isBidBotActiveRef = useRef(isBidBotActive);
  const isFirstBidRef = useRef(isFirstBid);
  const processingBidRef = useRef(false); // Prevent concurrent bid submissions
  const currentBidRef = useRef(currentBid);
  const lastBidderIdRef = useRef(lastBidderId);
  const bidQueueRef = useRef([]); // Queue to store incoming bids that need processing
  const processingQueueRef = useRef(false); // Flag to indicate if queue is being processed

  // Update refs whenever state changes to ensure async functions use current values
  useEffect(() => {
    bidBotLimitRef.current = bidBotLimit;
    bidIncrementRef.current = bidIncrement;
    isBidBotActiveRef.current = isBidBotActive;
    isFirstBidRef.current = isFirstBid;
    currentBidRef.current = currentBid;
    lastBidderIdRef.current = lastBidderId;
  }, [bidBotLimit, bidIncrement, isBidBotActive, isFirstBid, currentBid, lastBidderId]);

  // Process bid queue
  const processQueue = async () => {
    if (processingQueueRef.current || bidQueueRef.current.length === 0) {
      return;
    }
    
    processingQueueRef.current = true;
    
    while (bidQueueRef.current.length > 0 && isBidBotActiveRef.current) {
      const { bidAmount, bidderId } = bidQueueRef.current.shift();
      
      // Only process if bid is still relevant (not outdated)
      if (parseFloat(bidAmount) >= parseFloat(currentBidRef.current)) {
        await handleAutomaticBid(bidAmount, bidderId);
      }
      
      // Small delay between processing queue items
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    processingQueueRef.current = false;
  };

  // Queue a bid for processing
  const queueBid = (bidAmount, bidderId) => {
    // Add to queue only if not already there
    if (!bidQueueRef.current.some(item => item.bidderId === bidderId && item.bidAmount === bidAmount)) {
      bidQueueRef.current.push({ bidAmount, bidderId });
      processQueue();
    }
  };

  // Monitor for bid updates that require automated responses
  useEffect(() => {
    if (
      isBidBotActiveRef.current && // BidBot is active
      lastBidderId && // Valid bidder exists
      lastBidderId !== userId &&  // Current user is not the last bidder
      parseFloat(currentBidRef.current) < parseFloat(bidBotLimitRef.current) // Current bid below limit
    ) {
      // Add random delay (1-5 seconds) to make bidding appear more human-like
      const delay = Math.random() * 4000 + 1000; 
      setTimeout(() => {
        // Double-check last bidder hasn't changed before submitting bid
        if (lastBidderIdRef.current !== userId) {
          queueBid(currentBidRef.current, lastBidderIdRef.current);
        }
      }, delay);
    }
  }, [currentBid, lastBidderId]);
  
  // Setup socket listeners for real-time bid updates
  useEffect(() => {
    if (!socket) return;

    // Handler for incoming bids via socket
    const handleReceiveBid = (data) => {
      if (data.room === propertyId && data.userId !== userId && isBidBotActiveRef.current) {
        console.log("BidBot received socket bid update:", data);
        if (data.bid && data.userId) {
          queueBid(data.bid, data.userId);
        }
      }
    };
    // Add event listener
    socket.on("receive_bid", handleReceiveBid);
    // Cleanup on unmount
    return () => {
      socket.off("receive_bid", handleReceiveBid);
    };
  }, [propertyId, userId, socket]);

  /**
   * Process automatic bid in response to competitor bids
   */
  const handleAutomaticBid = async (incomingBidAmount, incomingBidderId, retryCount = 0) => {
    // Prevent concurrent bid processing
    if (processingBidRef.current) {
      // Queue the bid instead of dropping it
      queueBid(incomingBidAmount, incomingBidderId);
      return;
    }
    
    processingBidRef.current = true;
    
    try {
      // Skip if the incoming bid is from the current user
      if (incomingBidderId === userId) {
        processingBidRef.current = false;
        return;
      }
      
      // Check connection status
      if (!socketConnected) {
        onError("Connection to bidding server lost. BidBot paused.");
        setIsBidBotActive(false);
        processingBidRef.current = false;
        return;
      }
      
      // Get the latest bid amount from the system
      const latestBidAmount = Math.max(
        parseFloat(incomingBidAmount), 
        parseFloat(currentBidRef.current)
      );
      
      // Parse numeric values
      const limitNum = parseFloat(bidBotLimitRef.current);
      const incrementNum = parseFloat(bidIncrementRef.current);
      let nextBidAmount;
      
      // Calculate next bid amount differently for first vs subsequent bids
      if (isFirstBidRef.current) {
        // For first bid, round up to next increment multiple
        nextBidAmount = Math.min(
          Math.ceil((latestBidAmount + 1) / incrementNum) * incrementNum,
          limitNum
        );
        setIsFirstBid(false);
      } else {
        // For subsequent bids, simply add the increment
        nextBidAmount = Math.min(
          latestBidAmount + incrementNum,
          limitNum
        );
      }
      
      // If retrying due to conflict, increase bid further
      if (retryCount > 0) {
        nextBidAmount = Math.min(
          nextBidAmount + (incrementNum * retryCount),
          limitNum
        );
      }
      
      console.log(`BidBot calculating: Current: ${latestBidAmount}, Next: ${nextBidAmount}, Limit: ${limitNum}`);
      
      // Proceed only if next bid is valid (higher than current, within limits)
      if (
        nextBidAmount > latestBidAmount &&
        nextBidAmount <= limitNum && 
        nextBidAmount <= amountAllowed
      ) {
        // Prepare bid data
        const bidData = {
          userName,
          userId,
          propertyId,
          amount: nextBidAmount,
          time: new Date().toISOString()
        };
        
        // Submit bid to API
        const bidResponse = await fetch(`${process.env.REACT_APP_API_URL}/bids/newbid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bidData)
        });
        
        if (!bidResponse.ok) {
          const errorData = await bidResponse.json();
          // Handle duplicate bid errors by retrying with higher amount
          if (errorData.message && errorData.message.includes("already exists")) {
            console.log("Duplicate bid detected, incrementing and retrying");
            processingBidRef.current = false;
            return handleAutomaticBid(incomingBidAmount, incomingBidderId, retryCount + 1);
          }
          throw new Error(errorData.message || 'Failed to submit bid');
        }
        
        // Get the new bid details and update property record
        const newBid = await bidResponse.json();
        const propertyUpdateResponse = await fetch(`${process.env.REACT_APP_API_URL}/property/${propertyId}/bid`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bidId: newBid._id,
            amount: nextBidAmount
          })
        });

        if (!propertyUpdateResponse.ok) {
          throw new Error('Failed to update property with new bid');
        }

        // Get updated property details and broadcast bid via socket
        const updatedProperty = await propertyUpdateResponse.json();
        socket.emit("submit_bid", { 
          bid: nextBidAmount, 
          room: propertyId, 
          userName,
          userId,
          newSaleDate: updatedProperty?.property?.saleDate
        });

        console.log(`BidBot successfully placed bid: €${nextBidAmount}`);
        onBidSubmit && onBidSubmit(nextBidAmount);
      } else if (nextBidAmount > amountAllowed) {
        // Handle case where bid exceeds user's approved amount
        onError(`BidBot reached your approved limit of €${amountAllowed.toLocaleString()}`);
        setIsBidBotActive(false);
      } else if (nextBidAmount > limitNum) {
        // Handle case where bid exceeds user's set limit
        onError(`BidBot reached your set limit of €${limitNum.toLocaleString()}`);
        setIsBidBotActive(false);
      }
    } catch (err) {
      console.error('BidBot error:', err);
      onError && onError(err.message || 'Failed to submit automated bid');
      
      // Deactivate BidBot on serious errors
      if (err.message.includes("approved limit") || err.message.includes("Failed to")) {
        setIsBidBotActive(false);
      }
    } finally {
      // Reset processing flag
      processingBidRef.current = false;
      
      // Process next item in queue if any
      setTimeout(() => {
        processQueue();
      }, 3000);
    }
  };

  /**
   * Toggle BidBot activation state
   * If active, deactivate it; if inactive, open setup dialog
   */
  const toggleBidBot = (e) => {
    e && e.preventDefault();
    
    if (isBidBotActive) {
      setIsBidBotActive(false);
      setIsFirstBid(true);
      // Clear any pending bids
      bidQueueRef.current = [];
    } else {
      setOpenDialog(true);
    }
  };

  /**
   * Start the BidBot with current settings
   * Validates settings and initiates first bid if needed
   */
  const startBidBot = async (e) => {
    e && e.preventDefault();
    
    // Check connection
    if (!socket || !socketConnected) {
      onError("Connection to bidding server lost. Cannot start BidBot.");
      return;
    }
    // Validate inputs
    if (!bidBotLimit) {
      onError('Please set a bid bot limit');
      return;
    }
    if (!bidIncrement || parseFloat(bidIncrement) <= 0) {
      onError('Please set a valid bid increment');
      return;
    }

    const limitNum = parseFloat(bidBotLimit);
    const currentBidNum = parseFloat(currentBid);
    
    if (isNaN(limitNum) || isNaN(currentBidNum)) {
      onError('Invalid bid values');
      return;
    }
    if (limitNum <= currentBidNum) {
      onError('Bid bot limit must be higher than current bid');
      return;
    }
    if (limitNum > amountAllowed) {
      onError(`Bid bot limit cannot exceed your approved limit of €${amountAllowed.toLocaleString()}`);
      return;
    }
    
    // Clear any existing queue
    bidQueueRef.current = [];
    processingQueueRef.current = false;
    
    // Activate BidBot
    setIsBidBotActive(true);
    setOpenDialog(false);
    setIsFirstBid(true);
    processingBidRef.current = false;
    
    // If user is not the current winning bidder, place initial bid
    if (lastBidderId && lastBidderId !== userId) {
      setTimeout(() => {
        queueBid(currentBid, lastBidderId);
      }, 500);
    }
  };

  /**
   * Close the BidBot setup dialog
   */
  const handleDialogClose = (e) => {
    e && e.preventDefault();
    setOpenDialog(false);
  };
  
  // Check if current user is the leading bidder
  const isUserWinning = lastBidderId === userId;

  // Common styling for text fields
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'secondary.main',
      },
      '&:hover fieldset': {
        borderColor: 'secondary.main',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'secondary.main',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'secondary.main', 
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: 'secondary.main', 
    }
  };
  return (
    <Box>
      {/* BidBot toggle button with tooltip */}
      <Tooltip title={isBidBotActive 
        ? "BidBot Active - Click to Stop" 
        : "Setup BidBot"}>
        <IconButton 
          color={isBidBotActive ? "secondary" : "default"}
          onClick={toggleBidBot}
          sx={{ mb: 1 }}
          disabled={!socketConnected}
        >
          <SmartToyIcon sx={{ 
            color: isBidBotActive ? 'secondary.main' : (socketConnected ? 'inherit' : '#ccc'),
            animation: isBidBotActive ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.7
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1
              }
            }
          }} />
        </IconButton>
      </Tooltip>

      {/* BidBot setup dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        PaperProps={{
          component: 'form',
          onSubmit: (e) => {
            e.preventDefault();
            startBidBot();
          }
        }}
      >
        <DialogTitle>Setup BidBot</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            BidBot will automatically place bids on your behalf when others outbid you, up to your specified limit.
          </Typography>
          {/* Maximum bid limit input */}
          <TextField
            fullWidth
            label="Maximum Bid Limit"
            type="number"
            value={bidBotLimit}
            onChange={(e) => setBidBotLimit(e.target.value)}
            helperText={`Current max approved amount: €${amountAllowed?.toLocaleString()}`}
            sx={{ 
              mb: 2,
              ...textFieldStyle
            }}
            inputProps={{ inputMode: 'text' }}
          />
          <TextField
            fullWidth
            label="Bid Increment"
            type="number"
            value={bidIncrement}
            onChange={(e) => setBidIncrement(e.target.value)}
            helperText="Amount to increase each bid by"
            inputProps={{ inputMode: 'text' }}
            sx={textFieldStyle}
          />
        </DialogContent>
        <DialogActions>
          {/* Cancel button - closes dialog without starting BidBot */}
          <Button 
            onClick={handleDialogClose} 
            type="button"
            sx={{ color: 'secondary.main' }}
          >
            Cancel
          </Button>
          {/* Start button - activates BidBot with current settings */}
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={startBidBot}
            disabled={!socketConnected}
            type="submit"
          >
            Start BidBot
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default BidBot;