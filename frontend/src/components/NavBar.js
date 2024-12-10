import * as React from "react";
import {
  Link,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
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
import useUserData from '../utils/useUserData';
import logo from '../images/logo.png';

const pages = [
  { label: "Create Listing", path: "/createlisting" },
  { label: "Houses Sold", path: "/housessold" },
];

export default function NavBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const userData = useUserData();
 
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async () => {
    try {
      await fetch('http://localhost:3001/api/user/logout', {
        method: 'GET',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileClick = () => {
    handleCloseUserMenu();
    window.location.href = '/profile';
  };

  const handleApprovalClick = () => {
    handleCloseUserMenu();
    window.location.href = '/approval';
  };
  const handleMessageClick = () => {
    handleCloseUserMenu();
    window.location.href = '/messages';
  };
  const handleFavouritesClick = () => {
    handleCloseUserMenu();
    window.location.href = '/favourites';
  };

  return (
    <Router>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
          <img 
              src={logo}
              alt="Logo"
              style={{ 
                display: { xs: "none", md: "flex" },
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
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Bid Bud
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.label} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">
                      <Link
                        to={page.path}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {page.label}
                      </Link>
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
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

            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: "none", md: "flex" }, 
                justifyContent: "center"  
              }}
            >
              {pages.map((page) => (
                <Button
                  key={page.label}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "inherit", display: "block" }}
                >
                  <Link
                    to={page.path}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {page.label}
                  </Link>
                </Button>
              ))}
            </Box>

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
                  color=""
                  href="http://localhost:3001/api/user/auth/google"
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
                <MenuItem onClick={handleProfileClick}>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Typography textAlign="center">Sign Out</Typography>
                </MenuItem>
                <MenuItem onClick={handleApprovalClick}>
                  <Typography textAlign="center">Bidding Requests</Typography>
                </MenuItem>
                <MenuItem onClick={handleMessageClick}>
                  <Typography textAlign="center">Messages</Typography>
                </MenuItem>
                <MenuItem onClick={handleFavouritesClick}>
                  <Typography textAlign="center">My Favourites</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/createlisting" element={<CreateListing />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:id" element={<OtherProfiles />} />
        <Route path="/housessold" element={<HistoricSales />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/property/:id" element={<PropertyPage />} /> 
        <Route path="/approval" element={<Approval />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/favourites" element={< FavouritesPage/>} />

      </Routes>
    </Router>
  );
}
