import ApprovalList from '../components/ApprovalList';
import { Box } from '@mui/material';

const Approval = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
        p: 3
      }}
    >
      <ApprovalList />
    </Box>
  );
};

export default Approval;