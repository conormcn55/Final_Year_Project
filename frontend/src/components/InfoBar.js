import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Link,
  useTheme
} from '@mui/material';
import { Gavel, AccountCircle, History } from '@mui/icons-material';

/**
 * InfoBar Component
 * 
 * A section that highlights key features of Bid Bud.
 * Displays a heading, description text, and
 * three feature cards with icons.
 */
const InfoBar = () => {
  // Access the current theme to use theme-based styling
  const theme = useTheme();
  
  // Array of feature objects containing icon, label, and description for each feature card
  const features = [
    { 
      icon: <Gavel sx={{ fontSize: 40 }}/>, 
      label: 'Bid on Properties', 
      description: 'Place real-time and transparent bids on both sales and rentals' 
    },
    { 
      icon: <AccountCircle sx={{ fontSize: 40 }}/>, 
      label: 'Design Your Profile', 
      description: 'Customise your profile, request approval and follow your favorite properties' 
    },
    { 
      icon: <History sx={{ fontSize: 40 }}/>, 
      label: 'View Property History', 
      description: 'Access data on previously sold properties' 
    }
  ];
  
  return (
    // Container with maximum width 'lg' and vertical margin of 4 units
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Main content box with centered text and bottom margin */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        {/* Main heading */}
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 3
          }}
        >
          Looking to explore properties in Ireland?
        </Typography>
        
        {/* Subheading with description of the platform */}
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3
          }}
        >
          Bid Bud is an innovative property bidding platform, featuring transparent real-time bidding on houses and apartments across Ireland.
        </Typography>
        
        {/* First paragraph of additional information */}
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3
          }}
        >
          At Bid Bud, you'll find a wide selection of properties with live bidding, including new homes, existing properties, sales, and rentals.
        </Typography>
        
        {/* Second paragraph with call to action */}
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Create your profile today and upload items such as your mortage approval, rental references etc, to be approved for bidding.
        </Typography>
        
        {/* Grid container for the three feature cards with spacing of 3 units */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {/* Map through each feature to create a card */}
          {features.map((feature, index) => (
            // Grid item that takes full width on xs screens and 1/3 width on md screens
            <Grid item xs={12} md={4} key={index}>
              {/* Paper component for each feature card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme.palette.secondary.main,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  gap: 2
                }}
              >
                {/* Clone the icon element to add custom styling */}
                {React.cloneElement(feature.icon, {
                  sx: { fontSize: 40, color: theme.palette.primary.main }
                })}
                {/* Feature title */}
                <Typography
                  variant="h6"
                  component="p"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.palette.primary.main
                  }}
                >
                  {feature.label}
                </Typography>
                {/* Feature description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.main
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default InfoBar;