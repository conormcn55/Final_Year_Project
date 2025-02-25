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
  const [bidBotLimit, setBidBotLimit] = useState('');
  const [bidIncrement, setBidIncrement] = useState('500');
  const [isBidBotActive, setIsBidBotActive] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isFirstBid, setIsFirstBid] = useState(true);
  const bidBotLimitRef = useRef(bidBotLimit);
  const bidIncrementRef = useRef(bidIncrement);
  const isBidBotActiveRef = useRef(isBidBotActive);
  const isFirstBidRef = useRef(isFirstBid);
  const processingBidRef = useRef(false);
  const currentBidRef = useRef(currentBid);
  const lastBidderIdRef = useRef(lastBidderId);

  useEffect(() => {
    bidBotLimitRef.current = bidBotLimit;
    bidIncrementRef.current = bidIncrement;
    isBidBotActiveRef.current = isBidBotActive;
    isFirstBidRef.current = isFirstBid;
    currentBidRef.current = currentBid;
    lastBidderIdRef.current = lastBidderId;
  }, [bidBotLimit, bidIncrement, isBidBotActive, isFirstBid, currentBid, lastBidderId]);

  useEffect(() => {
    if (
      isBidBotActiveRef.current && 
      !processingBidRef.current && 
      lastBidderId && 
      lastBidderId !== userId &&  
      parseFloat(currentBidRef.current) < parseFloat(bidBotLimitRef.current) 
    ) {
      const delay = Math.random() * 3000 + 1000; 
      setTimeout(() => {
        if (lastBidderIdRef.current !== userId) {
          handleAutomaticBid(currentBidRef.current, lastBidderIdRef.current);
        }
      }, delay);
    }
  }, [currentBid, lastBidderId]);
  

  useEffect(() => {
    if (!socket) return;

    const handleReceiveBid = (data) => {
      if (data.room === propertyId && data.userId !== userId && isBidBotActiveRef.current) {
        console.log("BidBot received socket bid update:", data);
      }
    };

    // Add event listener
    socket.on("receive_bid", handleReceiveBid);

    return () => {
      socket.off("receive_bid", handleReceiveBid);
    };
  }, [propertyId, userId, socket]);

  const handleAutomaticBid = async (incomingBidAmount, incomingBidderId, retryCount = 0) => {
    if (processingBidRef.current) {
      return;
    }
    
    processingBidRef.current = true;
    
    try {
      if (incomingBidderId === userId) {
        processingBidRef.current = false;
        return;
      }

      if (!socketConnected) {
        onError("Connection to bidding server lost. BidBot paused.");
        setIsBidBotActive(false);
        processingBidRef.current = false;
        return;
      }

      const currentBidNum = parseFloat(incomingBidAmount);
      const limitNum = parseFloat(bidBotLimitRef.current);
      const incrementNum = parseFloat(bidIncrementRef.current);

      let nextBidAmount;
      if (isFirstBidRef.current) {
        nextBidAmount = Math.min(
          Math.ceil((currentBidNum + 1) / incrementNum) * incrementNum,
          limitNum
        );
        setIsFirstBid(false);
      } else {
        nextBidAmount = Math.min(
          currentBidNum + incrementNum,
          limitNum
        );
      }

      if (retryCount > 0) {
        nextBidAmount = Math.min(
          nextBidAmount + (incrementNum * retryCount),
          limitNum
        );
      }

      console.log(`BidBot calculating: Current: ${currentBidNum}, Next: ${nextBidAmount}, Limit: ${limitNum}`);

      if (
        nextBidAmount > currentBidNum &&
        nextBidAmount <= limitNum && 
        nextBidAmount <= amountAllowed
      ) {
        const bidData = {
          userName,
          userId,
          propertyId,
          amount: nextBidAmount,
          time: new Date().toISOString()
        };

        const bidResponse = await fetch(`${process.env.REACT_APP_API_URL}/bids/newbid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bidData)
        });

        if (!bidResponse.ok) {
          const errorData = await bidResponse.json();
            if (errorData.message && errorData.message.includes("already exists")) {
            console.log("Duplicate bid detected, incrementing and retrying");
            processingBidRef.current = false;
            return handleAutomaticBid(incomingBidAmount, incomingBidderId, retryCount + 1);
          }
          
          throw new Error(errorData.message || 'Failed to submit bid');
        }

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
        onError(`BidBot reached your approved limit of €${amountAllowed.toLocaleString()}`);
        setIsBidBotActive(false);
      } else if (nextBidAmount > limitNum) {
        onError(`BidBot reached your set limit of €${limitNum.toLocaleString()}`);
        setIsBidBotActive(false);
      }
    } catch (err) {
      console.error('BidBot error:', err);
      onError && onError(err.message || 'Failed to submit automated bid');
      
      // If there's a serious error, deactivate the BidBot
      if (err.message.includes("approved limit") || err.message.includes("Failed to")) {
        setIsBidBotActive(false);
      }
    } finally {
      processingBidRef.current = false;
    }
  };

  const toggleBidBot = (e) => {
    e && e.preventDefault();
    
    if (isBidBotActive) {
      setIsBidBotActive(false);
      setIsFirstBid(true);
    } else {
      setOpenDialog(true);
    }
  };

  const startBidBot = async (e) => {
    e && e.preventDefault();
    
    if (!socket || !socketConnected) {
      onError("Connection to bidding server lost. Cannot start BidBot.");
      return;
    }

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

    setIsBidBotActive(true);
    setOpenDialog(false);
    setIsFirstBid(true);
    processingBidRef.current = false;

    if (lastBidderId && lastBidderId !== userId) {
      setTimeout(() => {
        handleAutomaticBid(currentBid, lastBidderId);
      }, 500);
    }
  };

  const handleDialogClose = (e) => {
    e && e.preventDefault();
    setOpenDialog(false);
  };
  const isUserWinning = lastBidderId === userId;

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
          <Button 
            onClick={handleDialogClose} 
            type="button"
            sx={{ color: 'secondary.main' }}
          >
            Cancel
          </Button>
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