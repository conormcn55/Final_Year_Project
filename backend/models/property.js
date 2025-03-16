const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PropertySchema = new Schema({
    address: {
        addressLine1: String,
        addressLine2: String, // Optional
        addressLine3: String, // Optional
        addressTown: String,
        addressCounty: String,
        addressEircode: String, 
    },
    
    guidePrice: {
        type: Number,
        default: false
    },
    
    currentBid: {
        bidId: { type: String, default: false }, // Reference to the Bid model
        amount: Number // Current highest bid amount
    },
    
    listedBy: {
        listerID: String, // Reference to the User model
        listerName: String // Name of the listing agent/user
    },
    
    images: [
        {
            public_id: String, // Cloudinary public ID
            url: String // Cloudinary URL to the image
        }
    ],
    
    saleDate: {
        type: String, 
        default: false
    },
    
    sold: {
        type: Boolean,
        default: false
    },
    
    bedrooms: {
        type: Number,
        default: false
    },
    
    bathrooms: {
        type: Number,
        default: false
    },
    
    sqdMeters: {
        type: Number,
        default: false
    },
    
    propertyType: {
        type: String,
        default: false
    },
    
    listingType: {
        type: String,
        default: "sale"
    },
    
    description: {
        type: String,
        default: "sale"
    }
}, 
{ timestamps: true });

const Property = mongoose.model("Property", PropertySchema);

module.exports = Property;
