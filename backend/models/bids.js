/**
 * Bid Model - Represents a bid placed on a property 
 */

// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');
// Get the Schema constructor from mongoose
const Schema = mongoose.Schema;

/**
 * Define the Bid schema structure
 * This schema represents a bid placed by a user on a property
 */
const BidSchema = new Schema({
    // Name of the user who placed the bid
    userName: { type: String, required: true },
    // MongoDB ID of the user who placed the bid
    userId: { type: String, required: true },
    // MongoDB ID of the property being bid on
    propertyId: { type: String, required: true },
    // Bid amount (stored as string rather than Number)
    amount: { type: String, required: true },
    // Timestamp when the bid was placed, defaults to current time
    time: { type: Date, default: Date.now }
});

// Create the Bid model from the schema
const Bid = mongoose.model("Bid", BidSchema);

// Export the model 
module.exports = Bid;