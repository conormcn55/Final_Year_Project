
const express = require('express');
const router = express.Router();
const requestController = require('../../controllers/requestController');

router.post('/new', requestController.createRequest);
router.put('/edit/:id', requestController.updateRequest);
router.get('/check/:userId/:propertyId', requestController.checkUserApproval);
router.get('/approver/:id', requestController.getRequestsApprover);
router.delete('/:id', requestController.deleteRequest);
module.exports = router;

