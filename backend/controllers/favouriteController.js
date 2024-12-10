const Favourite= require('../models/favourites');

exports.createFavourite = async (req, res) => {
    try {
        const { user, property } = req.body;

        const existingFavourite = await Favourite.findOne({ user, property });
        if (existingFavourite) {
            return res.status(200).json({
                success: true,
                message: 'Favourite already exists',
                favourite: existingFavourite,
            });
        }
        const favourite = new Favourite({ user, property });
        const savedFavourite = await favourite.save();

        res.status(201).json({
            success: true,
            message: 'Favourite created successfully',
            favourite: savedFavourite,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to create favourite',
            error: error.message,
        });
    }
};

exports.getUserFavourites = async (req, res) => {
    try {
        const userId = req.params.id;
        const favourites = await Favourite.find({ user: userId });

        res.status(200).json({
            success: true,
            favourites,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch favourites',
            error: error.message,
        });
    }
};
exports.unfavourite = async (req, res) => {
    try {
        const { user, property } = req.body;
        const deletedFavourite = await Favourite.findOneAndDelete({ user, property });

        if (!deletedFavourite) {
            return res.status(404).json({
                success: false,
                message: 'Favourite not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Favourite removed successfully',
            favourite: deletedFavourite,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove favourite',
            error: error.message,
        });
    }
};