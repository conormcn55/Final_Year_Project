import React from 'react'; 
import PropertyInfo from "../components/PropertyInfo";
import Bid from "../components/Bid"; // Import Bid component
import { Box, Container, Grid } from '@mui/material';

// Define the PropertyPage functional component, displays property details and bidding interface
export default function PropertyPage() {
 return (
   <Container maxWidth="lg"> 
     <Grid container spacing={3}> 
       <Grid item xs={12} md={8}> 
         <PropertyInfo /> {/* Component showing property details */}
       </Grid>
       <Grid item xs={12} md={4}> 
         <Box sx={{ 
           position: 'sticky', // Sticky positioning
           top: 24, 
           pt: { xs: 0, md: 10 } 
         }}>
           <Bid /> {/* Component for bidding interface */}
         </Box>
       </Grid>
     </Grid>
   </Container>
 );
}