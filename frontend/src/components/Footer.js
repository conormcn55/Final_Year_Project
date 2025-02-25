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

const Footer = ({ onThemeToggle, isDark }) => {
  const userData = useUserData();
  const navigate = useNavigate();

  const handleProtectedLink = (e, path) => {
    e.preventDefault();
    if (!userData._id) {
      window.location.href = `${process.env.REACT_APP_API_URL}/user/auth/google`;
    } else {
      navigate(path);
    }
  };

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
                <Link
                  href="/profile"
                  color="text.secondary"
                  underline="hover"
                  onClick={(e) => handleProtectedLink(e, '/profile')}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Profile
                </Link>
                <Link
                  href="/housessold"
                  color="text.secondary"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Houses Sold
                </Link>
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
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Email fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  conor.mcnultycleary.2022@mumail.ie
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOn fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Maynooth, Ireland
                </Typography>
              </Stack>
              <IconButton
                onClick={onThemeToggle}
                color="inherit"
                size="small"
              >
                {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Stack>
          </Stack>

          {/* Copyright - Bottom */}
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