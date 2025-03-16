const express = require('express');
const router = express.Router();
const bidsController = require('../../controllers/bidController');
// Here are the routes used for bidding
// Route to create a new bid
router.post('/newbid/', bidsController.createBid);
// Route to get all bids
router.get('/', bidsController.getAllBids);
// Route to get all bids for a specific property by property ID
router.get('/propertyBid/:id', bidsController.getBidsForProperty);
// Route to get a specific bid by bid ID
router.get('/:id', bidsController.getBidById);
module.exports = router; // Export the router for use in the application
