/**
 * Favourite Model - Represents a user's favorited property
 */

// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');
// Get the Schema constructor from mongoose
const Schema = mongoose.Schema;

/**
 * Define the Favourite schema structure
 * This schema represents a relationship between a user and a property they've favorited
 */
const FavouriteSchema = new Schema({
    // MongoDB ID of the user who favorited the property
    user: { type: String, required: true },  
    // MongoDB ID of the property that was favorited
    property: { type: String, required: true },
});
// Create the Favourite model from the schema
const Favourite = mongoose.model("Favourite", FavouriteSchema);

// Export the model 
module.exports = Favourite;