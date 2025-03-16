import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  styled,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import useUserData from '../utils/useUserData';

/**
 * Styled component for Card
 */
const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
});

/**
 * Styled component for CardContent
 */
const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column'
});

/**
 * Styled component for TextField
 */
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
  }
}));

/**
 * Styled component for name TextField
 */
const NameTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  }
}));

/**
 * OtherUserInfo Component
 * Displays a read-only profile view of another user's information
 * Includes personal details, contact information, description, and documents
 * Redirects to the user's own profile if they try to view themselves
 */
export default function OtherUserInfo({ userId }) {
  const navigate = useNavigate();
  const currentUser = useUserData();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the profile being viewed is the user's own profile
    if (currentUser && userId === currentUser._id) {
      // Redirect to user's own profile page
      navigate('/profile');
      return;
    }

    /**
     * Fetches user data from the API
     * Sets loading state and handles errors
     */
    const fetchUserData = async () => {
      try {
        // Get user details from API
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    };

    // Only fetch if we have a userId
    if (userId) {
      fetchUserData();
    }
  }, [userId, currentUser, navigate]);

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if user data couldn't be loaded
  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        User not found
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        {/* User profile header card with avatar and name */}
        <StyledCard sx={{ mb: 4 }}>
          <CardHeader title="Profile" />
          <Divider />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={userData.avatar?.url}
                  sx={{ width: 120, height: 120 }}
                />
              </Box>
              <Box>
                <NameTextField
                  value={userData.name || ''}
                  disabled
                  variant="standard"
                  sx={{ mb: 1 }}
                />
              </Box>
            </Box>
          </CardContent>
        </StyledCard>

        {/* Two-column layout for user details */}
        <Grid container spacing={3}>
          {/* Left column: Contact & Account Information */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardHeader title="Contact & Account Information" />
              <Divider />
              <StyledCardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Email field - read only */}
                  <StyledTextField
                    placeholder="Email"
                    value={userData.email || ''}
                    disabled
                    fullWidth
                    variant="standard"
                  />
                  {/* Phone number field - read only */}
                  <StyledTextField
                    placeholder="Phone Number"
                    value={userData.number || ''}
                    disabled
                    fullWidth
                    variant="standard"
                  />
                  {/* User type dropdown - read only */}
                  <FormControl fullWidth variant="standard" disabled>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      value={userData.userType || ''}
                    >
                      <MenuItem value="default">Default</MenuItem>
                      <MenuItem value="landlord">Landlord</MenuItem>
                      <MenuItem value="estate agent">Estate Agent</MenuItem>
                    </Select>
                  </FormControl>
                  {/* Registration number - only shown for non-default users */}
                  {userData.userType !== 'default' && (
                    <StyledTextField
                      placeholder="Registration Number"
                      value={userData.regNumber || ''}
                      disabled
                      fullWidth
                      variant="standard"
                    />
                  )}
                </Box>
              </StyledCardContent>
            </StyledCard>
          </Grid>

          {/* Right column: Description and Documents */}
          <Grid item xs={12} md={6} container spacing={3}>
            {/* User description section */}
            <Grid item xs={12}>
              <StyledCard>
                <CardHeader title="Description" />
                <Divider />
                <StyledCardContent>
                  <StyledTextField
                    value={userData.description || ''}
                    disabled
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ flexGrow: 1 }}
                    placeholder="No description available"
                    variant="standard"
                  />
                </StyledCardContent>
              </StyledCard>
            </Grid>

            {/* User documents section */}
            <Grid item xs={12}>
              <StyledCard>
                <CardHeader title="Documents" />
                <Divider />
                <StyledCardContent>
                  {/* Scrollable document list with custom scrollbar styling */}
                  <List sx={{ 
                    flexGrow: 1, 
                    maxHeight: '300px',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#888',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#555',
                    },
                  }}>
                    {/* Map through user files and display as list items */}
                    {userData.files?.map((file, index) => (
                      <ListItem key={file._id || index}>
                        <ListItemIcon>
                          <InsertDriveFileIcon />
                        </ListItemIcon>
                        <ListItemText>
                          <a 
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              textDecoration: 'none', 
                              color: 'inherit',
                              cursor: 'pointer' 
                            }}
                          >
                            {file.filename}
                          </a>
                        </ListItemText>
                      </ListItem>
                    ))}
                  </List>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}