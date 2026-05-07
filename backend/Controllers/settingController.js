const Setting = require('../Models/Setting');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public (or semi-public depending on what is returned)
exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        
        // If no settings exist, create default
        if (!settings) {
            settings = await Setting.create({});
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update settings
// @route   PATCH /api/settings
// @access  Private (Superadmin)
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        
        if (!settings) {
            settings = await Setting.create(req.body);
        } else {
            settings = await Setting.findOneAndUpdate({}, req.body, {
                new: true,
                runValidators: true
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
