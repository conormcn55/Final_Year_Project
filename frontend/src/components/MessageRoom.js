import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import useUserData from '../utils/useUserData';

export default function MessageContainer() {
  const navigate = useNavigate();
  const { _id: userId, name: userName } = useUserData();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Initialize Socket Connection
  useEffect(() => {
    const newSocket = io('http://localhost:3002');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Fetch Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      if (!userId) return;
      try {
        const roomsResponse = await axios.get(`http://localhost:3001/api/room/get/${userId}`);
      
        const roomsData = roomsResponse.data.rooms || [];
        const roomsWithUserDetails = await Promise.all(roomsData.map(async (room) => {
          const otherUserId = room.bidder !== userId ? room.bidder : room.owner;
          
          const userResponse = await axios.get(`http://localhost:3001/api/user/basic/${otherUserId}`);
          
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

  // Listen for messages when room is selected
  useEffect(() => {
    if (socket && selectedRoom) {
      socket.emit('join_room', selectedRoom._id);
  
      socket.on('receive_message', (message) => {
        console.log('Received message:', message);
        setMessages(prevMessages => [...prevMessages, message]);
      });

      const fetchRoomMessages = async () => {
        try {
          const messagesResponse = await axios.get(`http://localhost:3001/api/messages/${selectedRoom._id}`);
          setMessages(messagesResponse.data || []);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setMessages([]);
        }
      };
      fetchRoomMessages();

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, selectedRoom]);

  // Handle Room Selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  // Handle Profile Navigation
  const handleProfileClick = () => {
    if (selectedRoom?.otherUserId) {
      navigate(`/profile/${selectedRoom.otherUserId}`);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !socket) return;

    try {
      socket.emit('send_message', {
        sentBy: userId,
        room: selectedRoom._id,
        message: newMessage
      });

      await axios.post('http://localhost:3001/api/messages/', {
        sentBy: userId,
        room: selectedRoom._id,
        message: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

 
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Room List */}
      <Box sx={{ width: '300px', borderRight: '1px solid #ddd' }}>
        <List>
          {rooms.map((room) => (
            <ListItem 
              key={room._id} 
              onClick={() => handleRoomSelect(room)}
              selected={selectedRoom?._id === room._id}
              sx={{ cursor: 'pointer' }}
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

      {/* Message View */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedRoom ? (
          <>
            <Box 
              sx={{ 
                padding: 2, 
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer'
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
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {messages.map((message) => (
                <Box 
                  key={message._id}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: message.sentBy === userId ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    alignSelf: message.sentBy === userId ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      flexDirection: message.sentBy === userId ? 'row-reverse' : 'row',
                      maxWidth: '100%'
                    }}
                  >
                    <Box
                      sx={{ 
                        backgroundColor: message.sentBy === userId ? '#e6f2ff' : '#f0f0f0',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        borderBottomRightRadius: message.sentBy === userId ? '4px' : '12px',
                        borderBottomLeftRadius: message.sentBy === userId ? '12px' : '4px',
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
              ))}
            </Box>
            <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', padding: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                sx={{ mr: 2 }}
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