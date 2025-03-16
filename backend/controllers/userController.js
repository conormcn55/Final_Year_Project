const User = require('../models/user'); // Import the User model
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary for file uploads

/**
 * Get all users from the database
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all user documents from database
        res.json(users); // Send users as JSON response
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(500).json({ message: 'Error retrieving Users' }); // Send error response
    }
};

/**
 * Create a new user with files and avatar
 */
exports.createUser = async (req, res) => {
    try {
        let avatarResult;
        // Handle avatar upload or use default avatar
        if (req.body.avatar) {
            // Upload avatar to Cloudinary if provided
            avatarResult = await cloudinary.uploader.upload(req.body.avatar, {
                folder: "avatars", // Store in avatars folder
            });
        } else {
            // Use default avatar if none provided
            avatarResult = {
                public_id: "default-avatar",
                secure_url: "https://res.cloudinary.com/dvfwihe1f/image/upload/v1729074872/default-avatar-icon-of-social-media-user-vector_eqcayv.jpg"
            };
        }

        // Handle multiple file uploads
        let files = [...req.body.files]; // Create a copy of the files array
        let filesBuffer = []; // Array to store uploaded file information

        // Upload each file to Cloudinary
        for (let i = 0; i < files.length; i++) {
            const result = await cloudinary.uploader.upload(files[i], {
                folder: "properties", // Store in properties folder
                width: 1920, // Resize to width 1920px
                crop: "scale" // Scale proportionally
            });
            // Store file metadata
            filesBuffer.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }

        // Create new User object with request data
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            dob: req.body.dob, // Date of birth
            avatar: {
                public_id: avatarResult.public_id,
                url: avatarResult.secure_url
            },
            files: filesBuffer, // Array of uploaded files
            description: req.body.description,
            userType: req.body.userType, // Type of user 
            regNumber: req.body.regNumber, // Registration number
        });

        // Save user to database
        const savedUser = await user.save();
        // Return success response with saved user data
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: savedUser, 
        });
    } catch (error) {
        console.error(error); // Log error for debugging
        // Return error response
        res.status(400).json({
            success: false,
            message: 'Failed to create User',
            error: error.message,
        });
    }
};

/**
 * Update an existing user
 */
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id; // Get user ID from request parameters
        
        // Find the user by ID
        const user = await User.findById(userId);
        
        // Return 404 if user not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Handle avatar update
        let avatarResult = user.avatar; // Start with existing avatar
        if (req.body.avatar && req.body.avatar !== user.avatar?.url) {
            // Delete old avatar from Cloudinary if it exists
            if (user.avatar?.public_id) {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            }
            
            try {
                // Upload new avatar
                avatarResult = await cloudinary.uploader.upload(req.body.avatar, {
                    folder: "avatars",
                    resource_type: "auto" // Auto-detect file type
                });
                
                // Format avatar data
                avatarResult = {
                    public_id: avatarResult.public_id,
                    url: avatarResult.secure_url
                };
            } catch (uploadError) {
                console.error('Avatar upload error:', uploadError);
                avatarResult = user.avatar; // Keep old avatar if upload fails
            }
        }

        // Handle file updates
        let filesBuffer = [...(user.files || [])]; // Start with existing files
        if (req.body.files && Array.isArray(req.body.files)) {
            // Filter for new files (files that don't have a URL starting with http)
            const newFiles = req.body.files.filter(file => 
                file.url && typeof file.url === 'string' && !file.url.startsWith('http')
            );
        
            // Upload each new file
            for (const file of newFiles) {
                try {
                    const result = await cloudinary.uploader.upload(file.url, {
                        folder: "files",
                        resource_type: "auto",
                        width: 1920,
                        crop: "scale"
                    });
                    
                    // Add new file to files array
                    filesBuffer.push({
                        public_id: result.public_id,
                        url: result.secure_url,
                        filename: file.filename || 'Untitled File'
                    });
                } catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    continue; // Skip this file if upload fails
                }
            }
        }
        
        // Update user fields with new values or keep existing ones
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
        
        // Update user in database and get updated document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedFields },
            { new: true, runValidators: true } // Return updated document and validate
        );

        // Return success response
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser, 
        });

    } catch (error) {
        console.error('Update user error:', error);
        // Return error response
        res.status(500).json({
            success: false,
            message: 'Failed to update User',
            error: error.message,
        });
    }
};

/**
 * Delete a file from a user's files array
 */
exports.deleteFiles = async (req, res) => {
    try {
        const { userId, fileId } = req.params; // Get user ID and file ID from request parameters
        
        // Remove file from user's files array using MongoDB's $pull operator
        const result = await User.findByIdAndUpdate(userId, {
          $pull: { files: { _id: fileId } }
        });
        
        // Log deletion result for debugging
        console.log('Deletion Result:', result);  
        console.log('Type of fileId:', typeof fileId);
        
        // Return success response
        res.status(200).send({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        // Return error response
        res.status(500).send({ error: 'Failed to delete file' });
    }
};

/**
 * Delete a user by ID
 * @param {Object} req - Express request object with user ID in params
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id; // Get user ID from request parameters

        // Find and delete user
        const user = await User.findByIdAndDelete(userId);

        // Return 404 if user not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error(error);
        // Return error response
        res.status(500).json({
            success: false,
            message: 'Failed to delete User',
            error: error.message,
        });
    }
};

/**
 * Get basic user information by ID
 */
exports.getUserBasicInfo = async (req, res) => {
    try {
        const userId = req.params.id; // Get user ID from request parameters
        
        // Find user and select only specific fields (name, _id, avatar)
        const user = await User.findById(userId).select('name _id avatar');

        // Return 404 if user not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Return success response with limited user data
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
        // Return error response
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user information',
            error: error.message,
        });
    }
};