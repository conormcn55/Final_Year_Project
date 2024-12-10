const Room = require('../models/room');

exports.createRoom = async (req, res) => {
    try {
        const { bidder, owner } = req.body;
        const existingRoom = await Room.findOne({
            $or: [
                { bidder, owner },
                { bidder: owner, owner: bidder }
            ]
        });

        if (existingRoom) {
            return res.status(200).json({
                success: true,
                message: 'Room already exists',
                room: existingRoom
            });
        }

        const room = new Room({ bidder, owner });
        const savedRoom = await room.save();

        res.status(201).json({
            success: true,
            message: 'Room created successfully',
            room: savedRoom
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to create Room',
            error: error.message
        });
    }
};
exports.getUserRooms = async (req, res) => {
    try {
        const userId = req.params.id;

        const rooms = await Room.find({
            $or: [
                { bidder: userId },
                { owner: userId }
            ]
        }).populate('bidder', 'name')
          .populate('owner', 'name');

        res.status(200).json({
            success: true,
            rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms',
            error: error.message
        });
    }
};