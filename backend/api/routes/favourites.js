const express = require('express');
const router = express.Router();
const favouriteController = require('../../controllers/favouriteController');
// Here are the routes used for favourites
// Route to add a property to favourites
router.post('/', favouriteController.createFavourite);
// Route to get a user's favourite properties by user ID
router.get('/:id', favouriteController.getUserFavourites);
// Route to remove a property from favourites
router.delete('/unfavourite', favouriteController.unfavourite);
module.exports = router; // Export the router for use in the application
