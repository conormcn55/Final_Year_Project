const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const PropertySchema = new Schema({
    address:{
        addressLine1:{type:String,required:true},
        addressLine2:{type:String,required:false},
        addressLine3:{type:String,required:false},
        addressTown:{type:String,required:true},
        addressCounty:{type:String,required:true},
        addressEirecode:{type:String,required:true},
    },
    guidePrice:{
        type: Number,
        default: false,
        required: true
    },
    currentBid:{
        type: String,
        default: false 
    },
    listedBy:{
        listerID:{type:String,required:true},
        listerName:{type:String,required:true},
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }],
    saleDate:{
        type:String,
        default: false,
        required: true
    },
    sold:{
        type: Boolean,
        default: false
    },
    bedrooms:{
        type: Number,
        default: false,
        required: true
    },
    bathrooms:{
        type: Number,
        default: false,
        required: true
    },
    sqdMeters:{
        type: Number,
        default: false,
        required: true
    },
    propertyType:{
        type: String,
        default: false,
        required: true
    },
    listingType:{
        type: String,
        default: "sale",
        required: true
    },
    description:{
        type: String,
        default: "sale",
        required: true
    }
})
const Property = mongoose.model("Property",PropertySchema);
module.exports =Property;