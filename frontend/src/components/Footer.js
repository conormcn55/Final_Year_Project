import React from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  Link,
  Button
} from '@mui/material';
import {
  Email,
  LocationOn,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import logo from '../images/logo.png';

const Footer = ({ onThemeToggle, isDark }) => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        py: 2, // Reduced padding top/bottom
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={2} alignItems="center"> {/* Reduced spacing between elements */}
          {/* Logo Section */}
          <Stack direction="row" spacing={1} alignItems="center"> {/* Reduced spacing */}
            <img 
              src={logo}
              alt="Logo"
              style={{ 
                height: "24px" // Reduced logo size
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".2rem", // Slightly reduced letter spacing
                fontSize: "1.1rem" // Reduced font size
              }}
            >
              Bid Bud
            </Typography>
          </Stack>

          {/* Navigation Links */}
          <Stack
            direction="row"
            spacing={2} // Reduced spacing
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1.5 // Reduced gap
            }}
          >
            <Link href="/profile" color="text.secondary" underline="hover">
              Profile
            </Link>
            <Link href="/housessold" color="text.secondary" underline="hover">
              Houses Sold
            </Link>
            <Link href="/favourites" color="text.secondary" underline="hover">
              Favourites
            </Link>
          </Stack>

          {/* Contact Info */}
          <Stack spacing={0.5} alignItems="center"> {/* Reduced spacing */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Email fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                conor.mcnultycleary.2022@mumail.ie
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Maynooth, Ireland
              </Typography>
            </Stack>
          </Stack>

          {/* Theme Toggle */}
          <Button
            onClick={onThemeToggle}
            startIcon={isDark ? <LightMode /> : <DarkMode />}
            color="inherit"
            size="small" // Reduced button size
            sx={{ my: 0.5 }} // Reduced margin
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>

          {/* Copyright */}
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ fontSize: '0.8rem' }} // Reduced font size
          >
            2025 Maynooth University Final Year Project
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;