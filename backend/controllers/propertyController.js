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
        const location = (req.query.location || '').replace(/,/g, ' ').trim();
        const maxPrice = req.query.price ? Number(req.query.price) : Number.MAX_SAFE_INTEGER;
        const bedNum = req.query.bedNum ? Number(req.query.bedNum) : null;
        const bathNum = req.query.bathNum ? Number(req.query.bathNum) : null;
        const sort = req.query.sort || 'dateDesc';
        const propertyType = req.query.propertyType || '';
        const listingType = req.query.listingType || '';

        const locationParts = location.split(/\s+/);
        const town = locationParts[0]; 
        const county = locationParts.slice(1).join(' '); 

        let locationQuery = {};
        if (location) {
            locationQuery = {
                $or: [
                   
                    { "address.addressLine1": { $regex: location, $options: 'i' } },
                    { "address.addressLine2": { $regex: location, $options: 'i' } },
                    { "address.addressLine3": { $regex: location, $options: 'i' } },
                    {
                        $and: [
                            { "address.addressTown": { $regex: `^${town}$`, $options: 'i' } },
                            { "address.addressCounty": { $regex: county, $options: 'i' } }
                        ]
                    },
                    { "address.addressTown": { $regex: `^${town}$`, $options: 'i' } },
                    { "address.addressTown": { $regex: location, $options: 'i' } },
                    { "address.addressCounty": { $regex: location, $options: 'i' } }
                ]
            };
        }

        let query = {
            $and: [
                locationQuery,
                { guidePrice: { $lte: maxPrice } }
            ]
        };

        if (propertyType) {
            query.$and.push({
                propertyType: { $regex: propertyType, $options: 'i' }
            });
        }

        if (listingType) {
            query.$and.push({
                listingType: { $regex: `^${listingType}$`, $options: 'i' }
            });
        }

        if (bedNum !== null) {
            query.$and.push({ bedrooms: bedNum });
        }

        if (bathNum !== null) {
            query.$and.push({ bathrooms: bathNum });
        }

        let sortOptions = {};
        switch (sort) {
            case 'priceLowHigh':
                sortOptions = { guidePrice: 1 };
                break;
            case 'priceHighLow':
                sortOptions = { guidePrice: -1 };
                break;
            case 'dateAsc':
                sortOptions = { createdAt: 1 };
                break;
            case 'dateDesc':
            default:
                sortOptions = { createdAt: -1 };
                break;
        }

        const properties = await Property.find(query).sort(sortOptions);

        if (!properties.length) {
            return res.status(404).json({ 
                message: 'No properties found matching the search criteria',
                searchTerms: {
                    location,
                    town,
                    county
                },
                query: query
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
        const properties = await Property.find({
            sold: false,
            saleDate: { $gt: currentTime }
        })
        .sort({ saleDate: 1 }) 
        .limit(10); 
        const propertiesWithTimeRemaining = properties.map(property => ({
            ...property.toObject(),
            timeRemaining: property.saleDate - currentTime
        }))
        propertiesWithTimeRemaining.sort((a, b) => a.timeRemaining - b.timeRemaining);

        if (!propertiesWithTimeRemaining.length) {
            return res.status(404).json({ 
                message: 'No properties ending soon' 
            });
        }

        res.json(propertiesWithTimeRemaining);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Error retrieving properties ending soon',
            error: error.message 
        });
    }
};

exports.getRecentlyListed = async (req, res) => {
    try {
        const recentProperties = await Property.find({ sold: false })
            .sort({ createdAt: -1 }) // Sort by most recently created
            .limit(10); // Limit to 10 most recent properties

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