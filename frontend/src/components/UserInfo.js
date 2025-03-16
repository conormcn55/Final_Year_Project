import { useState, useEffect } from 'react';
import { 
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  TextField,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  styled,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import axios from 'axios';
import useUserData from '../utils/useUserData';

/**
 * Styled input component that is visually hidden
 * Used for file uploads to hide the default input appearance
 */
const VisuallyHiddenInput = styled('input')({
  display: 'none',
});

/**
 * Styled Card component that expands to fill height
 * and uses column direction for content layout
 */
const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
});

/**
 * Styled CardContent that grows to fill available space
 * and uses column direction for content layout
 */
const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column'
});

/**
 * Styled TextField with custom text size and color
 */
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '1.1rem',
    color: theme.palette.text.primary, 
  }
}));

/**
 * Styled TextField specifically for user name with larger text
 */
const NameTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: theme.palette.text.primary, 
  }
}));

/**
 * UserInfo component for displaying and editing user profile information
 */
export default function UserInfo() {
  const userData = useUserData(); // Get user data from custom hook
  const [avatar, setAvatar] = useState(null);// State for user avatar
  const [files, setFiles] = useState([]);  // State for user document files
  const [isEditing, setIsEditing] = useState(false);  // State to track if form is in edit mode
  const [loading, setLoading] = useState(false);  // State to track loading during save operations
  const [formData, setFormData] = useState({  // State for all form fields

    name: '',
    email: '',
    description: '',
    userType: '',
    regNumber: '',
    number: ''
  });

  /**
   * Initialize form data when userData is loaded or changes
   */
  useEffect(() => {
    if (userData) {
      setAvatar(userData.avatar?.url || null);
      setFiles(userData.files || []);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        description: userData.description || '',
        userType: userData.userType || '',
        regNumber: userData.regNumber || '',
        number: userData.number || ''
      });
    }
  }, [userData]);

  /**
   * Handle changes to form input fields
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Handle file uploads for documents
   */
  const handleFiles = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFiles(prevFiles => [...prevFiles, {
          url: reader.result,
          filename: file.name,
          isNew: true // Flag to identify newly added files
        }]);
      };
    });
  };

  /**
   * Handle deleting a file both from state and server if necessary
   */
  const handleDeleteFile = async (index) => {
    const fileToDelete = files[index];
    
    try {
      // If file exists on server (has ID and isn't newly added), delete from server
      if (fileToDelete._id && !fileToDelete.isNew) {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/user/removefile/${userData._id}/files/${fileToDelete._id}`,
          { withCredentials: true }
        );
        
        if (response.status === 200) {
          console.log('File deleted successfully from server');
        } else {
          throw new Error('Failed to delete file from server');
        }
      }
      
      // Remove file from state
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
      
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again later.');
    }
  };

  /**
   * Handle avatar image upload and preview
   */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
    }
  };

  /**
   * Handle saving all user profile changes to the server
   */
  const handleSave = async () => {
    setLoading(true);
    try {
      // Separate new files from existing ones
      const newFiles = files.filter(file => file.isNew);
      const existingFiles = files.filter(file => !file.isNew);

      // Prepare update data
      const updateData = {
        ...formData,
        avatar: avatar,
        files: [...existingFiles, ...newFiles]
      };

      // Send update request to server
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/user/edit/${userData._id}`,
        updateData,
        { withCredentials: true }
      );

      if (response.data.success) {
        const updatedUser = response.data.user;
        setFiles(updatedUser.files || []);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while user data is being fetched
  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        {/* Profile Header Card */}
        <StyledCard sx={{ mb: 4 }}>
          <CardHeader 
            title="Profile"
            action={
              <Button
                variant="contained"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            }
          />
          <Divider />
          <CardContent>
            {/* Avatar and Name Section */}
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatar}
                  sx={{ width: 120, height: 120 }}
                />
                {/* Edit avatar button - only shown in edit mode */}
                {isEditing && (
                  <Button
                    component="label"
                    variant="contained"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      minWidth: 0,
                      width: 40,
                      height: 40,
                      borderRadius: '50%'
                    }}
                  >
                    <EditIcon />
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleAvatarChange}
                      accept="image/*"
                    />
                  </Button>
                )}
              </Box>
              <Box>
                <NameTextField
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  variant="standard"
                  sx={{ mb: 1 }}
                />
              </Box>
            </Box>
          </CardContent>
        </StyledCard>

        <Grid container spacing={3}>
          {/* Contact & Account Information Card */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardHeader title="Contact & Account Information" />
              <Divider />
              <StyledCardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <StyledTextField
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    variant="standard"
                  />
                  <StyledTextField
                    name="number"
                    placeholder="Phone Number"
                    value={formData.number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    variant="standard"
                  />
                  <FormControl fullWidth variant="standard">
                    <InputLabel>User Type</InputLabel>
                    <Select
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <MenuItem value="default">Default</MenuItem>
                      <MenuItem value="landlord">Landlord</MenuItem>
                      <MenuItem value="estate agent">Estate Agent</MenuItem>
                    </Select>
                  </FormControl>
                  {/* Conditional registration number field for non-default users */}
                  {formData.userType !== 'default' && (
                    <StyledTextField
                      name="regNumber"
                      placeholder="Registration Number"
                      value={formData.regNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      fullWidth
                      variant="standard"
                    />
                  )}
                </Box>
              </StyledCardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={6} container spacing={3}>
            {/* Description Card */}
            <Grid item xs={12}>
              <StyledCard>
                <CardHeader title="Description" />
                <Divider />
                <StyledCardContent>
                  <StyledTextField
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ flexGrow: 1 }}
                    placeholder="Tell us about yourself..."
                    variant="standard"
                  />
                </StyledCardContent>
              </StyledCard>
            </Grid>

            {/* Documents Card */}
            <Grid item xs={12}>
              <StyledCard>
                <CardHeader 
                  title="Documents"
                  action={
                    isEditing && (
                      <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload Files
                        <VisuallyHiddenInput
                          type="file"
                          onChange={handleFiles}
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                        />
                      </Button>
                    )
                  }
                />
                <Divider />
                <StyledCardContent>
                  {/* Scrollable list of document files */}
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
                    {files.map((file, index) => (
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
                        {/* Delete file button - only shown in edit mode */}
                        {isEditing && (
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteFile(index)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
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