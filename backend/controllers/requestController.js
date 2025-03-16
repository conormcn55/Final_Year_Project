/**
 * Request Controller
 * Handles operations related to bidding approval requests
 * including creating, updating, checking, and deleting request records
 */
const Request = require('../models/request');

/**
 * Creates a new request for bidding approval
 * New requests are created with 0 amount allowed and not approved by default
 */
exports.createRequest = async (req, res) => {
    try {
        // Create a new request with data from request body
        const request = new Request({
            requesterId: req.body.requesterId,  // User requesting approval
            approverId: req.body.approverId,    // User who will approve/reject
            propertyId: req.body.propertyId,    // Property user wants to bid on
            amountAllowed: 0,                   // Default amount allowed (0)
            approved: false                     // Default approval status (false)
        });
        
        // Save the request to the database
        const savedRequest = await request.save();
        
        // Return 201 status (Created) with the saved request
        res.status(201).json({
            success: true,
            message: 'Request created successfully',
            request: savedRequest,
        });
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 400 status code with error details
        res.status(400).json({
            success: false,
            message: 'Failed to create Request',
            error: error.message,
        });
    }
};

/**
 * Updates an existing request, typically to approve/reject
 * and set the amount allowed for bidding
 */
exports.updateRequest = async (req, res) => {
    try {
        // Get request ID from URL parameters
        const requestId = req.params.id;
        
        // Find the request in the database
        const request = await Request.findById(requestId);
        
        // If request not found, return 404 error
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        // Prepare updated fields, maintaining original requester, approver, and property
        const updatedFields = {
            requesterId: request.requesterId,
            approverId: request.approverId,
            propertyId: request.propertyId,
            amountAllowed: req.body.amountAllowed,  // New amount allowed
            approved: req.body.approved             // New approval status
        };
        
        // Update the request in the database
        const updatedRequest = await Request.findByIdAndUpdate(
            requestId,
            { $set: updatedFields },
            { new: true, runValidators: true }  // Return updated document and run validators
        );

        // Return success response with updated request
        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            request: updatedRequest, 
        });

    } catch (error) {
        // Log any errors that occur during the operation
        console.error('Update request error:', error);
        // Return 500 status code with error details
        res.status(500).json({
            success: false,
            message: 'Failed to update Request',
            error: error.message,
        });
    }
};

/**
 * Checks if a user has an approval request for a specific property
 * and returns the approval status and amount allowed
 */
exports.checkUserApproval = async (req, res) => {
    try {
        // Get user ID and property ID from URL parameters
        const { userId, propertyId } = req.params;
        
        // Find request matching the user and property
        const request = await Request.findOne({ 
            requesterId: userId,
            propertyId: propertyId
        });
        
        // If no request exists, return exists:false status
        if (!request) {
            return res.status(200).json({
                exists: false,
                approved: false,
                message: 'No request found'
            });
        }
        
        // If request exists, return its status details
        return res.status(200).json({
            exists: true,
            approved: request.approved,
            amountAllowed: request.amountAllowed,
            message: request.approved ? 'User is approved' : 'Request pending approval'
        });
    } catch (error) {
        // Log any errors that occur during the operation
        console.error('Check approval error:', error);
        // Return 500 status code with error details
        res.status(500).json({
            success: false,
            message: 'Failed to check approval status',
            error: error.message
        });
    }
};

/**
 * Gets all requests assigned to a specific approver
 */
exports.getRequestsApprover = async (req, res) => {
    try {
        // Get approver ID from URL parameters
        const approverId = req.params.id;
        
        // Find all requests assigned to this approver
        const requests = await Request.find({ approverId: approverId });
        
        // Return the list of requests
        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            requests: requests,
        });
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 400 status code with error details
        res.status(400).json({
            success: false,
            message: 'Failed to retrieve requests',
            error: error.message,
        });
    }
};

/**
 * Deletes a request by ID
 */
exports.deleteRequest = async (req, res) => {
    try {
        // Get request ID from URL parameters
        const requestId = req.params.id;
        
        // Find and delete the request
        const deletedRequest = await Request.findByIdAndDelete(requestId);

        // If request not found, return 404 error
        if (!deletedRequest) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
        });
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error details
        res.status(500).json({
            success: false,
            message: 'Failed to delete request',
            error: error.message,
        });
    }
};