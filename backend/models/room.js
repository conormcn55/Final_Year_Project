const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    bidder: { type: String, required: true },
    owner: { type: String, required: true },
});

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;