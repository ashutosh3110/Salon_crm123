const mongoose = require('mongoose');
const Customer = require('../Models/Customer');
const { sendWapixoTemplate, checkAndDeductWhatsAppCredit, sendWhatsAppMessage } = require('../Utils/whatsapp');
const Salon = require('../Models/Salon');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const crypto = require('crypto');

const generateReferralCode = () => {
    return 'WAP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// @desc    Get all clients (customers) for current salon
// @route   GET /clients
// @access  Private
exports.getClients = async (req, res) => {
    try {
        const salonId = req.user.role === 'customer' ? req.query.salonId : req.user.salonId;
        
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID context missing' });
        }

        // Build search query matching options
        const matchQuery = { salonId: new mongoose.Types.ObjectId(salonId) };
        if (req.query.wishesSentOnly === 'true') {
            matchQuery.$or = [
                { birthdayWishSent: true },
                { anniversaryWishSent: true }
            ];
        }
        if (req.query.outletId) {
            matchQuery.lastOutletId = new mongoose.Types.ObjectId(req.query.outletId);
        }

        const findQuery = { salonId };
        if (req.query.wishesSentOnly === 'true') {
            findQuery.$or = [
                { birthdayWishSent: true },
                { anniversaryWishSent: true }
            ];
        }
        if (req.query.outletId) {
            findQuery.lastOutletId = req.query.outletId;
        }

        // Search parameter filtering support
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            const searchConditions = [
                { name: searchRegex },
                { phone: searchRegex },
                { email: searchRegex }
            ];
            
            // Merge with existing $or if it exists, otherwise assign it
            if (findQuery.$or) {
                findQuery.$and = [
                    { $or: findQuery.$or },
                    { $or: searchConditions }
                ];
                delete findQuery.$or;
            } else {
                findQuery.$or = searchConditions;
            }

            if (matchQuery.$or) {
                matchQuery.$and = [
                    { $or: matchQuery.$or },
                    { $or: searchConditions }
                ];
                delete matchQuery.$or;
            } else {
                matchQuery.$or = searchConditions;
            }
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        // Global Stats (Independent of pagination)
        const stats = await Customer.aggregate([
            { $match: matchQuery },
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

        const clients = await Customer.find(findQuery)
            .populate('lastOutletId', 'name')
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
        const { name, phone, email, gender, dob, anniversary, address, loyaltyPoints, walletBalance, appliedReferralCode } = req.body;

        // Validation - Phone must be exactly 10 digits
        if (!phone || String(phone).replace(/\D/g, '').length !== 10) {
            return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
        }

        // Validation - DOB and Anniversary cannot be in the future
        const todayStr = new Date().toISOString().split('T')[0];
        if (dob && dob > todayStr) {
            return res.status(400).json({ success: false, message: 'Birth date cannot be in the future' });
        }
        if (anniversary && anniversary > todayStr) {
            return res.status(400).json({ success: false, message: 'Anniversary date cannot be in the future' });
        }

        // Check if customer with this phone already exists globally
        const existing = await Customer.findOne({ phone });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Client already exists with this phone number' });
        }

        const client = await Customer.create({
            ...req.body,
            referralCode: generateReferralCode(),
            salonId
        });

        // Handle Referral Logic
        if (appliedReferralCode) {
            const referrer = await Customer.findOne({ referralCode: appliedReferralCode });
            if (referrer && referrer._id.toString() !== client._id.toString()) {
                const salon = await Salon.findById(salonId).select('loyaltySetting');
                const rewards = salon?.loyaltySetting || {};
                const pointsReferrer = rewards.referralPoints || 200;
                const pointsReferred = rewards.referredPoints || 100;

                // Award points to Referrer
                referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + pointsReferrer;
                await referrer.save();

                await LoyaltyTransaction.create({
                    customerId: referrer._id,
                    salonId,
                    type: 'CREDIT',
                    amount: pointsReferrer,
                    source: 'REFERRAL',
                    description: `Referral bonus for inviting ${client.phone}`
                });

                // Award points to New Customer
                client.loyaltyPoints = (client.loyaltyPoints || 0) + pointsReferred;
                await client.save();

                await LoyaltyTransaction.create({
                    customerId: client._id,
                    salonId,
                    type: 'CREDIT',
                    amount: pointsReferred,
                    source: 'REFERRAL',
                    description: `Welcome bonus using referral code ${appliedReferralCode}`
                });
                console.log(`[Referral] Admin Manual Add Points awarded: Referrer(+${pointsReferrer}), New(+${pointsReferred})`);
            }
        }

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
        if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
            return res.status(400).json({ success: false, message: 'Client already exists with this phone number' });
        }
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Update client
// @route   PATCH /clients/:id
// @access  Private
exports.updateClient = async (req, res) => {
    try {
        const { phone, dob, anniversary } = req.body;

        // Validation - Phone must be exactly 10 digits
        if (phone && String(phone).replace(/\D/g, '').length !== 10) {
            return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
        }

        // Validation - DOB and Anniversary cannot be in the future
        const todayStr = new Date().toISOString().split('T')[0];
        if (dob && dob > todayStr) {
            return res.status(400).json({ success: false, message: 'Birth date cannot be in the future' });
        }
        if (anniversary && anniversary > todayStr) {
            return res.status(400).json({ success: false, message: 'Anniversary date cannot be in the future' });
        }

        let client = await Customer.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        if (phone && phone !== client.phone) {
            const existingPhone = await Customer.findOne({ phone });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: 'Client already exists with this phone number' });
            }
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
        console.error('Update client error:', err);
        if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
            return res.status(400).json({ success: false, message: 'Client already exists with this phone number' });
        }
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
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
        if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
            return res.status(400).json({ success: false, message: 'Duplicate phone numbers detected during bulk import' });
        }
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Get clients with outstanding due amount
// @route   GET /clients/payment-due
// @access  Private
exports.getPaymentDueClients = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID context missing' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {
            salonId,
            dueAmount: { $gt: 0 }
        };

        if (req.query.outletId) {
            query.lastOutletId = req.query.outletId;
        }

        const totalCount = await Customer.countDocuments(query);
        const clients = await Customer.find(query)
            .sort({ dueAmount: -1, name: 1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: clients
        });
    } catch (err) {
        console.error('Get payment due clients error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Increment payment reminder count for a client
// @route   PATCH /clients/:id/increment-reminder
// @access  Private
exports.incrementReminderCount = async (req, res) => {
    try {
        const client = await Customer.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        client.paymentReminderCount = (client.paymentReminderCount || 0) + 1;
        client.lastPaymentReminderSentAt = new Date();
        await client.save();

        res.json({
            success: true,
            message: 'Reminder count incremented successfully',
            data: {
                paymentReminderCount: client.paymentReminderCount,
                lastPaymentReminderSentAt: client.lastPaymentReminderSentAt
            }
        });
    } catch (err) {
        console.error('Increment reminder count error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send manual payment reminder via WhatsApp API
// @route   POST /clients/:id/send-payment-reminder
// @access  Private
exports.sendManualPaymentReminder = async (req, res) => {
    try {
        const client = await Customer.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        if (!client.dueAmount || client.dueAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Client has no outstanding dues' });
        }

        const salon = await Salon.findById(req.user.salonId);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        // Deduct WhatsApp credit
        const canSend = await checkAndDeductWhatsAppCredit(salon._id);
        if (!canSend) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient WhatsApp credits or WhatsApp notifications disabled for your salon.' 
            });
        }

        const templateName = process.env.WHATSAPP_TEMPLATE_PAYMENT_REMINDER || 'payment_reminder';
        const salonName = salon.businessName || salon.name || 'Wapixo';
        
        let sendResult;
        if (process.env.WHATSAPP_TEMPLATE_PAYMENT_REMINDER) {
            // Template parameters: [Customer Name, Dues Amount, Salon Name]
            sendResult = await sendWapixoTemplate(client.phone, templateName, [
                client.name,
                String(client.dueAmount),
                salonName
            ]);
        } else {
            // Fallback to sending plain text message
            const msg = `Dear ${client.name}, this is a friendly reminder that you have a pending payment of ₹${client.dueAmount} outstanding at ${salonName}. Please settle this at your earliest convenience. Thank you!`;
            sendResult = await sendWhatsAppMessage(client.phone, msg);
        }

        if (!sendResult.success) {
            return res.status(400).json({
                success: false,
                message: sendResult.message || 'Failed to send WhatsApp message via API.'
            });
        }

        // Increment count and update timestamp
        client.paymentReminderCount = (client.paymentReminderCount || 0) + 1;
        client.lastPaymentReminderSentAt = new Date();
        await client.save();

        res.json({
            success: true,
            message: 'Payment reminder sent successfully via WhatsApp API',
            data: {
                paymentReminderCount: client.paymentReminderCount,
                lastPaymentReminderSentAt: client.lastPaymentReminderSentAt
            }
        });
    } catch (err) {
        console.error('Send manual payment reminder error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Register birthday/anniversary wish sent
// @route   PATCH /clients/:id/celebration-wish
// @access  Private
exports.registerCelebrationWish = async (req, res) => {
    try {
        const { type } = req.body; // 'birthday' or 'anniversary'
        const client = await Customer.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        if (type === 'birthday') {
            client.birthdayWishSent = true;
            client.lastBirthdayWishSentAt = new Date();
        } else if (type === 'anniversary') {
            client.anniversaryWishSent = true;
            client.lastAnniversaryWishSentAt = new Date();
        } else {
            return res.status(400).json({ success: false, message: 'Invalid celebration type' });
        }

        await client.save();

        res.json({
            success: true,
            message: 'Celebration wish registered successfully',
            data: client
        });
    } catch (err) {
        console.error('Register celebration wish error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send manual celebration wish via WhatsApp API
// @route   POST /clients/:id/send-celebration-wish
// @access  Private
exports.sendManualCelebrationWish = async (req, res) => {
    try {
        const { type } = req.body; // 'birthday' or 'anniversary'
        const client = await Customer.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        const salon = await Salon.findById(req.user.salonId);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        // Deduct WhatsApp credit (checks salon or outlet context)
        const canSend = await checkAndDeductWhatsAppCredit(client.lastOutletId || salon._id);
        if (!canSend) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient WhatsApp credits or WhatsApp notifications disabled for your salon.' 
            });
        }

        const celebrationTemplate = process.env.WHATSAPP_TEMPLATE_SPECIAL_DAYS || 'special_days';
        const salonName = salon.businessName || salon.name || 'Wapixo';
        
        let msgText = '';
        let points = 0;
        if (type === 'birthday') {
            msgText = "Happy Birthday! We wish you a fantastic year ahead filled with joy and beauty.";
            points = salon.loyaltySetting?.birthdayPoints || 50;
        } else if (type === 'anniversary') {
            msgText = "Happy Anniversary! Celebrating your beautiful journey together.";
            points = salon.loyaltySetting?.anniversaryPoints || 100;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid celebration type' });
        }

        let sendResult;
        if (process.env.WHATSAPP_TEMPLATE_SPECIAL_DAYS) {
            // Template parameters: [Customer Name, Message, Points, Salon Name]
            sendResult = await sendWapixoTemplate(client.phone, celebrationTemplate, [
                client.name,
                msgText,
                String(points),
                salonName
            ]);
        } else {
            // Fallback to sending plain text message
            const plainMsg = `Dear ${client.name}, ${msgText} - ${salonName}`;
            sendResult = await sendWhatsAppMessage(client.phone, plainMsg);
        }

        if (!sendResult.success) {
            return res.status(400).json({
                success: false,
                message: sendResult.message || 'Failed to send WhatsApp message via API.'
            });
        }

        // Update sent flags and timestamps
        if (type === 'birthday') {
            client.birthdayWishSent = true;
            client.lastBirthdayWishSentAt = new Date();
        } else {
            client.anniversaryWishSent = true;
            client.lastAnniversaryWishSentAt = new Date();
        }
        await client.save();

        res.json({
            success: true,
            message: 'Celebration wish sent successfully via WhatsApp API',
            data: client
        });
    } catch (err) {
        console.error('Send manual celebration wish error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get inactive clients (customers) with last activity details
// @route   GET /clients/inactive
// @access  Private
exports.getInactiveClients = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID context missing' });
        }

        // Ensure models are registered
        require('../Models/Booking');
        require('../Models/Invoice');
        const Booking = mongoose.model('Booking');
        const Invoice = mongoose.model('Invoice');

        const inactiveCustomers = await Customer.aggregate([
            {
                $match: {
                    salonId: new mongoose.Types.ObjectId(salonId)
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    let: { customerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$clientId', '$$customerId'] } } },
                        { $sort: { appointmentDate: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'latestBooking'
                }
            },
            {
                $lookup: {
                    from: 'invoices',
                    let: { customerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$customerId', '$$customerId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'latestInvoice'
                }
            },
            {
                $project: {
                    name: 1,
                    phone: 1,
                    email: 1,
                    lastLogin: 1,
                    lastVisit: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    latestBookingDate: { $arrayElemAt: ['$latestBooking.appointmentDate', 0] },
                    latestInvoiceDate: { $arrayElemAt: ['$latestInvoice.createdAt', 0] }
                }
            }
        ]);

        const today = new Date();
        const mapped = inactiveCustomers.map(customer => {
            const dates = [
                { date: customer.createdAt, type: 'Profile Registration' },
                { date: customer.updatedAt, type: 'Profile Update' },
                { date: customer.lastLogin, type: 'App Login' },
                { date: customer.lastVisit, type: 'Last Visit' },
                { date: customer.latestBookingDate, type: 'Appointment Booking' },
                { date: customer.latestInvoiceDate, type: 'Invoice / Billing' }
            ].filter(d => d.date);

            // Sort dates to find the latest activity
            dates.sort((a, b) => new Date(b.date) - new Date(a.date));

            const latest = dates[0] || { date: customer.createdAt, type: 'Profile Registration' };
            const latestDate = new Date(latest.date);
            const diffTime = Math.max(0, today - latestDate);
            const inactiveDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            let status = 'Inactive (1-3 Months)';
            if (inactiveDays >= 90) {
                status = 'Dormant (3+ Months)';
            }

            return {
                _id: customer._id,
                name: customer.name || 'New Customer',
                phone: customer.phone,
                email: customer.email || '',
                lastActivityDate: latestDate,
                lastActivityType: latest.type,
                inactiveDays,
                status
            };
        });

        // Filter for customers with 30+ days of inactivity
        const result = mapped.filter(c => c.inactiveDays >= 30);

        // Sort descending by days since last activity
        result.sort((a, b) => b.inactiveDays - a.inactiveDays);

        res.json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (err) {
        console.error('Get inactive clients error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


