const express = require('express');
const router = express.Router();
const favouriteController = require('../../controllers/favouriteController');

router.post('/', favouriteController.createFavourite);
router.get('/:id', favouriteController.getUserFavourites);

router.delete('/unfavourite', favouriteController.unfavourite);

module.exports = router;
