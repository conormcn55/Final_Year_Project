/**
 * Property Model - Represents a real estate property listing
 */

// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');
// Get the Schema constructor from mongoose
const Schema = mongoose.Schema;

/**
 * Define the Property schema structure
 * This schema represents a real estate property with detailed information
 * for auction/sale listings
 */
const PropertySchema = new Schema({
    // Detailed address information for the property
    address: {
        addressLine1: { type: String, required: true },
        addressLine2: { type: String, required: false }, // Optional
        addressLine3: { type: String, required: false }, // Optional
        addressTown: { type: String, required: true },
        addressCounty: { type: String, required: true },
        addressEircode: { type: String, required: true }, 
    },
    
    // Starting price for the property (guide price)
    guidePrice: {
        type: Number,
        default: false,
        required: true
    },
    
    // Information about the current highest bid
    currentBid: {
        bidId: { type: String, default: false }, // Reference to the Bid model
        amount: { type: Number, required: true }, // Current highest bid amount
    },
    
    // Information about who listed the property
    listedBy: {
        listerID: { type: String, required: true }, // Reference to the User model
        listerName: { type: String, required: true }, // Name of the listing agent/user
    },
    
    // Array of property images stored in Cloudinary
    images: [
        {
            public_id: {
                type: String,
                required: true // Cloudinary public ID
            },
            url: {
                type: String,
                required: true // Cloudinary URL to the image
            }
        }
    ],
    
    // Date when the property will be auctioned/sold
    saleDate: {
        type: String, 
        default: false, 
        required: true
    },
    
    // Flag indicating if the property has been sold
    sold: {
        type: Boolean,
        default: false // Properties are not sold by default
    },
    
    // Number of bedrooms in the property
    bedrooms: {
        type: Number,
        default: false,
        required: true
    },
    
    // Number of bathrooms in the property
    bathrooms: {
        type: Number,
        default: false, 
        required: true
    },
    
    // Size of the property in square meters
    sqdMeters: {
        type: Number,
        default: false, 
        required: true
    },
    
    // Type of property (e.g., house, apartment, etc.)
    propertyType: {
        type: String,
        default: false, 
        required: true
    },
    
    // Type of listing (e.g., sale, rent)
    listingType: {
        type: String,
        default: "sale", // Default listing type is "sale"
        required: true
    },
    
    // Detailed description of the property
    description: {
        type: String,
        default: "sale", 
        required: true
    }
}, 
// Enable timestamps to track when the property was created and last updated
{ timestamps: true }); 

// Create the Property model from the schema
const Property = mongoose.model("Property", PropertySchema);

// Export the model 
module.exports = Property;