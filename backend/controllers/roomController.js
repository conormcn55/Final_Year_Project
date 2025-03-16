/**
* Room Controller
* Handles operations related to chat rooms between bidders and property owners
*/
const Room = require('../models/room');

/**
* Creates a new chat room between a bidder and an owner
* Checks if a room already exists before creating a new one
*/
exports.createRoom = async (req, res) => {
   try {
       // Extract bidder and owner IDs from request body
       const { bidder, owner } = req.body;
       
       // Check if a room already exists between these users (in either direction)
       const existingRoom = await Room.findOne({
           $or: [
               { bidder, owner },                    // Bidder to owner
               { bidder: owner, owner: bidder }      // Owner to bidder (reversed roles)
           ]
       });

       // If room already exists, return it instead of creating a new one
       if (existingRoom) {
           return res.status(200).json({
               success: true,
               message: 'Room already exists',
               room: existingRoom
           });
       }

       // Create a new room with the bidder and owner IDs
       const room = new Room({ bidder, owner });
       // Save the room to the database
       const savedRoom = await room.save();

       // Return 201 status (Created) with the saved room
       res.status(201).json({
           success: true,
           message: 'Room created successfully',
           room: savedRoom
       });
   } catch (error) {
       // Log any errors that occur during the operation
       console.error(error);
       // Return 400 status code with error details
       res.status(400).json({
           success: false,
           message: 'Failed to create Room',
           error: error.message
       });
   }
};

/**
* Retrieves all chat rooms where a user is either a bidder or an owner
* Populates user details for both bidder and owner
*/
exports.getUserRooms = async (req, res) => {
   try {
       // Get user ID from URL parameters
       const userId = req.params.id;

       // Find all rooms where the user is either a bidder or an owner
       const rooms = await Room.find({
           $or: [
               { bidder: userId },    // User is bidder
               { owner: userId }      // User is owner
           ]
       })
       .populate('bidder', 'name')    // Populate bidder's name
       .populate('owner', 'name');    // Populate owner's name

       // Return the list of rooms
       res.status(200).json({
           success: true,
           rooms
       });
   } catch (error) {
       // Return 500 status code with error details
       res.status(500).json({
           success: false,
           message: 'Failed to fetch rooms',
           error: error.message
       });
   }
};