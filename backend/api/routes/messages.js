const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/messageController');
// Here are the routes used for messaging
// Route to get messages from a specific room
router.get('/:room', messageController.getMessages);
// Route to send a new message
router.post('/', messageController.sendMessage);
module.exports = router; // Export the router for use in the application
