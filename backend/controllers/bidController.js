const Bid = require('../models/bids');

exports.getAllBids = async (req, res) => {
    try {
        const bids = await Bid.find(); 
        res.json(bids);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving bids' });
    }
};

exports.createBid = async (req, res) => {
    const { userName, userId, propertyId, amount,time } = req.body;
    try {
        const newBid = new Bid({
            userName,
            userId,
            propertyId,
            amount,
            time
        });

        await newBid.save();
        res.status(201).json(newBid);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating bid' });
    }
};
exports.getBidsForProperty = async (req, res) => {
    const { id } = req.params;
  
    try {
      const bids = await Bid.find({ propertyId: id });
      res.json(bids);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving bids for the property' });
    }
  };