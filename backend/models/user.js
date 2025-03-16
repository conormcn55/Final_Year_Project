/**
 * User Model - Represents a user in the property marketplace system
 */

// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;  

/**
 * Define the User schema structure
 * This schema represents users with different roles in the property system
 */
const UserSchema = new Schema({
    // User's full name
    name: {
        type: String,
        required: true
    },
    
    // Google ID for OAuth authentication 
    googleId: {
        type: String,
        required: true
    },
    
    // User's email address
    email: {
        type: String,
        required: true
    },
    
    // User's phone number (optional)
    number: {
        type: String,
        required: false
    },
    
    // User's avatar/profile picture (stored in Cloudinary)
    avatar: {
        public_id: {
            type: String,
            required: false // Optional
        },
        url: {
            type: String,
            required: false // Optional
        }
    },
    
    // Array of files associated with the user 
    files: [
        {
            public_id: {
                type: String,
                required: false // Optional
            },
            url: {
                type: String,
                required: false // Optional
            },
            filename: {
                type: String,
                required: false // Optional
            }
        }
    ],
    
    // User's description or bio (optional)
    description: {
        type: String,
        required: false
    },
    
    // Type of user (e.g., buyer, seller, agent)
    userType: {
        type: String,
        required: true
    },
    
    // Registration number (likely for agents/brokers)
    regNumber: {
        type: String,
        required: false // Optional
    },
}) 

// Create the User model from the schema
const User = mongoose.model("User", UserSchema); 

// Export the model for use in other files
module.exports = User;