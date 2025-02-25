import React, { useState, useEffect } from 'react';
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
import io from 'socket.io-client';

const socket = io.connect(process.env.REACT_APP_SOCKET_URL);

const BidBot = ({ 
  propertyId, 
  userId, 
  userName, 
  currentBid, 
  amountAllowed,
  onBidSubmit,
  onError 
}) => {
  const [bidBotLimit, setBidBotLimit] = useState('');
  const [bidIncrement, setBidIncrement] = useState('500');
  const [isBidBotActive, setIsBidBotActive] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [lastWinningBidderId, setLastWinningBidderId] = useState(null);
  const [isFirstBid, setIsFirstBid] = useState(true);

  useEffect(() => {
    const handleReceiveBid = async (data) => {
      if (isBidBotActive && data.userId !== userId) {
        // Add random delay before placing bid
        const delay = Math.random() * 4000 + 1000; // Random delay between 1-5 seconds
        setTimeout(() => {
          handleAutomaticBid(data.bid, data.userId);
        }, delay);
      }
    };

    socket.on("receive_bid", handleReceiveBid);

    return () => {
      socket.off("receive_bid", handleReceiveBid);
    };
  }, [isBidBotActive, currentBid, bidBotLimit, userId, bidIncrement]);

  const handleAutomaticBid = async (incomingBidAmount, incomingBidderId) => {
    // Don't place bid if we're already the highest bidder
    if (incomingBidderId === userId) {
      return;
    }

    const currentBidNum = parseFloat(currentBid);
    const limitNum = parseFloat(bidBotLimit);
    const incomingBidNum = parseFloat(incomingBidAmount);
    const incrementNum = parseFloat(bidIncrement);

    // Calculate next bid amount
    let nextBidAmount;
    if (isFirstBid) {
      // First bid uses the increment to round up
      nextBidAmount = Math.min(
        Math.ceil((incomingBidNum + 1) / incrementNum) * incrementNum,
        limitNum
      );
      setIsFirstBid(false);
    } else {
      // Subsequent bids just add the increment
      nextBidAmount = Math.min(
        incomingBidNum + incrementNum,
        limitNum
      );
    }

    if (
      nextBidAmount > currentBidNum && 
      nextBidAmount > incomingBidNum &&
      nextBidAmount <= limitNum && 
      nextBidAmount <= amountAllowed
    ) {
      try {
        const bidData = {
          userName: userName,
          userId: userId,
          propertyId: propertyId,
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
          throw new Error('Failed to submit bid');
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

        socket.emit("submit_bid", { 
          bid: nextBidAmount, 
          room: propertyId, 
          userName: userName,
          userId: userId
        });

        onBidSubmit && onBidSubmit(nextBidAmount);
        setLastWinningBidderId(incomingBidderId);
      } catch (err) {
        onError && onError(err.message || 'Failed to submit automated bid');
      }
    }
  };

  const startBidBot = async () => {
    if (!bidBotLimit) {
      onError('Please set a bid bot limit');
      return;
    }

    if (!bidIncrement || parseFloat(bidIncrement) <= 0) {
      onError('Please set a valid bid increment');
      return;
    }

    const limitNum = parseFloat(bidBotLimit);
    if (limitNum <= currentBid) {
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

    // If user is not currently winning, place first bid immediately
    if (lastWinningBidderId !== userId) {
      await handleAutomaticBid(currentBid, lastWinningBidderId);
    }
  };

  const stopBidBot = () => {
    setIsBidBotActive(false);
    setIsFirstBid(true);
  };

  return (
    <Box>
      <Tooltip title={isBidBotActive ? "BidBot Active" : "Setup BidBot"}>
        <IconButton 
          color="secondary"
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 1 }}
        >
          <SmartToyIcon sx={{ 
            color: isBidBotActive ? 'secondary.main' : 'inherit',
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

      {isBidBotActive && (
        <Button 
          fullWidth 
          variant="contained" 
          color='secondary'
          onClick={stopBidBot}
        >
          Stop BidBot
        </Button>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Setup BidBot</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Set your bidding preferences
          </Typography>
          <TextField
            fullWidth
            label="BidBot Limit"
            type="number"
            value={bidBotLimit}
            onChange={(e) => setBidBotLimit(e.target.value)}
            helperText={`Current max approved amount: €${amountAllowed?.toLocaleString()}`}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Bid Increment"
            type="number"
            value={bidIncrement}
            onChange={(e) => setBidIncrement(e.target.value)}
            helperText="Amount to increase each bid by"
          />
        </DialogContent>
        <DialogActions>
          <Button color='secondary' onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button color='secondary' onClick={startBidBot}>Start BidBot</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BidBot;