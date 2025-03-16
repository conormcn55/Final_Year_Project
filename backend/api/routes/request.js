const express = require('express');
const router = express.Router();
const requestController = require('../../controllers/requestController');
// Routes for handling approval requests
// Route to create a new approval request
router.post('/new', requestController.createRequest);
// Route to update an existing approval request by ID
router.put('/edit/:id', requestController.updateRequest);
// Route to check if a user has approval for a specific property
router.get('/check/:userId/:propertyId', requestController.checkUserApproval);
// Route to get all requests assigned to a specific approver by ID
router.get('/approver/:id', requestController.getRequestsApprover);
// Route to delete an approval request by ID
router.delete('/:id', requestController.deleteRequest);
module.exports = router; // Export the router for use in the application
