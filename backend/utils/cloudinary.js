// Import the Cloudinary SDK
const cloudinary = require('cloudinary').v2;

// Load environment variables from a .env file into process.env
require('dotenv').config();

// Configure the Cloudinary SDK with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,    // Your Cloudinary cloud name
    api_key: process.env.CLOUD_KEY,        // Your Cloudinary API key
    api_secret: process.env.CLOUD_KEY_SECRET  // Your Cloudinary API secret
});

// Export the configured Cloudinary instance to be used in other files
module.exports = cloudinary;