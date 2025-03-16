import ApprovalList from '../components/ApprovalList';// Import the ApprovalList 
import { Box } from '@mui/material';// Import Box component 

// Define the Approval functional component, this is for the approval page
const Approval = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.default', // Uses the default background color from the theme
        color: 'text.primary',         // Uses the primary text color from the theme
        minHeight: '100vh',            
        p: 3                           
      }}
    >
      {/* Renders the ApprovalList component within the Box container */}
      <ApprovalList />
    </Box>
  );
};
// Export the Approval component 
export default Approval;