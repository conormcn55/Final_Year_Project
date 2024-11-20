
const express = require('express');
const router = express.Router();
const propertyController = require('../../controllers/propertyController');

router.get('/', propertyController.getAllProperties);
router.post('/new', propertyController.createProperty);
router.get('/endingsoon', propertyController.getSaleSoon);
router.get('/recent', propertyController.getRecentlyListed);
router.delete('/delete/:id', propertyController.deleteProperty);
router.put('/sold/:id', propertyController.toggleSoldStatus);
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getProperty);
router.delete('/clearProps', propertyController.deleteAllProperties);
router.put('/:id/bid', propertyController.updateCurrentBid);



module.exports = router;
