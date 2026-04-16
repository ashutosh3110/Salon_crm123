const Order = require('../Models/Order');
const Customer = require('../Models/Customer');
const WalletTransaction = require('../Models/WalletTransaction');
const Salon = require('../Models/Salon');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { 
            items, 
            totalAmount, 
            paymentMethod, 
            address, 
            salonId, 
            outletId, 
            deliveryPreference,
            deliveryCharge,
            subtotal,
            membershipDiscount
        } = req.body;
        const customerId = req.user._id;

        // Handle Wallet Deduction
        if (paymentMethod === 'wallet') {
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }

            if ((customer.walletBalance || 0) < totalAmount) {
                return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
            }

            // Deduct from wallet
            customer.walletBalance -= totalAmount;
            await customer.save();

            // Log Transaction
            await WalletTransaction.create({
                customerId,
                salonId,
                amount: totalAmount,
                type: 'DEBIT',
                description: `Purchase of ${items.length} items from shop`,
                status: 'COMPLETED'
            });
        }

        const order = await Order.create({
            customerId,
            salonId,
            items,
            totalAmount,
            paymentMethod,
            address,
            outletId,
            deliveryPreference,
            deliveryCharge: deliveryCharge || 0,
            subtotal: subtotal || totalAmount,
            membershipDiscount: membershipDiscount || 0,
            paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending'
        });
        
        // Award Loyalty Points if payment is paid (wallet) or otherwise based on business logic
        // For simplicity, we award on creation if it's wallet/cod as initial status is 'pending' for cod
        if (paymentMethod === 'wallet') {
            try {
                const salon = await Salon.findById(salonId);
                if (salon && salon.loyaltySetting && salon.loyaltySetting.active) {
                    const rate = salon.loyaltySetting.pointsRate || 100;
                    const points = Math.floor(totalAmount / rate);
                    if (points > 0) {
                        await Customer.findByIdAndUpdate(customerId, { $inc: { loyaltyPoints: points } });
                        await LoyaltyTransaction.create({
                            customerId,
                            salonId,
                            amount: points,
                            type: 'EARNED',
                            description: `Points earned on Order #${order._id.toString().slice(-6)}`
                        });
                    }
                }
            } catch (le) { console.error('Loyalty Error:', le); }
        }

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get customer orders
// @route   GET /api/orders/me
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id })
            .populate('items.productId', 'name image')
            .populate('salonId', 'name logo')
            .populate('outletId', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: orders
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId', 'name image price sellingPrice')
            .populate('salonId', 'name logo')
            .populate('outletId', 'name city');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Security check: ensure order belongs to current customer
        if (order.customerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
