/**
 * Property Controller
 * Handles all operations related to property listings including CRUD operations,
 * search functionality, and special property queries
 */
const Property = require('../models/property');
const cloudinary = require('../utils/cloudinary');

/**
 * Retrieves all properties from the database
 */
exports.getAllProperties = async (req, res) => {
    try {
        // Find all property documents in the database
        const properties = await Property.find();
        // Return properties as JSON response
        res.json(properties);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error retrieving properties' });
    }
};

/**
 * Creates a new property with image upload to Cloudinary
 */
exports.createProperty = async (req, res) => {
    try {
        // Get images from request body
        let images = [...req.body.images];
        let imagesBuffer = [];

        // Upload each image to Cloudinary
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.uploader.upload(images[i], {
                folder: "properties",  // Store in properties folder
                width: 1920,           // Set image width
                crop: "scale"          // Scaling option
            });

            // Store image public_id and secure URL
            imagesBuffer.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }

        // Create new property object with all fields from request
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

        // Save property to database
        const savedProperty = await property.save();
        // Return success response with the saved property
        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            property: savedProperty,
        });
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 400 status code with error details
        res.status(400).json({
            success: false,
            message: 'Failed to create property',
            error: error.message,
        });
    }
};

/**
 * Deletes a property by ID
 */
exports.deleteProperty = async (req, res) => {
    try {
        // Find and delete property with the specified ID
        const result = await Property.findByIdAndDelete(req.params.id);
        // Return deletion result
        res.json({ result });
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error deleting property' });
    }
};

/**
 * Toggles the sold status of a property
 */
exports.toggleSoldStatus = async (req, res) => {
    try {
        // Find property by ID
        const property = await Property.findById(req.params.id);
        // Return 404 if property not found
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        // Toggle the sold status
        property.sold = !property.sold;
        // Save the updated property
        await property.save();
        // Return the updated property
        res.json(property);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error toggling sold status' });
    }
};

/**
 * Advanced search functionality for properties with multiple filters and sorting options
 */
exports.searchProperties = async (req, res) => {     
    try {         
        // Extract all query parameters with defaults
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
        
        // Apply sold status filter if provided
        if (sold === 'true') {
            query.sold = true;
        } else if (sold === 'false') {
            query.sold = false;
        }
        // If no soldStatus is provided, no filter will be applied to sold status

        // Location filtering logic
        if (location) {
            const locationParts = location.split(',').map(part => part.trim());

            // If only one part is provided (e.g., "Dublin")
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

        // Price filter - less than or equal to specified amount
        if (guidePrice) {
            query.guidePrice = { $lte: Number(guidePrice) };
        }          

        // Property type filter with exact case-insensitive matching
        if (propertyType) {
            query.propertyType = { $regex: `^${propertyType}$`, $options: 'i' };
        }          

        // Listing type filter with exact case-insensitive matching
        if (listingType) {
            query.listingType = { $regex: `^${listingType}$`, $options: 'i' };
        }          

        // Bedroom and bathroom filters (exact numbers)
        if (bedrooms) query.bedrooms = Number(bedrooms);
        if (bathrooms) query.bathrooms = Number(bathrooms);          

        // Define sorting options for different criteria
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

        // If no query parameters are provided, return all properties sorted by creation date
        if (Object.keys(req.query).length === 0) {
            const allProperties = await Property.find()
                .sort({ createdAt: -1 });
            return res.json(allProperties);
        }          

        // Fetch properties with the specified filters and sorting
        const properties = await Property.find(query)
            .sort(sortOptions[sort] || { createdAt: -1 });          

        // Return 404 if no properties match the criteria
        if (!properties.length) {
            return res.status(404).json({
                message: 'No properties found matching the search criteria'
            });
        }          

        // Return the filtered properties
        res.json(properties);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error retrieving properties' });
    } 
};

/**
 * Retrieves a single property by ID
 */
exports.getProperty = async (req, res) => {
    try {
        // Find property by ID
        const property = await Property.findById(req.params.id);
        
        // Return 404 if property not found
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Return the property
        res.json(property);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ message: 'Error retrieving property' });
    }
};

/**
 * Updates the current bid for a property and extends the sale date
 */
exports.updateCurrentBid = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const { bidId, amount } = req.body;

        // First, get the current property to access its sale date
        const property = await Property.findById(propertyId);

        // Return 404 if property not found
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Calculate the new sale date (current sale date + 2 minutes)
        const currentSaleDate = new Date(property.saleDate);
        const newSaleDate = new Date(currentSaleDate.getTime() + (2 * 60 * 1000));

        // Now update only the specific fields
        const updatedProperty = await Property.findByIdAndUpdate(
            propertyId,
            {
                $set: {
                    'currentBid.bidId': bidId,
                    'currentBid.amount': amount,
                    'saleDate': newSaleDate
                }
            },
            { new: true } // Return the updated document
        );

        // Return success response with old and new sale dates
        res.status(200).json({
            success: true,
            message: 'Current bid updated and sale date extended by 2 minutes',
            property: {
                ...updatedProperty._doc,
                previousSaleDate: currentSaleDate,
                newSaleDate: newSaleDate
            }
        });
    } catch (error) {
        // Log any errors that occur during the operation
        console.error('Update bid error:', error);
        // Return 500 status code with error details
        res.status(500).json({
            success: false,
            message: 'Failed to update bid',
            error: error.message
        });
    }
};
/**
 * Retrieves properties that are scheduled for sale soon,
 * ordered by time remaining until sale
 */
