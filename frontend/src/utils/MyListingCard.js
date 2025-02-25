import React, { useState } from 'react';
import axios from 'axios';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import PropertyCard from './PropertyCard';

const MyListingCard = ({ property, onDelete, ...props }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/property/delete/${property._id}`);
      onDelete?.(property._id);
    } catch (err) {
      console.error('Error deleting property:', err);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <PropertyCard property={property} {...props} />
        <IconButton
          size="small"
          aria-label="delete property"
          onClick={handleDeleteClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.paper',
              color: 'error.main'
            }
          }}
        >
          <DeleteOutline />
        </IconButton>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          Are you sure you want to remove this property?
        </DialogContent>
        <DialogActions>
        <Button 
          onClick={() => setDeleteDialogOpen(false)}
          sx={{
            bgcolor: 'secondary.main',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'secondary.dark'
            }
          }}
          >
          Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyListingCard;