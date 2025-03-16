const express = require('express');
const propertyRoutes = require('./routes/property');
const userRoutes = require('./routes/user');
const bidsRoutes = require('./routes/bids');
const requestRoutes = require('./routes/request');
const roomRoutes = require('./routes/room');
const messageRoutes = require('./routes/messages');
const favouriteRoutes = require('./routes/favourites');

const router = express.Router();

// Middleware to check if a user is logged in
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

// Define route mappings for different modules
router.use('/api/property', propertyRoutes);
router.use('/api/user', userRoutes);
router.use('/api/bids', bidsRoutes);
router.use('/api/request', requestRoutes);
router.use('/api/room', roomRoutes);
router.use('/api/messages', messageRoutes);
router.use('/api/favourites', favouriteRoutes);

// Protected route that requires authentication
router.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.id}`);
});

module.exports = router; // Export the router for use in the application
