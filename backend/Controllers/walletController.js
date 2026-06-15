const Customer = require('../Models/Customer');
const { sendWapixoTemplate, checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
const WalletTransaction = require('../Models/WalletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Salon = require('../Models/Salon');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const { addCredit } = require('../Utils/walletHelper');

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn('Razorpay keys are missing in walletController.');
}


// @desc    Get wallet balance and transactions
// @route   GET /api/wallet
// @access  Private (Customer)
exports.getWalletDetails = async (req, res) => {
    try {
        let customer = await Customer.findById(req.user._id || req.user.id).populate('outletWallets.outletId', 'name');
        
        if (!customer) {
            // If they are Admin/Staff, they don't have a wallet yet
            return res.json({
                success: true,
                balance: 0,
                outletBalances: [],
                transactions: [],
                message: 'No wallet associated with this account type'
            });
        }

        const transactions = await WalletTransaction.find({ customerId: req.user._id })
            .populate('outletId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: {
                balance: customer.walletBalance || 0,
                outletBalances: customer.outletWallets.map(w => ({
                    outletId: w.outletId?._id || w.outletId,
                    outletName: w.outletId?.name || 'Unknown Outlet',
                    balance: w.balance
                })),
                transactions: transactions.map(tx => ({
                    id: tx._id,
                    amount: tx.amount,
                    remainingAmount: tx.remainingAmount,
                    type: tx.type,
                    description: tx.description,
                    date: tx.createdAt,
                    status: tx.status,
                    expiryDate: tx.expiryDate,
                    outletName: tx.outletId ? (tx.outletId.name || 'Unknown Outlet') : 'Global Wallet'
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create top-up order
// @route   POST /api/wallet/topup/order
// @access  Private (Customer)
exports.createTopupOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `topup_${Date.now()}`
        };

        if (!razorpay) {
            return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
        }
        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify top-up payment and update balance
// @route   POST /api/wallet/topup/verify
// @access  Private (Customer)
exports.verifyTopup = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, outletId } = req.body;

        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'lW6qHLoV7I0qXW8S0S8S0S8S')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpaySignature) {
            // Use wallet helper to add credit to GLOBAL WALLET (outletId = null)
            const customer = await Customer.findById(req.user._id);
            await addCredit(
                req.user._id,
                customer.salonId,
                null,
                amount,
                'Wallet Top-up via Razorpay'
            );

            // Send WhatsApp Message with credit check
            try {
                const salon = await Salon.findById(customer.salonId);
                const brandName = salon?.businessName || salon?.name || 'Our Salon';

                const canSendWhatsApp = await checkAndDeductWhatsAppCredit(customer.lastOutletId || customer.salonId);
                
                if (canSendWhatsApp) {
                    await sendWapixoTemplate(
                        customer.phone,
                        process.env.WHATSAPP_TEMPLATE_WALLET,
                        [
                            customer.name,
                            'Deposit (Credit)',
                            `₹${amount}`,
                            `₹${customer.walletBalance}`,
                            brandName
                        ]
                    );
                }
            } catch (wsErr) {
                console.error('Wallet WhatsApp failed:', wsErr.message);
            }
            
            // Send Push Notification
            try {
                const { sendNotification } = require('../Utils/notification');
                await sendNotification({
                    customerId: req.user._id,
                    salonId: customer.salonId,
                    title: 'Wallet Updated! 💰',
                    message: `Hi ${customer.name}, ₹${amount} has been added to your wallet. New balance: ₹${customer.walletBalance}`,
                    type: 'wallet',
                    actionUrl: '/app/wallet'
                });
            } catch (pushErr) {
                console.error('Wallet Push failed:', pushErr.message);
            }

            // Award Loyalty Points
            try {
                const salon = await Salon.findById(customer.salonId);
                if (salon && salon.loyaltySetting && salon.loyaltySetting.active) {
                    const rate = salon.loyaltySetting.pointsRate || 100;
                    const points = Math.floor(Number(amount) / rate);
                    if (points > 0) {
                        await Customer.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: points } });
                        await LoyaltyTransaction.create({
                            customerId: req.user._id,
                            salonId: customer.salonId,
                            amount: points,
                            type: 'EARN',
                            description: `Points earned on Wallet Top-up (₹${amount})`
                        });
                    }
                }
            } catch (le) { console.error('Loyalty Error:', le); }

            res.json({
                success: true,
                data: {
                    balance: customer.walletBalance,
                    message: 'Wallet top-up successful'
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Bulk recharge wallets (Admin)
// @route   POST /api/wallet/bulk-recharge
// @access  Private (Admin)
exports.bulkRecharge = async (req, res) => {
    try {
        const { customerIds, amount, note, outletId } = req.body;
        
        if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Customer IDs array is required' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }
        
        if (!outletId) {
            return res.status(400).json({ success: false, message: 'outletId is required' });
        }

        const numericAmount = Number(amount);
        const salonId = req.user.salonId;

        // Perform bulk update
        const results = await Promise.all(customerIds.map(async (cid) => {
            try {
                // Use helper to add credit with optional expiry
                await addCredit(
                    cid,
                    salonId,
                    outletId,
                    numericAmount,
                    note || 'Bulk Promotional Credit',
                    req.body.expiryDate ? new Date(req.body.expiryDate) : null
                );
                
                const customer = await Customer.findById(cid);

                if (customer) {
                    // Send WhatsApp Message with credit check
                    try {
                        const salon = await Salon.findById(salonId);
                        const brandName = salon?.businessName || salon?.name || 'Our Salon';

                        const canSendWhatsApp = await checkAndDeductWhatsAppCredit(customer.lastOutletId || salonId);

                        if (canSendWhatsApp) {
                            await sendWapixoTemplate(
                                customer.phone,
                                process.env.WHATSAPP_TEMPLATE_WALLET,
                                [
                                    customer.name,
                                    'Promotional Credit',
                                    `₹${numericAmount}`,
                                    `₹${customer.walletBalance}`,
                                    brandName
                                ]
                            );
                        }
                    } catch (wsErr) {
                        console.error('Wallet WhatsApp failed:', wsErr.message);
                    }

                    // Send Push Notification
                    try {
                        const { sendNotification } = require('../Utils/notification');
                        await sendNotification({
                            customerId: cid,
                            salonId: salonId,
                            title: 'Wallet Updated! 💰',
                            message: `Hi ${customer.name}, ₹${numericAmount} has been credited to your wallet. New balance: ₹${customer.walletBalance}`,
                            type: 'wallet',
                            actionUrl: '/app/wallet'
                        });
                    } catch (pushErr) {
                        console.error('Wallet Push failed:', pushErr.message);
                    }

                    return { id: cid, success: true };
                }
                return { id: cid, success: false, message: 'Customer not found' };
            } catch (err) {
                return { id: cid, success: false, message: err.message };
            }
        }));

        res.json({
            success: true,
            results,
            message: `Processed ${results.filter(r => r.success).length} out of ${customerIds.length} recharges`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Direct top-up (simulated/direct)
// @route   POST /api/wallet/topup/direct
// @access  Private (Customer)
exports.directTopup = async (req, res) => {
    try {
        const { amount, outletId } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }
        if (!outletId) {
            return res.status(400).json({ success: false, message: 'outletId is required' });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        await addCredit(
            req.user._id,
            customer.salonId,
            outletId,
            amount,
            'Wallet Top-up (Direct)'
        );

        // Award Loyalty Points
        try {
            const salon = await Salon.findById(customer.salonId);
            if (salon && salon.loyaltySetting && salon.loyaltySetting.active) {
                const rate = salon.loyaltySetting.pointsRate || 100;
                const points = Math.floor(Number(amount) / rate);
                if (points > 0) {
                    await Customer.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: points } });
                    await LoyaltyTransaction.create({
                        customerId: req.user._id,
                        salonId: customer.salonId,
                        amount: points,
                        type: 'EARN',
                        description: `Points earned on Wallet Top-up (₹${amount})`
                    });
                }
            }
        } catch (le) { console.error('Loyalty Error:', le); }

        res.json({
            success: true,
            data: {
                balance: customer.walletBalance,
                message: 'Wallet top-up successful'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Get wallet balance for a specific customer
// @route   GET /api/wallet/customer/:customerId
// @access  Private
exports.getCustomerWallet = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId).populate('outletWallets.outletId', 'name');
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({
            success: true,
            data: {
                balance: customer.walletBalance || 0,
                outletBalances: customer.outletWallets.map(w => ({
                    outletId: w.outletId?._id || w.outletId,
                    outletName: w.outletId?.name || 'Unknown Outlet',
                    balance: w.balance
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get transactions for a specific customer
// @route   GET /api/wallet/transactions/customer/:customerId
// @access  Private
exports.getCustomerTransactions = async (req, res) => {
    try {
        const transactions = await WalletTransaction.find({ customerId: req.params.customerId })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Transfer wallet balance between outlets (Admin)
// @route   POST /api/wallet/transfer
// @access  Private (Admin)
exports.transferWalletBalance = async (req, res) => {
    try {
        const { customerId, fromOutletId, toOutletId, amount } = req.body;

        if (!customerId || !fromOutletId || !toOutletId || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid input data for transfer' });
        }

        if (fromOutletId === toOutletId) {
            return res.status(400).json({ success: false, message: 'Source and destination outlets cannot be the same' });
        }

        const numericAmount = Number(amount);
        const { spendWallet, addCredit } = require('../Utils/walletHelper');

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        let fromWallet = customer.outletWallets.find(w => w.outletId && w.outletId.toString() === fromOutletId.toString());
        if (!fromWallet || fromWallet.balance < numericAmount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance in the source outlet' });
        }

        // Spend from source
        await spendWallet(customerId, fromOutletId, numericAmount, 'Transferred out to another outlet');

        // Add to destination
        await addCredit(customerId, customer.salonId, toOutletId, numericAmount, 'Transferred in from another outlet');

        res.json({
            success: true,
            message: 'Balance transferred successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
