import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Avatar, 
  TextField, 
  Typography, 
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function OtherUserInfo({ userId }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/api/user/basic/${userId}`);
        setUserData(data.user);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>User not found</div>;
  }

  return (
    <Box sx={{ margin: '2rem 6rem' }}>
      <Grid container spacing={3}>
        {/* Left side - User Info */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              alt="User Avatar"
              src={userData.avatar?.url}
              sx={{ width: 150, height: 150, mr: 2 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                name="name"
                label="Name"
                value={userData.name || ''}
                variant="outlined"
                sx={{ width: '50%', marginBottom: 2, marginTop: 2 }}
                disabled
              />
              <Box>
                <TextField
                  name="email"
                  label="Email"
                  value={userData.email || ''}
                  variant="outlined"
                  sx={{ width: '50%', marginBottom: 2, marginTop: 2 }}
                  disabled
                />
              </Box>
            </Box>
          </Box>

          <TextField
            name="number"
            label="Phone Number"
            value={userData.number || ''}
            variant="outlined"
            sx={{ width: '60%', marginBottom: 2, marginTop: 2 }}
            disabled
          />
          
          <Box>
            <TextField
              name="description"
              label="Description"
              value={userData.description || ''}
              variant="outlined"
              sx={{ width: '60%', marginBottom: 2, marginTop: 2 }}
              disabled
            />
          </Box>

          <TextField
            name="userType"
            label="User Type"
            value={userData.userType || ''}
            variant="outlined"
            sx={{ width: '60%', marginBottom: 2, marginTop: 2 }}
            disabled
          />

          {userData.userType !== 'default' && (
            <TextField
              name="regNumber"
              label="Registration Number"
              value={userData.regNumber || ''}
              variant="outlined"
              sx={{ width: '60%', marginBottom: 2, marginTop: 2 }}
              disabled
            />
          )}
        </Grid>

        {/* Right side - Documents */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {userData.files?.map((file, index) => (
                <ListItem key={file._id || index}>
                  <InsertDriveFileIcon sx={{ mr: 1 }} />
                  <ListItemText
                    primary={
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        {file.filename}
                      </a>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}