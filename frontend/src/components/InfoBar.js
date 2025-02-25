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

const InfoBar = () => {
  const theme = useTheme();

  const features = [
    { icon: <Gavel sx={{ fontSize: 40 }}/>, label: 'Bid on Properties', description: 'Place real-time and transparent bids on both sales and rentals' },
    { icon: <AccountCircle sx={{ fontSize: 40 }}/>, label: 'Design Your Profile', description: 'Customise your profile, request approval and follow your favorite properties' },
    { icon: <History sx={{ fontSize: 40 }}/>, label: 'View Property History', description: 'Access data on previously sold properties' }
  ];

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
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

        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3
          }}
        >
          Bid Bud is an innovative property bidding platform, featuring transparent real-time bidding on houses and apartments across Ireland.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3
          }}
        >
          At Bid Bud, you'll find a wide selection of properties with live bidding, including new homes, existing properties, sales, and rentals.
        </Typography>

        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Create your profile today and upload items such as your mortage approval, rental references etc, to be approved for bidding.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
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
              {React.cloneElement(feature.icon, {
                sx: { fontSize: 40, color: theme.palette.primary.main }
              })}
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