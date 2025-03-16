// Import the Message model from models directory
const Message = require('../models/messages');

/**
* Controller to retrieve all messages for a specific room
* Messages are sorted by time in ascending order (oldest first)
*/
exports.getMessages = async (req, res) => {
   // Extract room identifier from request parameters
   const { room } = req.params;

   try {
       // Find all messages for the specified room and sort them by time (ascending)
       const messages = await Message.find({ room }).sort({ time: 1 }); 
       // Return the messages with 200 status code
       res.status(200).json(messages);
   } catch (error) {
       // Return 500 status code with error message if retrieval fails
       res.status(500).json({ error: "Failed to retrieve messages" });
   }
};

/**
* Controller to create and send a new message
* Requires sentBy (user ID), room (room ID), and message content
*/
exports.sendMessage = async (req, res) => {
   // Extract message details from request body
   const { sentBy, room, message } = req.body;

   // Validate that all required fields are present
   if (!sentBy || !room || !message) {
       return res.status(400).json({ error: "All fields are required" });
   }

   try {
       // Create a new message instance with provided details
       // and current timestamp for the time field
       const newMessage = new Message({
           sentBy,
           room,
           message,
           time: new Date() 
       });

       // Save the new message to the database
       const savedMessage = await newMessage.save();
       // Return 201 status (Created) with the saved message
       res.status(201).json(savedMessage);
   } catch (error) {
       // Return 500 status code with error message if creation fails
       res.status(500).json({ error: "Failed to send the message" });
   }
};