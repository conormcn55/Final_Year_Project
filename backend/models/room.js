/**
 * Room Model - Represents a chat room between a property owner and a bidder
 */

// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');
// Get the Schema constructor from mongoose
const Schema = mongoose.Schema;

/**
 * Define the Room schema structure
 * This schema represents a chat room or conversation channel 
 * between a property owner and a potential bidder
 */
const RoomSchema = new Schema({
    // MongoDB ID of the user who is bidding or interested in a property
    bidder: { type: String, required: true },
    
    // MongoDB ID of the property owner or listing agent
    owner: { type: String, required: true },
    
    // Note: No reference to a specific property ID is included
    // Note: No timestamps are included to track when the room was created
});

// Create the Room model from the schema
const Room = mongoose.model("Room", RoomSchema);

// Export the model 
module.exports = Room;