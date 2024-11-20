const Request = require('../models/request');
exports.createRequest = async (req, res) => {
    try {
        const request  = new Request({
            requesterId: req.body.requesterId,
            approverId: req.body.approverId,
            propertyId: req.body.propertyId,
            amountAllowed: 0,
            approved: false
        });
        const savedRequest = await request.save();
        res.status(201).json({
            success: true,
            message: 'Request created successfully',
            request: savedRequest,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to create Request',
            error: error.message,
        });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        
        const request = await Request.findById(requestId);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        const updatedFields = {
            requesterId: request.requesterId,
            approverId: request.approverId,
            propertyId: request.propertyId,
            amountAllowed: req.body.amountAllowed,
            approved: req.body.approved
        };
        const updatedRequest = await Request.findByIdAndUpdate(
            requestId,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            request: updatedRequest, 
        });

    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update Request',
            error: error.message,
        });
    }
};

exports.checkUserApproval = async (req, res) => {
    try {
        const { userId, propertyId } = req.params;
        
        const request = await Request.findOne({ 
            requesterId: userId,
            propertyId: propertyId
        });
        
        // If no request exists
        if (!request) {
            return res.status(200).json({
                exists: false,
                approved: false,
                message: 'No request found'
            });
        }
        
        // If request exists, return its status
        return res.status(200).json({
            exists: true,
            approved: request.approved,
            amountAllowed: request.amountAllowed,
            message: request.approved ? 'User is approved' : 'Request pending approval'
        });
    } catch (error) {
        console.error('Check approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check approval status',
            error: error.message
        });
    }
};

exports.getRequestsApprover = async (req, res) => {
    try {
        const approverId = req.params.id;
        const requests = await Request.find({ approverId: approverId });
        
        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            requests: requests,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to retrieve requests',
            error: error.message,
        });
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const deletedRequest = await Request.findByIdAndDelete(requestId);

        if (!deletedRequest) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete request',
            error: error.message,
        });
    }
};
