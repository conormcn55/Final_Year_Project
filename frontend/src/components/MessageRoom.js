import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, TextField, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import useUserData from '../utils/useUserData';

export default function MessageContainer() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { _id: userId, name: userName } = useUserData();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesRef = useRef(new Set());
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);
  useEffect(() => {
    const fetchRooms = async () => {
      if (!userId) return;
      try {
        const roomsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/room/get/${userId}`);
      
        const roomsData = roomsResponse.data.rooms || [];
        const roomsWithUserDetails = await Promise.all(roomsData.map(async (room) => {
          const otherUserId = room.bidder !== userId ? room.bidder : room.owner;
          
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

  useEffect(() => {
    if (selectedRoom) {
      messagesRef.current = new Set();
      
      const fetchRoomMessages = async () => {
        try {
          const messagesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/messages/${selectedRoom._id}`);
          const fetchedMessages = messagesResponse.data || [];
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

  useEffect(() => {
    if (socket && selectedRoom) {
      socket.emit('join_room', selectedRoom._id);
  
      const handleNewMessage = (message) => {
        console.log('Received message:', message);
        
        if (!messagesRef.current.has(message._id)) {
          messagesRef.current.add(message._id);
            setMessages(prevMessages => {
            const tempMessageIndex = prevMessages.findIndex(msg => 
              msg.sentBy === message.sentBy && 
              msg.message === message.message && 
              msg._id.toString().startsWith('temp-')
            );
            
            if (tempMessageIndex >= 0) {
              const newMessages = [...prevMessages];
              newMessages[tempMessageIndex] = message;
              return newMessages;
            } else {
              return [...prevMessages, message];
            }
          });
        } else {
          console.log('Duplicate message detected and ignored:', message._id);
        }
      };

      socket.on('receive_message', handleNewMessage);

      return () => {
        socket.off('receive_message', handleNewMessage);
        socket.emit('leave_room', selectedRoom._id);
      };
    }
  }, [socket, selectedRoom]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleProfileClick = () => {
    if (selectedRoom?.otherUserId) {
      navigate(`/profile/${selectedRoom.otherUserId}`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !socket) return;

    try {
      const messageData = {
        sentBy: userId,
        room: selectedRoom._id,
        message: newMessage
      };

      const tempId = `temp-${Date.now()}`;
          const optimisticMessage = {
        ...messageData,
        _id: tempId,
        time: new Date().toISOString()
      };
      messagesRef.current.add(tempId);
      
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      setNewMessage('');

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/messages/`, messageData);
      const savedMessage = response.data;
      
      messagesRef.current.delete(tempId);
      messagesRef.current.add(savedMessage._id);
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === tempId ? savedMessage : msg
        )
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  const backgroundColor = isDarkMode ? theme.palette.background.default : 'white';
  const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#ddd';

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
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

      <Box sx={{ 
        flex: 1,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100%',
        overflow: 'hidden',
        bgcolor: backgroundColor
      }}>
        {selectedRoom ? (
          <>
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
          <Typography sx={{ margin: 'auto' }}>
            Message here after winning an auction.
          </Typography>
        )}
      </Box>
    </Box>
  );
}