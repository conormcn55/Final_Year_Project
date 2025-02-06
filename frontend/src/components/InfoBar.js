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
    { icon: <Gavel sx={{ fontSize: 40 }}/>, label: 'Bid on Properties', description: 'Place real-time bids on properties across Ireland' },
    { icon: <AccountCircle sx={{ fontSize: 40 }}/>, label: 'Design Your Profile', description: 'Customize your profile and track your favorite properties' },
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
          Bid Bud is Ireland's innovative property bidding platform, featuring transparent real-time bidding on houses and apartments across Ireland.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3
          }}
        >
          At Bid Bud, you'll find a wide selection of properties with live bidding, including new homes, existing properties, and investment opportunities. Our platform ensures transparency and fairness in the property bidding process.
        </Typography>

        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          If you're looking for guidance, browse our{' '}
          <Link href="/guides" color="primary" underline="hover">
            guides
          </Link>
          {' '}section where you'll find plenty of information on the bidding process, property buying tips, and market insights.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  gap: 2
                }}
              >
                {feature.icon}
                <Typography
                  variant="h6"
                  component="p"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.palette.primary.dark
                  }}
                >
                  {feature.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary
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