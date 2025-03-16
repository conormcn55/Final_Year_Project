// Import the Favourite model from models directory
const Favourite = require('../models/favourites');

/**
* Controller to create a new favourite
* Allows users to mark properties as favourite
*/
exports.createFavourite = async (req, res) => {
   try {
       // Extract user and property IDs from request body
       const { user, property } = req.body;

       // Check if the favourite relationship already exists
       const existingFavourite = await Favourite.findOne({ user, property });
       if (existingFavourite) {
           // If it exists, return the existing favourite with a 200 status
           return res.status(200).json({
               success: true,
               message: 'Favourite already exists',
               favourite: existingFavourite,
           });
       }
       
       // Create a new favourite instance with user and property IDs
       const favourite = new Favourite({ user, property });
       // Save the new favourite to the database
       const savedFavourite = await favourite.save();

       // Return 201 status (Created) with the newly created favourite
       res.status(201).json({
           success: true,
           message: 'Favourite created successfully',
           favourite: savedFavourite,
       });
   } catch (error) {
       // Log any errors that occur during the operation
       console.error(error);
       // Return 400 status code with error details
       res.status(400).json({
           success: false,
           message: 'Failed to create favourite',
           error: error.message,
       });
   }
};

/**
* Controller to retrieve all favourites for a specific user
*/
exports.getUserFavourites = async (req, res) => {
   try {
       // Extract user ID from request parameters
       const userId = req.params.id;
       // Find all favourites associated with the specified user ID
       const favourites = await Favourite.find({ user: userId });

       // Return the list of favourites with 200 status
       res.status(200).json({
           success: true,
           favourites,
       });
   } catch (error) {
       // Return 500 status code with error details
       res.status(500).json({
           success: false,
           message: 'Failed to fetch favourites',
           error: error.message,
       });
   }
};

/**
* Controller to remove a favourite (unfavourite a property)
*/
exports.unfavourite = async (req, res) => {
   try {
       // Extract user and property IDs from request body
       const { user, property } = req.body;
       // Find and delete the favourite with matching user and property IDs
       const deletedFavourite = await Favourite.findOneAndDelete({ user, property });

       // If no matching favourite was found, return 404 error
       if (!deletedFavourite) {
           return res.status(404).json({
               success: false,
               message: 'Favourite not found',
           });
       }

       // Return success response with the deleted favourite
       res.status(200).json({
           success: true,
           message: 'Favourite removed successfully',
           favourite: deletedFavourite,
       });
   } catch (error) {
       // Log any errors that occur during the operation
       console.error(error);
       // Return 500 status code with error details
       res.status(500).json({
           success: false,
           message: 'Failed to remove favourite',
           error: error.message,
       });
   }
};