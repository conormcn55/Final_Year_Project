import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, TextField, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import useUserData from '../utils/useUserData';
/**
 * Message Container is a componet where seller and buyer can 
 * message after the buyer wins an auction
 */
export default function MessageContainer() {
  // Initialize navigation and theme
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Extract user information from custom hook
  const { _id: userId, name: userName } = useUserData();
  
  // State management
  const [rooms, setRooms] = useState([]); // List of chat rooms
  const [selectedRoom, setSelectedRoom] = useState(null); // Currently selected room
  const [messages, setMessages] = useState([]); // Messages in the selected room
  const [loading, setLoading] = useState(true); // Loading state
  const [socket, setSocket] = useState(null); // Socket.io connection
  const [newMessage, setNewMessage] = useState(''); // New message input
  
  // Use ref to track processed messages and prevent duplicates
  const messagesRef = useRef(new Set());
  
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(newSocket);

    // Clean up socket connection on component unmount
    return () => newSocket.close();
  }, []);
  
  // Fetch chat rooms when component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      if (!userId) return; // Skip if user ID is not available
      
      try {
        // Get all rooms for the current user
        const roomsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/room/get/${userId}`);
      
        const roomsData = roomsResponse.data.rooms || [];
        
        // Enrich room data with other user details
        const roomsWithUserDetails = await Promise.all(roomsData.map(async (room) => {
          // Determine the other user in the conversation (not the current user)
          const otherUserId = room.bidder !== userId ? room.bidder : room.owner;
          
          // Fetch other user's details
          const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/user/basic/${otherUserId}`);
          
          return {
            ...room,
            otherUserId,
            otherUserDetails: userResponse.data
          };
        }));

        setRooms(roomsWithUserDetails);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setLoading(false);
      }
    };

    fetchRooms();
  }, [userId]);

  // Fetch messages when a room is selected
  useEffect(() => {
    if (selectedRoom) {
      // Reset the message tracking set
      messagesRef.current = new Set();
      
      const fetchRoomMessages = async () => {
        try {
          // Get all messages for the selected room
          const messagesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/messages/${selectedRoom._id}`);
          const fetchedMessages = messagesResponse.data || [];
          
          // Add each message ID to the tracking set
          fetchedMessages.forEach(msg => {
            messagesRef.current.add(msg._id);
          });
          
          setMessages(fetchedMessages);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setMessages([]);
        }
      };
      
      fetchRoomMessages();
    }
  }, [selectedRoom]);

  // Handle real-time messaging with socket.io
  useEffect(() => {
    if (socket && selectedRoom) {
      // Join the room's socket channel
      socket.emit('join_room', selectedRoom._id);
  
      // Handle incoming messages
      const handleNewMessage = (message) => {
        console.log('Received message:', message);
        
        // Check if message is already processed (prevents duplicates)
        if (!messagesRef.current.has(message._id)) {
          messagesRef.current.add(message._id);
          
          setMessages(prevMessages => {
            // Check if this is confirming a temporary message
            const tempMessageIndex = prevMessages.findIndex(msg => 
              msg.sentBy === message.sentBy && 
              msg.message === message.message && 
              msg._id.toString().startsWith('temp-')
            );
            
            if (tempMessageIndex >= 0) {
              // Replace temp message with confirmed message
              const newMessages = [...prevMessages];
              newMessages[tempMessageIndex] = message;
              return newMessages;
            } else {
              // Add new message
              return [...prevMessages, message];
            }
          });
        } else {
          console.log('Duplicate message detected and ignored:', message._id);
        }
      };

      // Subscribe to the socket event
      socket.on('receive_message', handleNewMessage);

      // Clean up event listener when component unmounts or room changes
      return () => {
        socket.off('receive_message', handleNewMessage);
        socket.emit('leave_room', selectedRoom._id);
      };
    }
  }, [socket, selectedRoom]);

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  // Navigate to the other user's profile
  const handleProfileClick = () => {
    if (selectedRoom?.otherUserId) {
      navigate(`/profile/${selectedRoom.otherUserId}`);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !socket) return;

    try {
      // Prepare message data
      const messageData = {
        sentBy: userId,
        room: selectedRoom._id,
        message: newMessage
      };

      // Create a temporary ID for optimistic UI update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        ...messageData,
        _id: tempId,
        time: new Date().toISOString()
      };
      
      // Track the temporary message
      messagesRef.current.add(tempId);
      
      // Add message to UI immediately (optimistic update)
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      setNewMessage(''); // Clear input field

      // Send message to server
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/messages/`, messageData);
      const savedMessage = response.data;
      
      // Update tracking with the actual message ID
      messagesRef.current.delete(tempId);
      messagesRef.current.add(savedMessage._id);
      
      // Replace temporary message with confirmed message from server
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === tempId ? savedMessage : msg
        )
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Show loading state
  if (loading) return <Typography>Loading...</Typography>;

  // Theme-based styling variables
  const backgroundColor = isDarkMode ? theme.palette.background.default : 'white';
  const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#ddd';

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar with chat rooms list */}
      <Box sx={{ 
        width: '300px', 
        borderRight: `1px solid ${borderColor}`,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: backgroundColor
      }}>
        <List>
          {rooms.map((room) => (
            <ListItem 
              key={room._id} 
              onClick={() => handleRoomSelect(room)}
              selected={selectedRoom?._id === room._id}
              sx={{ 
                cursor: 'pointer',
                bgcolor: selectedRoom?._id === room._id 
                  ? (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)') 
                  : 'transparent'
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={room.otherUserDetails?.user?.avatar?.url}
                  alt={room.otherUserDetails?.user?.name || 'User Avatar'}
                >
                  {room.otherUserDetails?.user?.name?.charAt(0) || '?'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={room.otherUserDetails?.user?.name || 'Unknown User'}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main chat area */}
      <Box sx={{ 
        flex: 1,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto', // Header, messages, input
        height: '100%',
        overflow: 'hidden',
        bgcolor: backgroundColor
      }}>
        {selectedRoom ? (
          <>
            {/* Chat header with user info */}
            <Box 
              sx={{ 
                padding: 2, 
                borderBottom: `1px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                bgcolor: backgroundColor
              }}
              onClick={handleProfileClick}
            >
              <Avatar
                src={selectedRoom.otherUserDetails?.user?.avatar?.url}
                alt={selectedRoom.otherUserDetails?.user?.name || 'User Avatar'}
                sx={{ width: 40, height: 40 }}
              >
                {selectedRoom.otherUserDetails?.user?.name?.charAt(0) || '?'}
              </Avatar>
              <Typography 
                variant="h6"
                sx={{
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {selectedRoom.otherUserDetails?.user?.name}
              </Typography>
            </Box>

            {/* Messages Container */}
            <Box sx={{ 
              overflowY: 'auto',
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: isDarkMode ? theme.palette.background.paper : '#f7f7f7'
            }}>
              {messages.map((message) => {
                const isCurrentUser = message.sentBy === userId;
                return (
                  <Box 
                    key={message._id}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Message bubble */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                        maxWidth: '100%'
                      }}
                    >
                      <Box
                        sx={{ 
                          backgroundColor: isCurrentUser 
                            ? (isDarkMode ? theme.palette.primary.dark : '#e6f2ff')
                            : (isDarkMode ? theme.palette.grey[800] : '#f0f0f0'),
                          color: isCurrentUser && isDarkMode ? 'white' : 'inherit',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          borderBottomRightRadius: isCurrentUser ? '4px' : '12px',
                          borderBottomLeftRadius: isCurrentUser ? '12px' : '4px',
                          maxWidth: '100%'
                        }}
                      >
                        <Typography 
                          sx={{ 
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {message.message}
                        </Typography>
                      </Box>
                    </Box>
                    {/* Message timestamp */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        mt: 0.5,
                        mx: 1
                      }}
                    >
                      {new Date(message.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            
            {/* Message input form */}
            <Box 
              component="form" 
              onSubmit={handleSendMessage} 
              sx={{ 
                display: 'flex', 
                padding: 2,
                bgcolor: backgroundColor,
                borderTop: `1px solid ${borderColor}`
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                sx={{ 
                  mr: 2,
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
                }}
              />
              <Button type="submit" variant="contained" color="secondary">
                Send
              </Button>
            </Box>
          </>
        ) : (
          // Empty state when no room is selected
          <Typography sx={{ margin: 'auto' }}>
            Message here after winning an auction.
          </Typography>
        )}
      </Box>
    </Box>
  );
}