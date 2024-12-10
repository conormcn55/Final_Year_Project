const Message = require('../models/messages'); 
exports.getMessages = async (req, res) => {
    const { room } = req.params;

    try {
        const messages = await Message.find({ room }).sort({ time: 1 }); 
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve messages" });
    }
};

exports.sendMessage = async (req, res) => {
    const { sentBy, room, message } = req.body;

    if (!sentBy || !room || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newMessage = new Message({
            sentBy,
            room,
            message,
            time: new Date() 
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ error: "Failed to send the message" });
    }
};
