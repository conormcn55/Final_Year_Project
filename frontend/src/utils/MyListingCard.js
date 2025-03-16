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

// MyListingCard component - displays a property card with the option to delete
const MyListingCard = ({ property, onDelete, ...props }) => {
 // State to control the delete confirmation dialog
 const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

 // Handler for delete button click - opens the confirmation dialog
 const handleDeleteClick = (e) => {
   // Prevent event propagation to parent elements
   e.stopPropagation();
   // Open the delete confirmation dialog
   setDeleteDialogOpen(true);
 };

 // Handler for delete confirmation - performs the actual deletion
 const handleDeleteConfirm = async () => {
   try {
     // API call to delete the property
     await axios.delete(`${process.env.REACT_APP_API_URL}/property/delete/${property._id}`);
     // Call the onDelete callback if provided to update the parent component
     onDelete?.(property._id);
   } catch (err) {
     // Log any errors that occur during deletion
     console.error('Error deleting property:', err);
   }
   // Close the dialog regardless of success or failure
   setDeleteDialogOpen(false);
 };

 return (
   <>
     {/* Container for the property card with delete button */}
     <Box sx={{ position: 'relative' }}>
       {/* Render the property card with all props passed down */}
       <PropertyCard property={property} {...props} />
       {/* Delete button positioned in the top-right corner */}
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

     {/* Delete confirmation dialog */}
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
         {/* Cancel button with custom styling */}
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
         {/* Delete confirmation button with error styling */}
         <Button onClick={handleDeleteConfirm} color="error" variant="contained">
           Delete
         </Button>
       </DialogActions>
     </Dialog>
   </>
 );
};

// Export the component
export default MyListingCard;