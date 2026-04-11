const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const Salon = require('../Models/Salon');

// @desc    Get loyalty history for customer
// @route   GET /api/loyalty/history
// @access  Private (Customer)
exports.getLoyaltyHistory = async (req, res) => {
    try {
        const history = await LoyaltyTransaction.find({ customerId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: history
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get loyalty settings for salon
// @route   GET /api/loyalty/settings
// @access  Private (Admin/Manager)
exports.getLoyaltySettings = async (req, res) => {
    try {
        const salon = await Salon.findById(req.user.salonId).select('loyaltySetting');
        
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        res.json({
            success: true,
            data: salon.loyaltySetting
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update loyalty settings
// @route   PUT /api/loyalty/settings
// @access  Private (Admin/Manager)
exports.updateLoyaltySettings = async (req, res) => {
    try {
        const { pointsRate, active, redeemValue, minRedeemPoints } = req.body;

        const salon = await Salon.findById(req.user.salonId);
        
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        salon.loyaltySetting = {
            pointsRate: Number(pointsRate) || 100,
            redeemValue: Number(redeemValue) || 1,
            minRedeemPoints: Number(minRedeemPoints) || 0,
            active: active !== undefined ? active : salon.loyaltySetting.active
        };

        await salon.save();

        res.json({
            success: true,
            data: salon.loyaltySetting
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
