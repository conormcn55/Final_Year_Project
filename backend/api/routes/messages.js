const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/messageController');

router.get('/:room', messageController.getMessages);
router.post('/', messageController.sendMessage);

module.exports = router;
