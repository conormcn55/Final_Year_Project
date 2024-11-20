const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BidSchema = new Schema({
    userName: { type: String, required: true },
    userId: { type: String, required: true },
    propertyId: { type: String, required: true },
    amount: { type: String, required: true },
    time: { type: Date, default: Date.now }
});

const Bid = mongoose.model("Bid", BidSchema);
module.exports = Bid;