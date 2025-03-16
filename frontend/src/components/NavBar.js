import * as React from "react";
import {
  Link,
  Route,
  Routes,
  Navigate,
  useNavigate
} from "react-router-dom";
import { useState, useEffect } from 'react';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
// Page components
import Home from "../pages/Home";
import CreateListing from "../pages/CreateListing";
import UserProfile from "../pages/UserProfile";
import OtherProfiles from "../pages/OtherProfiles";
import HistoricSales from "../pages/HistoricSales";
import SearchResults from "./SearchResults";
import PropertyPage from "../pages/PropertyPage";
import MessagesPage from "../pages/MessagesPage";
import FavouritesPage from "../pages/FavouritesPage";
import Approval from "../pages/Approval";
import MyListings from "../pages/MyListings";
// Custom hooks and assets
import useUserData from '../utils/useUserData';
import logo from '../images/logo.png';

/**
 * ProtectedRoute component - Manages route access based on user roles
 */
const ProtectedRoute = ({ element: Element, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const userData = useUserData();

  // Check user authorization when userData changes
  useEffect(() => {
    if (userData.userType) {
      setIsAllowed(allowedRoles.includes(userData.userType));
      setIsLoading(false);
    }
  }, [userData.userType, allowedRoles]);

  // Show loading state while checking permissions
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  // Either render the protected component or redirect to home
  return isAllowed ? Element : <Navigate to="/" replace />;
};

/**
 * NavBar component - Main navigation and routing for the application
 */
export default function NavBar({ onThemeToggle, isDark }) {
  // State for user dropdown menu
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  
  // Get user data from custom hook
  const userData = useUserData();
  const navigate = useNavigate();
  
  // Determine user type for conditional rendering
  const isAgent = userData.userType === 'estate agent';
  const isLandlord = userData.userType === 'landlord';
  const canCreateListing = isAgent || isLandlord;

  // Event handlers for user dropdown menu
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  /**
   * Get menu items based on user role
   */
  const getMenuItems = () => {
    // Menu items available to all logged-in users
    const baseItems = [
      { label: "Profile", path: "/profile" },
      { label: "Houses Sold", path: "/housessold" },
      { label: "Messages", path: "/messages" },
      { label: "My Favourites", path: "/favourites" },
    ];

    // Additional menu items for agents and landlords
    const agentLandlordItems = [
      { label: "Create Listing", path: "/createlisting" },
      { label: "My Listings", path: "/mylistings" },
      { label: "Bidding Requests", path: "/approval" },
    ];

    // Combine the items based on user role
    return canCreateListing ? [...baseItems, ...agentLandlordItems] : baseItems;
  };

  // Navigate to selected menu item and close menu
  const handleMenuClick = (path) => {
    handleCloseUserMenu();
    navigate(path);
  };

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      // Call logout API endpoint
      await fetch(`${process.env.REACT_APP_API_URL}/user/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle theme toggle and close menu
  const handleThemeToggle = () => {
    onThemeToggle();
    handleCloseUserMenu();
  };

  return (
    <>
      {/* App bar with navigation controls */}
      <AppBar 
        position="static" 
        elevation={0}
        color="transparent"
        sx={{ 
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* App logo */}
            <img 
              src={logo}
              alt="Logo"
              style={{ 
                marginRight: "8px",
                height: "32px" 
              }}
            />
            {/* App name/title with link to home */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Bid Bud
            </Typography>

            {/* User menu section */}
            <Box sx={{ flexGrow: 0 }}>
              {userData._id ? (
                // Show avatar and settings menu for logged-in users
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={userData.name || "User Avatar"}
                      src={userData.avatar?.url || "/static/images/avatar/2.jpg"}
                    />
                  </IconButton>
                </Tooltip>
              ) : (
                // Show sign-in button for logged-out users
                <Button
                  variant="contained"
                  color="primary"
                  href={`${process.env.REACT_APP_API_URL}/user/auth/google`}
                  sx={{ my: 2 }}
                >
                  Sign In
                </Button>
              )}
              {/* Dropdown menu for user settings */}
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {/* Dynamic menu items based on user role */}
                {getMenuItems().map((item) => (
                  <MenuItem key={item.label} onClick={() => handleMenuClick(item.path)}>
                    <Typography textAlign="center">{item.label}</Typography>
                  </MenuItem>
                ))}
                {/* Theme toggle option */}
                <MenuItem onClick={handleThemeToggle}>
                  <Typography textAlign="center" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                    {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                  </Typography>
                </MenuItem>
                {/* Sign out option */}
                <MenuItem onClick={handleSignOut}>
                  <Typography textAlign="center">Sign Out</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Application routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:id" element={<OtherProfiles />} />
        <Route path="/housessold" element={<HistoricSales />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/property/:id" element={<PropertyPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        
        {/* Protected routes - restricted by user role */}
        <Route 
          path="/createlisting" 
          element={
            <ProtectedRoute 
              element={<CreateListing />} 
              allowedRoles={['estate agent', 'landlord']} 
            />
          } 
        />
        <Route 
          path="/approval" 
          element={
            <ProtectedRoute 
              element={<Approval />} 
              allowedRoles={['estate agent', 'landlord']} 
            />
          } 
        />
        <Route 
          path="/mylistings" 
          element={
            <ProtectedRoute 
              element={<MyListings />} 
              allowedRoles={['estate agent', 'landlord']} 
            />
          } 
        />
      </Routes>
    </>
  );
}