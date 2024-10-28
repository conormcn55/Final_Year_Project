
const express = require('express');
const router = express.Router();
const propertyController = require('../../controllers/propertyController');

// GET all properties
router.get('/', propertyController.getAllProperties);
// POST new property
router.post('/new', propertyController.createProperty);
// DELETE property by ID
router.delete('/delete/:id', propertyController.deleteProperty);
// PUT toggle sold status
router.put('/sold/:id', propertyController.toggleSoldStatus);
router.get('/search', propertyController.searchProperties);
module.exports = router;
