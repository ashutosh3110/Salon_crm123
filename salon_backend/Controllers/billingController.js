const Payment = require('../Models/Payment');
const Salon = require('../Models/Salon');
const Plan = require('../Models/Plan');

// @desc    Get billing statistics for superadmin
// @route   GET /api/billing/stats
// @access  Private/SuperAdmin
exports.getBillingStats = async (req, res) => {
    try {
        // 1. Total Stats
        const [totals, totalSubscribedSalons] = await Promise.all([
            Payment.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: { $cond: [{ $in: ["$status", ["captured", "pending", "created"]] }, "$amount", 0] } }, // Active revenue (collected + pending)
                        collectedAmount: { $sum: { $cond: [{ $eq: ["$status", "captured"] }, "$amount", 0] } },
                        pendingAmount: { $sum: { $cond: [{ $in: ["$status", ["pending", "created"]] }, "$amount", 0] } }
                    }
                }
            ]),
            Salon.countDocuments({ subscriptionPlan: { $ne: 'none' } })
        ]);

        const totalStats = totals[0] || { totalAmount: 0, collectedAmount: 0, pendingAmount: 0 };

        // 2. Monthly Revenue Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyRevenue = await Payment.aggregate([
            { 
                $match: { 
                    status: 'captured', 
                    createdAt: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$amount" },
                    subtotal: { $sum: { $divide: ["$amount", 1.18] } }, // Rough subtotal (assuming 18% GST)
                    tax: { $sum: { $subtract: ["$amount", { $divide: ["$amount", 1.18] }] } }
                }
            },
            { $sort: { "_id": 1 } },
            { 
                $project: { 
                    month: "$_id", 
                    revenue: 1, 
                    subtotal: { $round: ["$subtotal", 2] }, 
                    tax: { $round: ["$tax", 2] }, 
                    _id: 0 
                } 
            }
        ]);

        // 3. Plan Distribution Revenue
        const planDistribution = await Payment.aggregate([
            { $match: { status: 'captured' } },
            {
                $lookup: {
                    from: 'plans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'planInfo'
                }
            },
            { $unwind: '$planInfo' },
            {
                $group: {
                    _id: '$planInfo.name',
                    revenue: { $sum: "$amount" },
                    value: { $sum: 1 }
                }
            },
            { $project: { name: "$_id", revenue: 1, value: 1, _id: 0 } }
        ]);

        res.json({
            success: true,
            code: 200,
            data: {
                totalAmount: totalStats.totalAmount || 0,
                collectedAmount: totalStats.collectedAmount || 0,
                pendingAmount: totalStats.pendingAmount || 0,
                totalSubscribedSalons,
                refundedAmount: 0, 
                monthlyRevenue,
                planDistribution
            }
        });

    } catch (err) {
        console.error('Billing Stats Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all transactions for superadmin
// @route   GET /api/billing/transactions
// @access  Private/SuperAdmin
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Payment.find()
            .populate('salonId', 'name email')
            .populate('planId', 'name')
            .sort({ createdAt: -1 })
            .limit(100);

        // Format for frontend
        const results = transactions.map(t => ({
            _id: t._id,
            invoiceNumber: t.orderId?.replace('order_', 'INV-') || `INV-${t._id.toString().slice(-6).toUpperCase()}`,
            tenantId: {
                _id: t.salonId?._id,
                name: t.salonId?.name || 'Unknown Salon'
            },
            planName: t.planId?.name || 'N/A',
            amount: t.amount, // Base amount
            taxAmount: Math.round(t.amount * 0.18),
            totalAmount: Math.round(t.amount * 1.18),
            status: t.status,
            createdAt: t.createdAt,
            createdAt: t.createdAt,
            paymentMethod: t.amount === 0 ? 'Free' : 'Razorpay'
        }));

        res.json({
            success: true,
            code: 200,
            data: {
                results
            }
        });
    } catch (err) {
        console.error('Transactions Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update payment status
// @route   PUT /api/billing/transactions/:id/status
// @access  Private/SuperAdmin
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        payment.status = status;
        await payment.save();

        res.json({
            success: true,
            code: 200,
            message: `Payment status updated to ${status}`
        });
    } catch (err) {
        console.error('Update Payment Status Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Manually create an invoice
// @route   POST /api/billing/manual-invoice
// @access  Private/SuperAdmin
exports.createManualInvoice = async (req, res) => {
    try {
        const { tenantId, amount, notes, dueDate } = req.body;
        
        // This would create an 'pending' payment record
        const payment = new Payment({
            salonId: tenantId,
            amount: amount,
            status: 'pending',
            orderId: `manual_${Date.now()}`,
            receipt: `receipt_${Date.now()}`
        });

        await payment.save();

        res.status(201).json({
            success: true,
            code: 201,
            message: 'Manual invoice created successfully',
            data: {
                invoiceNumber: payment.orderId.replace('manual_', 'INV-M'),
                tenantId,
                amount,
                status: 'pending'
            }
        });
    } catch (err) {
        console.error('Manual Invoice Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
