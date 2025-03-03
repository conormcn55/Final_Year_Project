const express = require('express');
const router = express.Router();
const bidsController = require('../../controllers/bidController');

router.post('/newbid/', bidsController.createBid);

router.get('/', bidsController.getAllBids);

router.get('/propertyBid/:id', bidsController.getBidsForProperty);
router.get('/:id', bidsController.getBidById);
module.exports = router;
