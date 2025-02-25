import React, { useState } from 'react';
import { Typography, Collapse, Divider, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, useTheme } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const BidHistory = ({ bids }) => {
  const [showBids, setShowBids] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const toggleBids = () => {
    setShowBids(!showBids);
  };

  return (
    <>
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
              backgroundColor: 'background.paper',
              position: 'relative', // Important for stacking context
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
            <Table 
              size="small" 
              aria-label="bid history"
              stickyHeader
            >
              <TableHead>
                <TableRow>
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
              <TableBody>
                {bids.map((bid, index) => (
                  <TableRow 
                    key={bid._id}
                    sx={{
                      bgcolor: index % 2 === 0 
                        ? 'background.paper' 
                        : isDarkMode 
                          ? 'rgba(255, 255, 255, 0.03)' 
                          : 'rgba(0, 0, 0, 0.03)',
                      '&:hover': {
                        bgcolor: isDarkMode 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.07)',
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'text.primary' }}>{bid.userName}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.primary' }}>
                      {bid.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {new Date(bid.time).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            No bids have been placed yet.
          </Typography>
        )}
      </Collapse>
    </>
  );
};

export default BidHistory;