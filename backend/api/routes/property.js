const express = require('express');
const router = express.Router();
const propertyController = require('../../controllers/propertyController');
// Here are the routes used for property functions
// Route to get all properties
router.get('/', propertyController.getAllProperties);
// Route to create a new property listing
router.post('/new', propertyController.createProperty);
// Route to get properties with sales ending soon
router.get('/endingsoon', propertyController.getSaleSoon);
// Route to get recently listed properties
router.get('/recent', propertyController.getRecentlyListed);
// Route to delete a property by ID
router.delete('/delete/:id', propertyController.deleteProperty);
// Route to toggle the sold status of a property by ID
router.put('/sold/:id', propertyController.toggleSoldStatus);
// Route to search properties based on query parameters
router.get('/search', propertyController.searchProperties);
// Route to get a specific property by ID
router.get('/:id', propertyController.getProperty);
// Route to update the current bid for a property by ID
router.put('/:id/bid', propertyController.updateCurrentBid);
// Route to get multiple properties by an array of IDs
router.post('/ids', propertyController.getPropertiesByIds);
// Route to get properties listed by a specific lister
router.get('/lister/:listerId', propertyController.getPropertiesByListerId);
module.exports = router; // Export the router for use in the application
