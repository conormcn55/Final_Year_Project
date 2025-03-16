/**
 * Message Model - Represents a message sent in a chat room
 */

// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');
// Get the Schema constructor from mongoose
const Schema = mongoose.Schema;

/**
 * Define the Message schema structure
 * This schema represents a message sent by a user in a specific chat room
 */
const MessageSchema = new Schema({
    // MongoDB ID or username of the user who sent the message
    sentBy: { type: String, required: true },
    // Identifier for the chat room where the message was sent
    room: { type: String, required: true },
    // The actual content of the message
    message: { type: String, required: true },
    // Timestamp when the message was sent (explicitly required)
    time: { type: Date, required: true }
});

// Create the Message model from the schema
const Message = mongoose.model("Message", MessageSchema);

// Export the model 
module.exports = Message;