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
