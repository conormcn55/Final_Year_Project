import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  Link,
  Button,
  IconButton
} from '@mui/material';
import {
  Email,
  LocationOn,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import useUserData from '../utils/useUserData';
import logo from '../images/logo.png';

/**
 * Footer Component
 * 
 * Renders the application footer with navigation links, contact information,
 * and theme toggle functionality. Also handles authentication redirects for
 * protected routes.
 * 
 */
const Footer = ({ onThemeToggle, isDark }) => {
  // Get current user data from custom hook
  const userData = useUserData();
  // Initialize navigate function for routing
  const navigate = useNavigate();

  /**
   * Handles clicks on protected links
   * Redirects to Google authentication if user is not logged in
   * Otherwise navigates to the requested path
   */
  const handleProtectedLink = (e, path) => {
    e.preventDefault();
    if (!userData._id) {
      // Redirect to authentication if user is not logged in
      window.location.href = `${process.env.REACT_APP_API_URL}/user/auth/google`;
    } else {
      // Navigate to requested path if user is logged in
      navigate(path);
    }
  };

  /**
   * Handles click on the logo to navigate to homepage
   */
  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        py: 1,
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={1}>
          {/* Main Content Row */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            {/* Left Side - Logo and Links */}
            <Stack direction="row" spacing={3} alignItems="center">
              {/* Clickable Logo */}
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center"
                onClick={handleLogoClick}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: "20px"
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: ".1rem",
                    fontSize: "1rem"
                  }}
                >
                  Bid Bud
                </Typography>
              </Stack>

              {/* Navigation Links */}
              <Stack direction="row" spacing={2}>
                {/* Profile link - Protected route */}
                <Link
                  href="/profile"
                  color="text.secondary"
                  underline="hover"
                  onClick={(e) => handleProtectedLink(e, '/profile')}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Profile
                </Link>
                {/* Houses Sold link - Public route */}
                <Link
                  href="/housessold"
                  color="text.secondary"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Houses Sold
                </Link>
                {/* Favourites link - Protected route */}
                <Link
                  href="/favourites"
                  color="text.secondary"
                  underline="hover"
                  onClick={(e) => handleProtectedLink(e, '/favourites')}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Favourites
                </Link>
              </Stack>
            </Stack>

            {/* Right Side - Contact and Theme */}
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Email contact info */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Email fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  conor.mcnultycleary.2022@mumail.ie
                </Typography>
              </Stack>
              {/* Location info */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOn fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Maynooth, Ireland
                </Typography>
              </Stack>
              {/* Theme toggle button */}
              <IconButton
                onClick={onThemeToggle}
                color="inherit"
                size="small"
              >
                {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Stack>
          </Stack>

          {/* Project information */}
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ fontSize: '0.75rem' }}
          >
            2025 Maynooth University Final Year Project
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;