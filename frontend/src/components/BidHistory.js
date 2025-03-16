import React, { useState } from 'react';
import { Typography, Collapse, Divider, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, useTheme } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

/**
 * BidHistory Component
 * Displays a collapsible history of bids for an auction item.
 * Features a toggle to show/hide the bid history and a scrollable table
 */
const BidHistory = ({ bids }) => {
  // State to track whether bid history is expanded or collapsed
  const [showBids, setShowBids] = useState(false);
  
  // Access the current theme to detect if dark mode is active
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  /**
   * Toggle the visibility of the bid history
   */
  const toggleBids = () => {
    setShowBids(!showBids);
  };

  return (
    <>
      {/* Divider to separate bid history from other content */}
      <Divider sx={{ mb: 2 }} />
      
      {/* Clickable header for expanding/collapsing bid history */}
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
        {/* Show appropriate icon based on expanded/collapsed state */}
        {showBids ? <ExpandLess /> : <ExpandMore />}
        Bid History
      </Typography>
      
      {/* Collapsible container that animates open/close */}
      <Collapse in={showBids}>
        {bids.length ? (
          // Scrollable table container with custom scrollbar styling
          <TableContainer 
            component={Paper}
            sx={{
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: 'background.paper',
              position: 'relative', // Important for stacking context
              // Scrollbar styling for better 
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: isDarkMode ? '#2c2c2c' : '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: isDarkMode ? '#555' : '#888',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#777' : '#555',
                },
              },
            }}
          >
            {/* Bid history table with sticky header */}
            <Table 
              size="small" 
              aria-label="bid history"
              stickyHeader
            >
              {/* Table header that stays fixed when scrolling */}
              <TableHead>
                <TableRow>
                  {/* User column header with theme-aware styling */}
                  <TableCell 
                    sx={{ 
                      bgcolor: isDarkMode ? 'rgba(41, 41, 41, 0.95)' : 'rgba(245, 245, 245, 0.95)',
                      fontWeight: 'bold',
                      color: 'text.primary',
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      borderBottom: `1px solid ${isDarkMode ? 'rgba(81, 81, 81, 1)' : 'rgba(224, 224, 224, 1)'}`,
                    }}
                  >
                    User
                  </TableCell>
                  
                  {/* Bid amount column header */}
                  <TableCell 
                    align="right"
                    sx={{ 
                      bgcolor: isDarkMode ? 'rgba(41, 41, 41, 0.95)' : 'rgba(245, 245, 245, 0.95)',
                      fontWeight: 'bold',
                      color: 'text.primary',
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      borderBottom: `1px solid ${isDarkMode ? 'rgba(81, 81, 81, 1)' : 'rgba(224, 224, 224, 1)'}`,
                    }}
                  >
                    Amount (€)
                  </TableCell>
                  
                  {/* Timestamp column header */}
                  <TableCell 
                    align="right"
                    sx={{ 
                      bgcolor: isDarkMode ? 'rgba(41, 41, 41, 0.95)' : 'rgba(245, 245, 245, 0.95)',
                      fontWeight: 'bold',
                      color: 'text.primary',
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      borderBottom: `1px solid ${isDarkMode ? 'rgba(81, 81, 81, 1)' : 'rgba(224, 224, 224, 1)'}`,
                    }}
                  >
                    Time
                  </TableCell>
                </TableRow>
              </TableHead>
              
              {/* Table body with bid rows */}
              <TableBody>
                {bids.map((bid, index) => (
                  // Each bid row with alternating background colors
                  <TableRow 
                    key={bid._id}
                    sx={{
                      // Zebra striping effect based on index and theme
                      bgcolor: index % 2 === 0 
                        ? 'background.paper' 
                        : isDarkMode 
                          ? 'rgba(255, 255, 255, 0.03)' 
                          : 'rgba(0, 0, 0, 0.03)',
                      // Hover effect for better UX
                      '&:hover': {
                        bgcolor: isDarkMode 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.07)',
                      }
                    }}
                  >
                    {/* Bidder name */}
                    <TableCell sx={{ color: 'text.primary' }}>{bid.userName}</TableCell>
                    
                    {/* Bid amount with numeric formatting */}
                    <TableCell align="right" sx={{ color: 'text.primary' }}>
                      {bid.amount?.toLocaleString()}
                    </TableCell>
                    
                    {/* Bid timestamp in locale-appropriate format */}
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {new Date(bid.time).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Message shown when no bids exist
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            No bids have been placed yet.
          </Typography>
        )}
      </Collapse>
    </>
  );
};

export default BidHistory;