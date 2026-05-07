const Customer = require('../Models/Customer');
const WalletTransaction = require('../Models/WalletTransaction');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const Salon = require('../Models/Salon');
const Setting = require('../Models/Setting');

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

        const globalSettings = await Setting.findOne();
        if (!globalSettings || !globalSettings.loyaltySettings || !globalSettings.loyaltySettings.active) {
            return res.status(400).json({ success: false, message: 'Loyalty program is not active' });
        }
        const settings = globalSettings.loyaltySettings;

        if (points < (settings.minRedeemPoints || 0)) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum ${settings.minRedeemPoints} points required to redeem` 
            });
        }

        if (customer.loyaltyPoints < points) {
            return res.status(400).json({ success: false, message: 'Insufficient loyalty points' });
        }

        const pointsRate = settings.pointsRate || 1; // Default to 1 to avoid division by zero
        const walletAmount = Math.floor(points / pointsRate);

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
        const settings = await Setting.findOne().select('loyaltySettings referralSettings');
        
        if (!settings) {
            return res.json({
                success: true,
                data: {
                    active: true,
                    pointsRate: 100,
                    redeemValue: 1,
                    minRedeemPoints: 0,
                    referralPoints: 200,
                    referredPoints: 100
                }
            });
        }

        const data = {
            ...settings.loyaltySettings.toObject(),
            referralPoints: settings.referralSettings.referralPoints,
            referredPoints: settings.referralSettings.referredPoints
        };

        res.json({
            success: true,
            data
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
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Unauthorized. Only superadmin can manage global rules.' });
        }

        const { pointsRate, active, redeemValue, minRedeemPoints, referralPoints, referredPoints } = req.body;

        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting();
        }

        settings.loyaltySettings = {
            pointsRate: Number(pointsRate) || 100,
            redeemValue: Number(redeemValue) || 1,
            minRedeemPoints: Number(minRedeemPoints) || 0,
            active: active !== undefined ? active : (settings.loyaltySettings?.active ?? true)
        };

        settings.referralSettings = {
            enabled: active !== undefined ? active : (settings.referralSettings?.enabled ?? true),
            referralPoints: Number(referralPoints) || 200,
            referredPoints: Number(referredPoints) || 100
        };

        await settings.save();

        res.json({
            success: true,
            data: {
                ...settings.loyaltySettings.toObject(),
                referralPoints: settings.referralSettings.referralPoints,
                referredPoints: settings.referralSettings.referredPoints
            }
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
        const settings = await Setting.findOne().select('loyaltySettings referralSettings');
        if (!settings) {
             return res.json({
                success: true,
                data: {
                    active: true,
                    pointsRate: 100,
                    redeemValue: 1,
                    minRedeemPoints: 0,
                    referralPoints: 200,
                    referredPoints: 100
                }
            });
        }
        res.json({
            success: true,
            data: {
                ...settings.loyaltySettings.toObject(),
                referralPoints: settings.referralSettings.referralPoints,
                referredPoints: settings.referralSettings.referredPoints
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc    Get referral settings for customer
// @route   GET /api/loyalty/referral-settings
// @access  Private (Customer)
exports.getReferralSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne().select('loyaltySettings referralSettings');
        if (!settings) {
            return res.json({
                success: true,
                data: {
                    enabled: true,
                    referrerReward: 200,
                    referredReward: 100,
                    redeemRate: 1,
                    minRedeemPoints: 0,
                    threshold: 'FIRST_SERVICE'
                }
            });
        }

        res.json({
            success: true,
            data: {
                enabled: settings.loyaltySettings.active ?? true,
                referrerReward: settings.referralSettings.referralPoints || 200,
                referredReward: settings.referralSettings.referredPoints || 100,
                redeemRate: settings.loyaltySettings.redeemValue || 1,
                minRedeemPoints: settings.loyaltySettings.minRedeemPoints || 0,
                threshold: 'FIRST_SERVICE'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get list of referrals made by current customer
// @route   GET /api/loyalty/referrals/me
// @access  Private (Customer)
exports.getMyReferrals = async (req, res) => {
    try {
        const referrals = await LoyaltyTransaction.find({ 
            referrerId: req.user._id,
            source: 'REFERRAL'
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: referrals.map(ref => ({
                _id: ref._id,
                referredName: ref.customerName || 'New User',
                rewardPoints: ref.amount,
                status: 'COMPLETED', // In this system, transactions are only created when completed
                createdAt: ref.createdAt
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc    Get loyalty members for salon (customers with transactions)
// @route   GET /api/loyalty/members
// @access  Private (Admin/Manager)
exports.getLoyaltyMembers = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { page = 1, limit = 20, search, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Rule: Only show customers who have at least one transaction (visit or spend) in this salon
        let query = { 
            salonId,
            $or: [
                { totalVisits: { $gt: 0 } },
                { totalSpend: { $gt: 0 } }
            ]
        };

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$and = [
                { 
                    $or: [
                        { name: searchRegex },
                        { phone: searchRegex }
                    ]
                }
            ];
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const total = await Customer.countDocuments(query);
        const members = await Customer.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: members,
            meta: {
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                total,
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error('Get loyalty members error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc    Get all loyalty transactions for salon
// @route   GET /api/loyalty/transactions
// @access  Private (Admin/Manager)
exports.getAdminLoyaltyTransactions = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { page = 1, limit = 25, type, from, to } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = { salonId };

        if (type && type !== 'ALL') {
            // Support both REDEEM and REDEEMED for flexibility
            if (type === 'REDEEM') {
                query.type = { $in: ['REDEEM', 'REDEEMED'] };
            } else {
                query.type = type;
            }
        }

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = toDate;
            }
        }

        const total = await LoyaltyTransaction.countDocuments(query);
        const transactions = await LoyaltyTransaction.find(query)
            .populate('customerId', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Only return transactions where the customer still exists and belongs to this salon context
        const validTransactions = transactions.filter(tx => tx.customerId);

        res.json({
            success: true,
            data: validTransactions.map(tx => ({
                ...tx._doc,
                id: tx._id,
                points: tx.amount, // Map amount to points for frontend
                type: (tx.type === 'REDEEMED' || tx.type === 'DEBIT') ? 'REDEEM' : 'EARN' // Normalize type
            })),
            meta: {
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                total: validTransactions.length,
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error('Get admin transactions error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
