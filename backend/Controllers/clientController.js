const mongoose = require('mongoose');
const Customer = require('../Models/Customer');
const { sendWapixoTemplate } = require('../Utils/whatsapp');
const Salon = require('../Models/Salon');

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

        // Send Welcome WhatsApp Message
        try {
            const salon = await Salon.findById(salonId);
            const brandName = salon?.businessName || 'Our Salon';
            
            await sendWapixoTemplate(
                client.phone,
                process.env.WHATSAPP_TEMPLATE_WELCOME,
                [client.name, brandName]
            );
        } catch (wsErr) {
            console.error('Welcome WhatsApp failed:', wsErr.message);
        }

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
// @desc    Bulk import clients
// @route   POST /clients/bulk
// @access  Private
exports.bulkImport = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { customers } = req.body;

        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon context missing. Please re-login.' });
        }

        if (!customers || !Array.isArray(customers)) {
            return res.status(400).json({ success: false, message: 'Invalid data format. Expected an array of customers.' });
        }

        console.log(`Starting bulk import for salon ${salonId}, count: ${customers.length}`);

        const validCustomers = [];
        const existingPhones = new Set(
            (await Customer.find({ salonId }, 'phone')).map(c => c.phone)
        );

        for (const c of customers) {
            // Basic validation - check both lowercase and original keys
            const name = c.name || c.Name;
            const phone = c.phone || c.Phone;

            if (!name || !phone) continue;
            
            // Skip if phone exists
            if (existingPhones.has(String(phone))) continue;

            validCustomers.push({
                name,
                phone: String(phone),
                email: c.email || '',
                gender: c.gender || 'Other',
                dob: c.dob || '',
                address: c.address || '',
                salonId,
                status: 'active',
                isVIP: false,
                totalVisits: 0,
                totalSpend: 0
            });
            existingPhones.add(String(phone)); 
        }

        if (validCustomers.length === 0) {
            return res.status(400).json({ success: false, message: 'No new unique customers to import' });
        }

        const results = await Customer.insertMany(validCustomers);

        res.json({
            success: true,
            count: results.length,
            message: 'Import completed successfully'
        });
    } catch (err) {
        console.error('Bulk import error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};
