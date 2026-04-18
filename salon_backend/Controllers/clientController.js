const mongoose = require('mongoose');
const Customer = require('../Models/Customer');

// @desc    Get all clients (customers) for current salon
// @route   GET /clients
// @access  Private
exports.getClients = async (req, res) => {
    try {
        const salonId = req.user.role === 'customer' ? req.query.salonId : req.user.salonId;
        
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID context missing' });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        // Global Stats (Independent of pagination)
        const stats = await Customer.aggregate([
            { $match: { salonId: new mongoose.Types.ObjectId(salonId) } },
            { $group: {
                _id: null,
                totalRevenue: { $sum: "$totalSpend" },
                totalVIPs: { $sum: { $cond: [{ $eq: ["$isVIP", true] }, 1, 0] } },
                totalInactive: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
                totalLiability: { $sum: "$walletBalance" },
                totalCount: { $sum: 1 }
            }}
        ]);

        const globalStats = stats[0] || { totalRevenue: 0, totalVIPs: 0, totalInactive: 0, totalCount: 0 };

        const clients = await Customer.find({ salonId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            totalCount: globalStats.totalCount,
            totalPages: Math.ceil(globalStats.totalCount / limit),
            currentPage: page,
            globalStats,
            data: clients
        });
    } catch (err) {
        console.error('Get clients error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single client
// @route   GET /clients/:id
// @access  Private
exports.getClient = async (req, res) => {
    try {
        const client = await Customer.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.json({
            success: true,
            data: client
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new client
// @route   POST /clients
// @access  Private
exports.createClient = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { name, phone, email, gender, dob, anniversary, address, loyaltyPoints, walletBalance } = req.body;

        // Check if customer with this phone already exists in this salon
        const existing = await Customer.findOne({ phone, salonId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Client already exists with this phone number' });
        }

        const client = await Customer.create({
            ...req.body,
            salonId
        });

        res.status(201).json({
            success: true,
            data: client
        });
    } catch (err) {
        console.error('Create client error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Update client
// @route   PATCH /clients/:id
// @access  Private
exports.updateClient = async (req, res) => {
    try {
        let client = await Customer.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        const updatedClient = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: updatedClient
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete client
// @route   DELETE /clients/:id
// @access  Private
exports.deleteClient = async (req, res) => {
    try {
        const client = await Customer.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        await Customer.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Client removed successfully'
        });
    } catch (err) {
        console.error('Delete client error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
