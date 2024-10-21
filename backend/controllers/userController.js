const User = require('../models/user');
const cloudinary=require('../utils/cloudinary')


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving Users' });
    }
};

exports.createUser = async (req, res) => {
    try {
        // Function to calculate age based on DOB
        const calculateAge = (dob) => {
            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        // Check if user is 18 or older
        const age = calculateAge(req.body.dob);
        if (age < 18) {
            return res.status(400).json({
                success: false,
                message: 'User must be at least 18 years old to sign up',
            });
        }

        let avatarResult;
        
        // Check if an avatar is provided, if not, use default avatar
        if (req.body.avatar) {
            avatarResult = await cloudinary.uploader.upload(req.body.avatar, {
                folder: "avatars", 
            });
        } else {
            avatarResult = {
                public_id: "default-avatar",
                secure_url: "https://res.cloudinary.com/dvfwihe1f/image/upload/v1729074872/default-avatar-icon-of-social-media-user-vector_eqcayv.jpg"
            };
        }

        let files = [...req.body.files];
        let filesBuffer = [];

        for (let i = 0; i < files.length; i++) {
            const result = await cloudinary.uploader.upload(files[i], {
            folder: "properties",
            width: 1920,
            crop: "scale"
    });
            filesBuffer.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            dob: req.body.dob,
            avatar: {
                public_id: avatarResult.public_id,
                url: avatarResult.secure_url
            },
            files: filesBuffer,
            description: req.body.description,
            userType: req.body.userType,
            regNumber: req.body.regNumber,
        });

        const savedUser = await user.save();
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            property: savedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to create User',
            error: error.message,
        });
    }
};



