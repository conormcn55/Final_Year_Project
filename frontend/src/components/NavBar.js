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
import useUserData from '../utils/useUserData';
import logo from '../images/logo.png';

const ProtectedRoute = ({ element: Element, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const userData = useUserData();

  useEffect(() => {
    if (userData.userType) {
      setIsAllowed(allowedRoles.includes(userData.userType));
      setIsLoading(false);
    }
  }, [userData.userType, allowedRoles]);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return isAllowed ? Element : <Navigate to="/" replace />;
};

export default function NavBar({ onThemeToggle, isDark }) {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const userData = useUserData();
  const navigate = useNavigate();
  const isAgent = userData.userType === 'estate agent';
  const isLandlord = userData.userType === 'landlord';
  const canCreateListing = isAgent || isLandlord;

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const getMenuItems = () => {
    const baseItems = [
      { label: "Profile", path: "/profile" },
      { label: "Houses Sold", path: "/housessold" },
      { label: "Messages", path: "/messages" },
      { label: "My Favourites", path: "/favourites" },
    ];

    const agentLandlordItems = [
      { label: "Create Listing", path: "/createlisting" },
      { label: "My Listings", path: "/mylistings" },
      { label: "Bidding Requests", path: "/approval" },
    ];

    return canCreateListing ? [...baseItems, ...agentLandlordItems] : baseItems;
  };

  const handleMenuClick = (path) => {
    handleCloseUserMenu();
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/user/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleThemeToggle = () => {
    onThemeToggle();
    handleCloseUserMenu();
  };

  return (
    <>
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
            <img 
              src={logo}
              alt="Logo"
              style={{ 
                marginRight: "8px",
                height: "32px" 
              }}
            />
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

            <Box sx={{ flexGrow: 0 }}>
              {userData._id ? (
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={userData.name || "User Avatar"}
                      src={userData.avatar?.url || "/static/images/avatar/2.jpg"}
                    />
                  </IconButton>
                </Tooltip>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  href={`${process.env.REACT_APP_API_URL}/user/auth/google`}
                  sx={{ my: 2 }}
                >
                  Sign In
                </Button>
              )}
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
                {getMenuItems().map((item) => (
                  <MenuItem key={item.label} onClick={() => handleMenuClick(item.path)}>
                    <Typography textAlign="center">{item.label}</Typography>
                  </MenuItem>
                ))}
                <MenuItem onClick={handleThemeToggle}>
                  <Typography textAlign="center" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                    {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Typography textAlign="center">Sign Out</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/createlisting" 
          element={
            <ProtectedRoute 
              element={<CreateListing />} 
              allowedRoles={['estate agent', 'landlord']} 
            />
          } 
        />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:id" element={<OtherProfiles />} />
        <Route path="/housessold" element={<HistoricSales />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/property/:id" element={<PropertyPage />} />
        <Route 
          path="/approval" 
          element={
            <ProtectedRoute 
              element={<Approval />} 
              allowedRoles={['estate agent', 'landlord']} 
            />
          } 
        />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
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