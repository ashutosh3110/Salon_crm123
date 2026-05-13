const Order = require('../Models/Order');
const Customer = require('../Models/Customer');
const WalletTransaction = require('../Models/WalletTransaction');
const Salon = require('../Models/Salon');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const { sendWapixoTemplate } = require('../Utils/whatsapp');
const mongoose = require('mongoose');

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
            membershipDiscount,
            taxAmount
        } = req.body;
        const customerId = req.user._id;

        // Validation for Home Delivery
        if (deliveryPreference === 'home') {
            if (!address || !address.street || !address.city || !address.zip) {
                return res.status(400).json({
                    success: false,
                    message: 'Street address, city, and zip code are mandatory for home delivery.'
                });
            }
        }

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

            // Increment total spend
            customer.totalSpend = (customer.totalSpend || 0) + totalAmount;

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
            taxAmount: taxAmount || 0,
            paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
            timeline: [{
                status: 'pending',
                note: 'Order placed successfully'
            }]
        });

        // Award Loyalty Points if payment is paid (wallet) or otherwise based on business logic
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
                            type: 'EARN',
                            description: `Points earned on Order #${order._id.toString().slice(-6)}`
                        });
                    }
                }
            } catch (le) { console.error('Loyalty Error:', le); }
        }

        // Send WhatsApp Notification for Product Purchase
        try {
            const populatedOrder = await Order.findById(order._id)
                .populate('customerId', 'name phone')
                .populate('salonId', 'businessName name')
                .populate('outletId', 'name city');

            if (populatedOrder && populatedOrder.customerId && populatedOrder.customerId.phone) {
                const brandName = populatedOrder.salonId?.businessName || populatedOrder.salonId?.name || 'Our Salon';
                const orderId = populatedOrder._id.toString().slice(-6).toUpperCase();

                await sendWapixoTemplate(
                    populatedOrder.customerId.phone,
                    process.env.WHATSAPP_TEMPLATE_PRODUCT_BUY || 'product_buy',
                    [
                        populatedOrder.customerId.name || 'Customer',
                        brandName,
                        orderId,
                        `${populatedOrder.items.length} Items`,
                        `₹${populatedOrder.totalAmount}`,
                        populatedOrder.paymentMethod.toUpperCase(),
                        populatedOrder.outletId?.name || 'Our Outlet',
                        new Date().toLocaleDateString()
                    ]
                );
                console.log(`[Order-WhatsApp] Sent to ${populatedOrder.customerId.phone} for Order #${orderId}`);
            }
        } catch (wsErr) {
            console.error('[Order-WhatsApp] Failed:', wsErr.message);
        }

        // Send Push Notification
        try {
            const { sendNotification, sendAdminNotification } = require('../Utils/notification');
            await sendNotification({
                customerId: order.customerId,
                salonId: order.salonId,
                title: 'Order Placed! 🛍️',
                message: `Your order for ${items.length} items has been placed successfully.`,
                type: 'order',
                actionUrl: `/app/orders/${order._id}`,
                data: { orderId: order._id.toString() }
            });

            // Notify Admins
            const { sendWhatsAppMessage } = require('../Utils/whatsapp');
            const User = require('../Models/User');
            const populatedOrder = await Order.findById(order._id).populate('customerId', 'name');

            const adminTitle = 'New Order Received! 🛒';
            const adminMsg = `New order received from ${populatedOrder.customerId?.name || 'Customer'} for ${items.length} items. Total: ₹${totalAmount}.`;

            await sendAdminNotification({
                salonId,
                title: adminTitle,
                message: adminMsg,
                type: 'order',
                actionUrl: `/admin/shop-orders` // or specific order link if available
            });

            /* 
            // Removed WhatsApp to Admins as per request (Firebase Only)
            const admins = await User.find({ salonId, role: 'admin', status: 'active' });
            for (const ad of admins) {
                if (ad.phone) {
                    await sendWhatsAppMessage(ad.phone, adminMsg);
                }
            }
            */
        } catch (pushErr) {
            console.error('Order Notification failed:', pushErr.message);
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

// @desc    Get all orders for a salon (Admin)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const orders = await Order.find({ salonId })
            .populate('customerId', 'name phone')
            .populate('items.productId', 'name image price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get orders for a specific customer
// @route   GET /api/orders/customer/:customerId
// @access  Private
exports.getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.customerId })
            .populate('items.productId', 'name image price sellingPrice')
            .populate('salonId', 'name logo')
            .populate('outletId', 'name city')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin/Staff)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note, estimatedDeliveryDate, deliveryPartner } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const validStatuses = ['accepted', 'rejected', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const previousStatus = order.status;
        order.status = status;
        if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;
        if (deliveryPartner) order.deliveryPartner = deliveryPartner;

        if (status === 'delivered') {
            order.paymentStatus = 'paid';
            
            // Deduct stock if not already deducted (checking previousStatus)
            if (previousStatus !== 'delivered') {
                const Product = require('../Models/Product');
                for (const item of order.items) {
                    try {
                        const product = await Product.findById(item.productId);
                        if (product) {
                            const qty = Number(item.quantity) || 1;
                            
                            // 1. Update total stock
                            product.stock = (product.stock || 0) - qty;
                            
                            // 2. Update outlet stock
                            if (order.outletId) {
                                const outletKey = order.outletId.toString();
                                const currentStock = product.stockByOutlet.get(outletKey) || 0;
                                product.stockByOutlet.set(outletKey, Math.max(0, currentStock - qty));
                            }
                            
                            await product.save();
                            console.log(`[Inventory] Deducted ${qty} of ${product.name} for Order #${order._id}`);
                        }
                    } catch (invErr) {
                        console.error(`[Inventory-Error] Failed for product ${item.productId}:`, invErr.message);
                    }
                }
            }
        }

        order.timeline.push({
            status,
            note: note || `Order marked as ${status}`,
            timestamp: new Date()
        });

        await order.save();

        // Send Unified Notifications (Firebase & WhatsApp)
        try {
            const { sendNotification, sendAdminNotification } = require('../Utils/notification');
            const { sendWhatsAppMessage, sendWapixoTemplate } = require('../Utils/whatsapp');
            const User = require('../Models/User');

            const statusMsgs = {
                'accepted': 'Your order has been accepted and is being prepared. ✅',
                'rejected': 'Sorry, your order has been rejected. ❌',
                'dispatched': 'Your order has been shipped! 🚚',
                'out_for_delivery': 'Your order is out for delivery! 🛵',
                'delivered': 'Your order has been delivered. Enjoy! 🎁',
                'cancelled': 'Your order has been cancelled.'
            };

            const msg = statusMsgs[status] || `Your order status has been updated to ${status}.`;
            const title = status === 'accepted' ? 'Order Confirmed! 🛍️' : `Order ${status.toUpperCase()}!`;

            // 1. Notify Customer (Firebase)
            await sendNotification({
                customerId: order.customerId,
                salonId: order.salonId,
                title,
                message: msg,
                type: 'order',
                actionUrl: `/app/orders/${order._id}`,
                data: { orderId: order._id.toString(), status }
            });

            // 2. Notify Admins (Firebase)
            const populatedOrder = await Order.findById(order._id)
                .populate('customerId', 'name phone')
                .populate('salonId', 'businessName name')
                .populate('outletId', 'name city');

            const clientName = populatedOrder?.customerId?.name || 'Customer';
            const adminMsg = `Order #${order._id.toString().slice(-6).toUpperCase()} for ${clientName} is now ${status.toUpperCase()}.`;
            
            await sendAdminNotification({
                salonId: order.salonId,
                title: `Order Update: ${status.toUpperCase()}`,
                message: adminMsg,
                type: 'order',
                actionUrl: `/admin/shop-orders`,
                data: { orderId: order._id.toString(), status }
            });

            // 3. WhatsApp Notifications
            if (populatedOrder) {
                const brandName = populatedOrder.salonId?.businessName || populatedOrder.salonId?.name || 'Our Salon';
                
                // WhatsApp to Customer
                if (populatedOrder.customerId?.phone) {
                    if (status === 'accepted' && process.env.WHATSAPP_TEMPLATE_PRODUCT_BUY) {
                        const orderIdDisplay = populatedOrder._id.toString().slice(-6).toUpperCase();
                        await sendWapixoTemplate(populatedOrder.customerId.phone, process.env.WHATSAPP_TEMPLATE_PRODUCT_BUY, [
                            clientName, brandName, orderIdDisplay, `${populatedOrder.items.length} Items`,
                            `₹${populatedOrder.totalAmount}`, populatedOrder.paymentMethod.toUpperCase(),
                            populatedOrder.outletId?.name || 'Our Outlet', new Date().toLocaleDateString()
                        ]);
                    } else {
                        await sendWhatsAppMessage(populatedOrder.customerId.phone, `Hi ${clientName}, your order from ${brandName} is now ${status.toUpperCase()}. ${statusMsgs[status] || ''}`);
                    }
                }

                /* 
                // Removed WhatsApp to Admins as per request (Firebase Only)
                const admins = await User.find({ salonId: order.salonId, role: 'admin', status: 'active' });
                for (const ad of admins) {
                    if (ad.phone) {
                        await sendWhatsAppMessage(ad.phone, `Admin Alert: ${adminMsg}`);
                    }
                }
                */
            }
        } catch (notifErr) {
            console.error('Unified Order Notification failed:', notifErr.message);
        }

        res.json({
            success: true,
            data: order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Cancel order (Customer)
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Security check
        if (order.customerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Condition check: Only allow if not out_for_delivery or delivered
        const restrictedStatuses = ['out_for_delivery', 'delivered', 'cancelled', 'rejected'];
        if (restrictedStatuses.includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Order cannot be cancelled when status is ${order.status}` 
            });
        }

        // If prepaid (wallet), refund to wallet
        if (order.paymentStatus === 'paid' && order.paymentMethod === 'wallet') {
            const customer = await Customer.findById(order.customerId);
            if (customer) {
                customer.walletBalance = (customer.walletBalance || 0) + order.totalAmount;
                await customer.save();

                await WalletTransaction.create({
                    customerId: order.customerId,
                    salonId: order.salonId,
                    amount: order.totalAmount,
                    type: 'CREDIT',
                    description: `Refund for cancelled order #${order._id.toString().slice(-6)}`,
                    status: 'COMPLETED'
                });
            }
        }

        order.status = 'cancelled';
        order.cancellationReason = reason;
        order.timeline.push({
            status: 'cancelled',
            note: reason || 'Cancelled by customer',
            timestamp: new Date()
        });

        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
