// Import the Bid model from models directory
const Bid = require('../models/bids');

// Controller to get all bids from the database
exports.getAllBids = async (req, res) => {
    try {
        // Find all bid documents in the database
        const bids = await Bid.find();
        
        // Return bids as JSON response
        res.json(bids);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error retrieving bids' });
    }
};

// Controller to create a new bid
exports.createBid = async (req, res) => {
    // Extract bid details from request body using destructuring
    const { userName, userId, propertyId, amount, time } = req.body;
    
    try {
        // Check if a bid with the same amount already exists for this property
        const existingBid = await Bid.findOne({ propertyId, amount });
        
        // If duplicate bid found, return 400 error
        if (existingBid) {
            return res.status(400).json({ message: 'A bid with this amount already exists for this property' });
        }

        // Create new bid instance with the provided details
        const newBid = new Bid({
            userName,
            userId,
            propertyId,
            amount,
            time
        });
        
        // Save the new bid to the database
        await newBid.save();
        // Return 201 status (Created) with the newly created bid
        res.status(201).json(newBid);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error creating bid' });
    }
};

// Controller to get all bids for a specific property
exports.getBidsForProperty = async (req, res) => {
    // Extract property ID from request parameters
    const { id } = req.params;
    
    try {
        // Find all bids associated with the specified property ID
        const bids = await Bid.find({ propertyId: id });
        // Return bids as JSON response
        res.json(bids);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error retrieving bids for the property' });
    }
};

// Controller to get a specific bid by its ID
exports.getBidById = async (req, res) => {
    // Extract bid ID from request parameters
    const { id } = req.params;
    try {
        // Find the bid with the specified ID
        const bid = await Bid.findById(id);
        // If no bid found, return 404 error
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        // Return the bid as JSON response
        res.json(bid);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error retrieving the bid' });
    }
};