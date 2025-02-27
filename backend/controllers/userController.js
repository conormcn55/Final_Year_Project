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
        let avatarResult;
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
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        let avatarResult = user.avatar; 
        if (req.body.avatar && req.body.avatar !== user.avatar?.url) {
            if (user.avatar?.public_id) {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            }
            
            try {
                avatarResult = await cloudinary.uploader.upload(req.body.avatar, {
                    folder: "avatars",
                    resource_type: "auto"
                });
                
                avatarResult = {
                    public_id: avatarResult.public_id,
                    url: avatarResult.secure_url
                };
            } catch (uploadError) {
                console.error('Avatar upload error:', uploadError);
                avatarResult = user.avatar;
            }
        }

        
        let filesBuffer = [...(user.files || [])]; 
        if (req.body.files && Array.isArray(req.body.files)) {
            const newFiles = req.body.files.filter(file => 
                file.url && typeof file.url === 'string' && !file.url.startsWith('http')
            );
        
            for (const file of newFiles) {
                try {
                    const result = await cloudinary.uploader.upload(file.url, {
                        folder: "files",
                        resource_type: "auto",
                        width: 1920,
                        crop: "scale"
                    });
                    
                    filesBuffer.push({
                        public_id: result.public_id,
                        url: result.secure_url,
                        filename: file.filename || 'Untitled File'
                    });
                } catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    continue;
                }
            }
        }
        // Update user fields
        const updatedFields = {
            name: req.body.name || user.name,
            email: req.body.email || user.email,
            number: req.body.number || user.number,
            dob: req.body.dob || user.dob,
            avatar: avatarResult,
            files: filesBuffer,
            description: req.body.description || user.description,
            userType: req.body.userType || user.userType,
            regNumber: req.body.regNumber || user.regNumber
        };
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser, 
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update User',
            error: error.message,
        });
    }
};
exports.deleteFiles = async (req, res) => {
    try {
        const { userId, fileId } = req.params;
        const result = await User.findByIdAndUpdate(userId, {
          $pull: { files: { _id: fileId } }
        });
        
        console.log('Deletion Result:', result);  
        console.log('Type of fileId:', typeof fileId);
        res.status(200).send({ message: 'File deleted successfully' });
      } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).send({ error: 'Failed to delete file' });
      }
};


exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete User',
            error: error.message,
        });
    }
};

exports.getUserBasicInfo= async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('name _id avatar');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User information retrieved successfully',
            user: {
                id: user._id,
                name: user.name,
                avatar: user.avatar
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user information',
            error: error.message,
        });
    }
};
