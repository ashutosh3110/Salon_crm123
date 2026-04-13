const Customer = require('../Models/Customer');
const WalletTransaction = require('../Models/WalletTransaction');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const Salon = require('../Models/Salon');

// @desc    Redeem loyalty points to wallet balance
// @route   POST /api/loyalty/redeem
// @access  Private (Customer)
exports.redeemLoyaltyPoints = async (req, res) => {
    try {
        const { points } = req.body;
        const customer = await Customer.findById(req.user.id || req.user._id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const salon = await Salon.findById(customer.salonId);
        if (!salon || !salon.loyaltySetting || !salon.loyaltySetting.active) {
            return res.status(400).json({ success: false, message: 'Loyalty program is not active' });
        }

        const settings = salon.loyaltySetting;

        if (points < (settings.minRedeemPoints || 0)) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum ${settings.minRedeemPoints} points required to redeem` 
            });
        }

        if (customer.loyaltyPoints < points) {
            return res.status(400).json({ success: false, message: 'Insufficient loyalty points' });
        }

        const redeemValue = settings.redeemValue || 1;
        const walletAmount = points * redeemValue;

        // Deduct points and Add to wallet
        customer.loyaltyPoints -= points;
        customer.walletBalance = (customer.walletBalance || 0) + walletAmount;
        await customer.save();

        // Log Loyalty Transaction
        await LoyaltyTransaction.create({
            customerId: customer._id,
            salonId: customer.salonId,
            amount: points,
            type: 'REDEEMED',
            description: `Redeemed ${points} points to Wallet (₹${walletAmount})`
        });

        // Log Wallet Transaction
        await WalletTransaction.create({
            customerId: customer._id,
            salonId: customer.salonId,
            amount: walletAmount,
            type: 'CREDIT',
            description: `Received ₹${walletAmount} from Loyalty Points Redemption`,
            status: 'COMPLETED'
        });

        res.json({
            success: true,
            message: 'Points redeemed successfully',
            walletBalance: customer.walletBalance,
            loyaltyPoints: customer.loyaltyPoints
        });

    } catch (err) {
        console.error('Redeem error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

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
// @desc    Get public loyalty settings by salonId
// @route   GET /api/loyalty/settings/public
// @access  Public
exports.getPublicLoyaltySettings = async (req, res) => {
    try {
        const { salonId } = req.query;
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'salonId is required' });
        }

        const salon = await Salon.findById(salonId).select('loyaltySetting name');
        
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
