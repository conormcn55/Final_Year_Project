const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/roomController');
// Routes for handling message rooms
// Route to create a new room
router.post('/new', roomController.createRoom);
// Route to get rooms associated with a specific user by ID
router.get('/get/:id', roomController.getUserRooms);
module.exports = router; // Export the router for use in the application
