const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavouriteSchema = new Schema({
    user: { type: String, required: true },
    property: { type: String, required: true },
});

const Favourite = mongoose.model("Favourite", FavouriteSchema);
module.exports = Favourite;