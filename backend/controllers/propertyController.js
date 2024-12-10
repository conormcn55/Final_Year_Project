const Property = require('../models/property');
const cloudinary = require('../utils/cloudinary');

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

        for (let i = 0; i < images.length; i++) {
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
            currentBid: {
                bidId: req.body.currentBid?.bidId || false,
                amount: req.body.currentBid?.amount || req.body.guidePrice
            },
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

exports.searchProperties = async (req, res) => {     
    try {         
        const {
            location = '',
            guidePrice,
            bedrooms,
            bathrooms,
            sort = 'dateDesc',
            propertyType = '',
            listingType = '',
            sold 
        } = req.query;          

        // Build base query with dynamic sold status
        const query = {};
        
        if (sold === 'true') {
            query.sold = true;
        } else if (sold === 'false') {
            query.sold = false;
        }
        // If no soldStatus is provided, no filter will be applied to sold status

// Location filtering
if (location) {
    const locationParts = location.split(',').map(part => part.trim());

    // If only one part is provided
    if (locationParts.length === 1) {
        query.$or = [
            { "address.addressTown": { $regex: `^${locationParts[0]}$`, $options: 'i' } },
            { "address.addressCounty": { $regex: `^${locationParts[0]}$`, $options: 'i' } }
        ];
    } 
    // If multiple parts are provided (e.g., "Maynooth, County Kildare")
    else if (locationParts.length > 1) {
        // Exact matching for town and county
        query.$and = [
            { "address.addressTown": { $regex: `^${locationParts[0]}$`, $options: 'i' } },
            { "address.addressCounty": { $regex: `^${locationParts[1]}$`, $options: 'i' } }
        ];
    }
}
        // Price filter
        if (guidePrice) {
            query.guidePrice = { $lte: Number(guidePrice) };
        }          

        // Property type and listing type filters
        if (propertyType) {
            query.propertyType = { $regex: `^${propertyType}$`, $options: 'i' };
        }          

        if (listingType) {
            query.listingType = { $regex: `^${listingType}$`, $options: 'i' };
        }          

        // Bedroom and bathroom filters
        if (bedrooms) query.bedrooms = Number(bedrooms);
        if (bathrooms) query.bathrooms = Number(bathrooms);          

        const sortOptions = {
            'priceLowHigh': { guidePrice: 1 },
            'priceHighLow': { guidePrice: -1 },
            'dateAsc': { createdAt: 1 },
            'currentBidLowHigh': { 'currentBid.amount': 1 },
            'currentBidHighLow': { 'currentBid.amount': -1 },
            'dateDesc': { createdAt: -1 },
            'saleDateNearest': { saleDate: 1 },
            'saleDateFurthest': { saleDate: -1 }
        };          

        // If no query parameters are provided, return all properties
        if (Object.keys(req.query).length === 0) {
            const allProperties = await Property.find()
                .sort({ createdAt: -1 });
            return res.json(allProperties);
        }          

        // Fetch properties with the specified filters
        const properties = await Property.find(query)
            .sort(sortOptions[sort] || { createdAt: -1 });          

        // Handle no properties found
        if (!properties.length) {
            return res.status(404).json({
                message: 'No properties found matching the search criteria'
            });
        }          

        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving properties' });
    } 
};
exports.getProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        res.json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving property' });
    }
};
exports.deleteAllProperties = async (req, res) => {
    try {
        
        const properties = await Property.find({}, 'images');
        for (const property of properties) {
            if (property.images && property.images.length > 0) {
                for (const image of property.images) {
                    if (image.public_id) {
                        await cloudinary.uploader.destroy(image.public_id);
                    }
                }
            }
        }

        
        const result = await Property.deleteMany({});

        res.json({
            message: 'All properties deleted',
            result: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting properties' });
    }
};

exports.updateCurrentBid = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const { bidId, amount } = req.body;

        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        property.currentBid = {
            bidId,
            amount
        };
        const currentSaleDate = new Date(property.saleDate);
        property.saleDate = new Date(currentSaleDate.getTime() + (2 * 60 * 1000));

        await property.save();

        res.status(200).json({
            success: true,
            message: 'Current bid updated and sale date extended by 2 minutes',
            property: {
                ...property._doc,
                previousSaleDate: currentSaleDate,
                newSaleDate: property.saleDate
            }
        });
    } catch (error) {
        console.error('Update bid error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update bid',
            error: error.message
        });
    }
};
exports.getSaleSoon = async (req, res) => {
    try {
        const currentTime = new Date();

        // Step 1: Fetch properties
        const properties = await Property.find({
            sold: false,
            saleDate: { $exists: true}
        }).sort({ saleDate: 1 }).limit(50); // Adjust limit if needed

        console.log("Fetched Properties:", properties.length);

        // Step 2: Add timeRemaining
        const propertiesWithTimeRemaining = properties.map(property => {
            const saleDate = new Date(property.saleDate);
            const timeRemaining = saleDate.getTime() - currentTime.getTime();

            console.log("Property ID:", property._id, "SaleDate:", property.saleDate, "TimeRemaining:", timeRemaining);

            if (timeRemaining <= 0) return null; // Exclude expired properties

            // Format time remaining
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

            const timeRemainingFormatted =
                days > 0 ? `${days}d ${hours}h` :
                hours > 0 ? `${hours}h ${minutes}m` :
                `${minutes}m`;

            return {
                ...property.toObject(),
                timeRemaining,
                timeRemainingFormatted
            };
        }).filter(Boolean); // Exclude null values

        console.log("Valid Properties:", propertiesWithTimeRemaining.length);

        // Step 3: Sort and limit to 10
        const sortedProperties = propertiesWithTimeRemaining
            .sort((a, b) => a.timeRemaining - b.timeRemaining)
            .slice(0, 10);

        if (!sortedProperties.length) {
            return res.status(404).json({
                success: false,
                message: "No upcoming property sales found"
            });
        }

        res.json({
            success: true,
            count: sortedProperties.length,
            data: sortedProperties
        });
    } catch (error) {
        console.error("getSaleSoon error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving upcoming property sales",
            error: error.message
        });
    }
};

exports.getRecentlyListed = async (req, res) => {
    try {
        const recentProperties = await Property.find({ sold: false })
            .sort({ createdAt: -1 }) 
            .limit(10); 

        if (!recentProperties.length) {
            return res.status(404).json({ 
                message: 'No recently listed properties found' 
            });
        }

        res.json(recentProperties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Error retrieving recently listed properties',
            error: error.message 
        });
    }
};

exports.getPropertiesByIds = async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !ids.length) {
        return res.status(400).json({ message: 'No property IDs provided' });
      }
  
      const properties = await Property.find({ _id: { $in: ids } });
      res.status(200).json({ properties });
    } catch (error) {
      console.error('Error fetching properties by IDs:', error);
      res.status(500).json({ message: 'Error fetching properties' });
    }
  };
  