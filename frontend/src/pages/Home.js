import React from 'react'; // Import React
import { Box } from '@mui/material'; // Import Box component from Material UI
import SearchBar from '../utils/SearchBar'; // Import SearchBar component
import RecentlyListed from '../components/cards/RecentlyListed'; // Import RecentlyListed component
import EndingSoon from '../components/cards/EndingSoon'; // Import EndingSoon component
import InfoBar from '../components/InfoBar'; // Import InfoBar component

// Define the Home functional component, serves as the main landing page
const Home = () => {
   return (
       <Box> {/* Main container */}
           <SearchBar soldStatus="false" title="Find Your New Property" /> {/* Search bar for available properties */}
           <InfoBar /> {/* Information bar component */}
           <Box
               sx={{
                   display: 'flex', 
                   flexDirection: { xs: 'column', md: 'row' }, // Column layout on small screens, row on medium and up
                   gap: 2, 
               }}
           >
               <Box sx={{ flex: 1 }}> {/* Left column/section  */}
                   <RecentlyListed /> {/* Component showing recently listed properties */}
               </Box>
               <Box sx={{ flex: 1 }}> {/* Right column/section  */}
                   <EndingSoon /> {/* Component showing auctions ending soon */}
               </Box>
           </Box>
       </Box>
   );
};

// Export the Home component
export default Home;