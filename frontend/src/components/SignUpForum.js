import { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/system';

export default function SignUpForum({ userId }) {
 
  const [avatar, setAvatar] = useState(null);
  const [files, setFiles] = useState([]);
  const [dob, setDob] = useState(null);
  const VisuallyHiddenInput = styled('input')({
    display: 'none',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User ID:', userId);
    console.log('Avatar:', avatar);
    console.log('Files:', files);
    console.log('Date of Birth:', dob);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          required
          name="firstName"
          label="First Name"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          required
          name="lastName"
          label="Last Name"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          required
          name="email"
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <DatePicker
          label="Date Of Birth"
          value={dob}
          onChange={(newValue) => setDob(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
        />
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{ mt: 2 }}>
          Select Avatar
        </Button>
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{ mt: 2, ml: 2 }}>
          Upload Files
        </Button>
        <TextField
          required
          name="description"
          label="Description"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          required
          name="userType"
          label="User Type"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          required
          name="regNumber"
          label="Registration Number"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Submit
        </Button>
      </Box>
    </LocalizationProvider>
  );
}
