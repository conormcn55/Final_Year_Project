import React from 'react';
import PropertyInfo from "../components/PropertyInfo";
import Bid from "../components/Bid";
import { Box, Container, Grid } from '@mui/material';

export default function PropertyPage() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <PropertyInfo />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ 
            position: 'sticky', 
            top: 24,
            pt: { xs: 0, md: 10 } // No padding on mobile, 80px (theme.spacing(10)) padding on desktop
          }}>
            <Bid />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}