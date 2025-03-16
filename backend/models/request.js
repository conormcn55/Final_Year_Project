/**
 * Request Model - Represents a user's request for permission to bid
 */

// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');
// Get the Schema constructor from mongoose
const Schema = mongoose.Schema;

/**
 * Define the Request schema structure
 * This schema represents a request made by a user to get approval
 * for bidding on a property, likely with a maximum bid amount
 */
const RequestSchema = new Schema({
    // MongoDB ID of the user making the request
    requesterId: { type: String, required: true },
    
    // MongoDB ID of the user who needs to approve the request
    approverId: { type: String, required: true },
    
    // MongoDB ID of the property the request is for
    propertyId: { type: String, required: true },
    
    // Maximum amount the requester is allowed to bid
    amountAllowed: { type: String, required: false },
    
    // Flag indicating whether the request has been approved
    approved: { type: Boolean, required: true }
    
    // Note: No timestamps are included to track when the request was made
    // or when it was approved/rejected
});

// Create the Request model from the schema
const Request = mongoose.model("Request", RequestSchema);

// Export the model 
module.exports = Request;