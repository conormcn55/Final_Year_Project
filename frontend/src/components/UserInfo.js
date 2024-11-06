import { useState, useEffect } from 'react';
import { 
  Button, 
  TextField, 
  Box, 
  Avatar, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Typography, 
  styled,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
  display: 'none',
});

export default function UserInfo() {
  const [avatar, setAvatar] = useState(null);
  const [files, setFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    description: '',
    userType: '',
    regNumber: '',
    number: ''
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchUserDetails(userId);
    }
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/user/${userId}`);
      const user = response.data;

      setUserData({
        name: user.name,
        email: user.email,
        description: user.description,
        userType: user.userType,
        regNumber: user.regNumber,
        number: user.number
      });
      setAvatar(user.avatar?.url);
      if (user.files) {
        // Ensure we keep the _id from the database for existing files
        setFiles(user.files.map(file => ({
          ...file,
          isExisting: true,
          _id: file._id // Make sure we keep the _id
        })));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleFiles = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    uploadedFiles.forEach(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setFiles(prevFiles => [...prevFiles, {
                url: reader.result,
                name: file.name,
                filename: file.name, 
                isNew: true
            }]);
        };
    });
  };

  

  const handleDeleteFile = async (index) => {
    const fileToDelete = files[index];
    const userId = localStorage.getItem('userId');
    
    console.log('File to delete:', fileToDelete);  // Debugging statement
  
    if (fileToDelete.isExisting && fileToDelete._id) {
      try {
        const response = await axios.delete(`http://localhost:3001/api/user/removefile/${userId}/files/${fileToDelete._id}`);
        if (response.status === 200) {
          setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    } else {
      console.log("File doesn't meet deletion criteria", fileToDelete);  // Add a log to see why it's not deleting
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    }
  };
  
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

  const handleSave = async () => {
    const userId = localStorage.getItem('userId');
    setLoading(true);
    try {
       
        const processedFiles = files.map(file => ({
            _id: file._id, 
            url: file.isNew ? file.url : file.url,
            filename: file.filename,
            type: file.type
        }));
      
        await axios.put(`http://localhost:3001/api/user/edit/${userId}`, {
            ...userData,
            avatar: avatar,
            files: processedFiles
        });

        console.log('User updated successfully');
        setIsEditing(false);
    } catch (error) {
        console.error('Error updating user:', error);
        fetchUserDetails(userId);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleSave();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        sx={{ margin: '2rem 6rem' }}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          {/* Left side - User Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  alt="User Avatar"
                  src={avatar}
                  sx={{ width: 150, height: 150, mr: 2 }}
                />
                {isEditing && (
                  <Button
                    component="label"
                    variant="contained"
                    size="small"
                    sx={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)' }}
                  >
                    Change
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleAvatarChange}
                      accept="image/*"
                    />
                  </Button>
                )}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  required
                  name="name"
                  label='Name'
                  value={userData.name}
                  variant="outlined"
                  sx={{ width: '50%', marginBottom: 2 , marginTop: 2}}
                  disabled
                  onChange={handleInputChange}
                />
                <Box>
                  <TextField
                    required
                    name="email"
                    label='Email'
                    value={userData.email}
                    variant="outlined"
                    sx={{width: '50%', marginBottom: 2 , marginTop: 2 }}
                    disabled
                    onChange={handleInputChange}
                  />
                </Box>
              </Box>
            </Box>

            <TextField
              required
              name="number"
              label="Phone Number"
              value={userData.number}
              variant="outlined"
              sx={{ width: '60%', marginBottom: 2 ,marginTop: 2}}
              disabled={!isEditing}
              onChange={handleInputChange}
              type="tel"
            />
            <Box>
            <TextField
              required
              name="description"
              label='Description'
              value={userData.description}
              variant="outlined"
              sx={{ width: '60%', marginBottom: 2 ,marginTop: 2}}
              disabled={!isEditing}
              onChange={handleInputChange}
            />
          </Box>
            <FormControl sx={{ width: '60%', marginBottom: 2 ,marginTop: 2}}>
              <InputLabel id="userType-label">User Type</InputLabel>
              <Select
                labelId="userType-label"
                name="userType"
                value={userData.userType}
                label="User Type"
                disabled={!isEditing}
                onChange={handleInputChange}
              >
                <MenuItem value={'default'}>Default</MenuItem>
                <MenuItem value={'landlord'}>Landlord</MenuItem>
                <MenuItem value={'estate agent'}>Estate Agent</MenuItem>
              </Select>
            </FormControl>

            {userData.userType !== 'default' && (
              <TextField
                required
                name="regNumber"
                label='Registration Number'
                value={userData.regNumber}
                variant="outlined"
                sx={{ width: '60%', marginBottom: 2 ,marginTop: 2}}
                disabled={!isEditing}
                onChange={handleInputChange}
              />
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {isEditing && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload Files
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleFiles}
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </Button>
                </Box>
              )}

<List>
            {files.map((file, index) => (
                <ListItem
                    key={file._id || index}
                    secondaryAction={
                        isEditing && (
                            <IconButton 
                                edge="end" 
                                aria-label="delete"
                                onClick={() => handleDeleteFile(index)}
                            >
                                <CloseIcon />
                            </IconButton>
                        )
                    }
                >
                    <InsertDriveFileIcon sx={{ mr: 1 }} />
                    {!isEditing ? (
                        <a 
                            href={file.url} 
                            download={file.filename}
                            style={{ 
                                textDecoration: 'none', 
                                color: 'inherit',
                                display: 'block',
                                width: '100%'
                            }}
                        >
                            <ListItemText 
                                primary={file.filename || `File ${index + 1}`}
                            />
                        </a>
                    ) : (
                        <ListItemText 
                            primary={file.filename || `File ${index + 1}`}
                        />
                    )}
                </ListItem>
            ))}
        </List>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          {isEditing && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          )}

          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}