exports.getSaleSoon = async (req, res) => {
    try {
        const currentTime = new Date();

        // Step 1: Fetch properties with sale dates that aren't sold yet
        const properties = await Property.find({
            sold: false,
            saleDate: { $exists: true}
        }).sort({ saleDate: 1 }).limit(50); // Get up to 50 properties

        console.log("Fetched Properties:", properties.length);

        // Step 2: Calculate time remaining for each property
        const propertiesWithTimeRemaining = properties.map(property => {
            const saleDate = new Date(property.saleDate);
            const timeRemaining = saleDate.getTime() - currentTime.getTime();

            console.log("Property ID:", property._id, "SaleDate:", property.saleDate, "TimeRemaining:", timeRemaining);

            // Skip properties with sale dates in the past
            if (timeRemaining <= 0) return null;

            // Format time remaining into a readable string
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

            const timeRemainingFormatted =
                days > 0 ? `${days}d ${hours}h` :
                hours > 0 ? `${hours}h ${minutes}m` :
                `${minutes}m`;

            // Return property with time remaining info
            return {
                ...property.toObject(),
                timeRemaining,
                timeRemainingFormatted
            };
        }).filter(Boolean); // Remove null values

        console.log("Valid Properties:", propertiesWithTimeRemaining.length);

        // Step 3: Sort by time remaining and get top 10
        const sortedProperties = propertiesWithTimeRemaining
            .sort((a, b) => a.timeRemaining - b.timeRemaining)
            .slice(0, 10);

        // Return 404 if no upcoming sales found
        if (!sortedProperties.length) {
            return res.status(404).json({
                success: false,
                message: "No upcoming property sales found"
            });
        }

        // Return the sorted properties
        res.json({
            success: true,
            count: sortedProperties.length,
            data: sortedProperties
        });
    } catch (error) {
        // Log any errors that occur during the operation
        console.error("getSaleSoon error:", error);
        // Return 500 status code with error details
        res.status(500).json({
            success: false,
            message: "Error retrieving upcoming property sales",
            error: error.message
        });
    }
};
/**
 * Retrieves the 10 most recently listed unsold properties
 */
exports.getRecentlyListed = async (req, res) => {
    try {
        // Find unsold properties, sort by creation date (newest first), limit to 10
        const recentProperties = await Property.find({ sold: false })
            .sort({ createdAt: -1 }) 
            .limit(10); 

        // Return 404 if no properties found
        if (!recentProperties.length) {
            return res.status(404).json({ 
                message: 'No recently listed properties found' 
            });
        }

        // Return the properties
        res.json(recentProperties);
    } catch (error) {
        // Log any errors that occur during the operation
        console.error(error);
        // Return 500 status code with error message
        res.status(500).json({ 
        message: 'Error retrieving recently listed properties',
        error: error.message 
    });
}

};

/**
* Retrieves properties by a list of IDs
* Used for fetching multiple specific properties at once
*/
exports.getPropertiesByIds = async (req, res) => {
try {
  // Extract array of property IDs from request body
  const { ids } = req.body;
  
  // Validate that IDs were provided
  if (!ids || !ids.length) {
    return res.status(400).json({ message: 'No property IDs provided' });
  }

  // Find all properties whose IDs are in the provided array
  const properties = await Property.find({ _id: { $in: ids } });
  
  // Return the matching properties
  res.status(200).json({ properties });
} catch (error) {
  // Log any errors that occur during the operation
  console.error('Error fetching properties by IDs:', error);
  // Return 500 status code with error message
  res.status(500).json({ message: 'Error fetching properties' });
}
};

/**
* Retrieves all properties created by a specific lister
* Uses the listerID from the listedBy object
*/
exports.getPropertiesByListerId = async (req, res) => {
try {
    // Find properties with matching listerID
    const properties = await Property.find({ 'listedBy.listerID': req.params.listerId });
    
    // Return 404 if no properties found for this lister
    if (!properties.length) {
        return res.status(404).json({ message: 'No properties found for this lister' });
    }

    // Return the matching properties
    res.json(properties);
} catch (error) {
    // Log any errors that occur during the operation
    console.error(error);
    // Return 500 status code with error message
    res.status(500).json({ message: 'Error retrieving properties' });
}
};