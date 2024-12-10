
const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/roomController');

router.post('/new', roomController.createRoom);
router.get('/get/:id', roomController.getUserRooms);
module.exports = router;

