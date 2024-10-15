const Property = require('../models/property');
const cloudinary=require('../utils/cloudinary')


exports.getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find();
        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving properties' });
    }
};

exports.createProperty = async (req, res) => {
    try {

        let images = [...req.body.images];
        let imagesBuffer = [];

        for (let i =0; i < images.length;  i++){
              const result = await cloudinary.uploader.upload(images[i], {
              folder: "properties",
              width: 1920,
              crop: "scale"
        });

        imagesBuffer.push({
            public_id: result.public_id,
            url: result.secure_url
          })
        }
        const property = new Property({
            address: req.body.address,
            guidePrice: req.body.guidePrice, 
            currentBid: req.body.currentBid,
            currentBidderID: req.body.currentBidderID,
            listedBy: req.body.listedBy, 
            images: imagesBuffer,
            saleDate: req.body.saleDate,
            sold: req.body.sold, 
            bedrooms: req.body.bedrooms, 
            bathrooms: req.body.bathrooms, 
            sqdMeters: req.body.sqdMeters, 
            propertyType: req.body.propertyType, 
            listingType: req.body.listingType,
            description: req.body.description 
        });

        const savedProperty = await property.save();
        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            property: savedProperty,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to create property',
            error: error.message,
        });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const result = await Property.findByIdAndDelete(req.params.id);
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting property' });
    }
};

exports.toggleSoldStatus = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        property.sold = !property.sold;
        await property.save();
        res.json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error toggling sold status' });
    }
};
