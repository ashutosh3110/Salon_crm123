const Promotion = require('../Models/Promotion');
const Booking = require('../Models/Booking');
const Order = require('../Models/Order');
const Invoice = require('../Models/Invoice');
const mongoose = require('mongoose');

exports.getPromotions = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const promos = await Promotion.find({ salonId }).sort({ createdAt: -1 });
        res.json({ success: true, results: promos, data: { results: promos } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getActivePromotions = async (req, res) => {
    try {
        const salonId = req.user?.salonId;
        const now = new Date();
        const query = { isActive: true };
        if (salonId) query.salonId = salonId;
        query.$or = [{ endDate: null }, { endDate: { $gte: now } }];
        const promos = await Promotion.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: promos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createPromotion = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const promo = await Promotion.create({
            ...req.body,
            salonId
        });
        res.status(201).json({ success: true, data: promo });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updatePromotion = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const promo = await Promotion.findOneAndUpdate(
            { _id: req.params.id, salonId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!promo) return res.status(404).json({ success: false, message: 'Promotion not found' });
        res.json({ success: true, data: promo });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deletePromotion = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const promo = await Promotion.findOneAndDelete({ _id: req.params.id, salonId });
        if (!promo) return res.status(404).json({ success: false, message: 'Promotion not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.validateCoupon = async (req, res) => {
    try {
        const { couponCode, outletId, items, billAmount } = req.body;
        const salonId = req.user?.salonId;

        if (!couponCode) {
            return res.status(400).json({ success: false, message: 'Coupon code is required' });
        }

        // Find active coupon
        const now = new Date();
        const query = {
            isActive: true,
            couponCode: couponCode.trim().toUpperCase(),
            activationMode: 'COUPON'
        };
        if (salonId) {
            query.salonId = salonId;
        }

        const promo = await Promotion.findOne(query);
        if (!promo) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        // Validate dates
        if (promo.startDate && new Date(promo.startDate) > now) {
            return res.status(400).json({ success: false, message: 'Coupon is not active yet' });
        }
        if (promo.endDate && new Date(promo.endDate) < now) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        // Validate total usage limit
        if (promo.totalUsageLimit !== undefined && promo.usageCount >= promo.totalUsageLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        // Validate outlet restriction
        if (outletId && promo.outletIds && promo.outletIds.length > 0) {
            const hasOutlet = promo.outletIds.some(id => id.toString() === outletId.toString());
            if (!hasOutlet) {
                return res.status(400).json({ success: false, message: 'Coupon is not valid at this outlet' });
            }
        }

        // Validate usage limit per customer
        const customerId = req.body.customerId || (req.user?.role === 'customer' ? req.user._id : null);
        if (customerId && promo.usageLimitPerCustomer) {
            const code = promo.couponCode;
            const [bookingsCount, ordersCount, invoicesCount] = await Promise.all([
                Booking.countDocuments({ clientId: customerId, couponCode: code, status: { $ne: 'cancelled' } }),
                Order.countDocuments({ customerId: customerId, couponCode: code, status: { $ne: 'cancelled' } }),
                Invoice.countDocuments({ customerId: customerId, couponCode: code, status: { $ne: 'cancelled' } })
            ]);
            const totalCustomerUsage = bookingsCount + ordersCount + invoicesCount;
            if (totalCustomerUsage >= promo.usageLimitPerCustomer) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon code' });
            }
        }

        // Calculate discount
        let discount = 0;
        const appOn = String(promo.applicableOn || 'BOTH').toUpperCase();

        if (items && Array.isArray(items) && items.length > 0) {
            // Scoped calculation based on items list
            let eligibleSubtotal = 0;
            items.forEach(item => {
                const itemType = String(item.type || '').toUpperCase(); // 'SERVICE' or 'PRODUCT'
                const qty = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;

                if (appOn === 'SERVICE' && itemType === 'SERVICE') {
                    eligibleSubtotal += price * qty;
                } else if (appOn === 'PRODUCT' && itemType === 'PRODUCT') {
                    eligibleSubtotal += price * qty;
                } else if (appOn === 'BOTH') {
                    eligibleSubtotal += price * qty;
                }
            });

            if (eligibleSubtotal === 0) {
                if (appOn === 'SERVICE') {
                    return res.status(400).json({ success: false, message: 'This coupon is only applicable on services' });
                } else if (appOn === 'PRODUCT') {
                    return res.status(400).json({ success: false, message: 'This coupon is only applicable on products' });
                }
            }

            if (promo.type === 'PERCENTAGE') {
                discount = (eligibleSubtotal * promo.value) / 100;
            } else {
                discount = Math.min(promo.value, eligibleSubtotal);
            }
        } else {
            // Fallback to billAmount (Service booking context)
            if (appOn === 'PRODUCT') {
                return res.status(400).json({ success: false, message: 'This coupon is only applicable on products' });
            }
            const amount = Number(billAmount) || 0;
            if (promo.type === 'PERCENTAGE') {
                discount = (amount * promo.value) / 100;
            } else {
                discount = Math.min(promo.value, amount);
            }
        }

        res.json({
            success: true,
            data: {
                discount: Math.round(discount * 100) / 100,
                promotion: promo
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.sharePromotionWhatsApp = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerId } = req.body;
        const salonId = req.user.salonId;

        const Customer = require('../Models/Customer');
        const Salon = require('../Models/Salon');
        const { sendWhatsAppMessage, checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');

        // 1. Fetch promotion
        const promo = await Promotion.findOne({ _id: id, salonId });
        if (!promo) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        // 2. Fetch customer
        const customer = await Customer.findOne({ _id: customerId, salonId });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // 3. Fetch salon
        const salon = await Salon.findById(salonId);
        const salonName = salon?.businessName || salon?.name || 'Our Salon';

        // 4. Deduct WhatsApp credit
        const creditOutletId = req.user.outletId || customer.lastOutletId || salonId;
        const canSend = await checkAndDeductWhatsAppCredit(creditOutletId);
        if (!canSend) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient WhatsApp credits or WhatsApp notifications disabled for your salon.'
            });
        }

        // 5. Build message content
        const discountText = promo.type === 'PERCENTAGE' ? `${promo.value}% OFF` : `₹${promo.value} OFF`;
        const applicableText = promo.applicableOn === 'SERVICE' ? 'Services' : (promo.applicableOn === 'PRODUCT' ? 'Products' : 'Services & Products');
        const validityText = promo.endDate ? new Date(promo.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unlimited';

        let message = `Hi ${customer.name},\n\n🎉 Exclusive offer for you from *${salonName}*!\n\n*${promo.name}*\n✨ Discount: *${discountText}*\n`;
        
        if (promo.activationMode === 'COUPON' && promo.couponCode) {
            message += `🎫 Use Coupon Code: *${promo.couponCode}*\n`;
        } else {
            message += `✨ (Applied automatically on your next bill)\n`;
        }

        message += `\n📅 Applies to: ${applicableText}\n📅 Valid until: ${validityText}\n\nWe look forward to serving you!`;

        // 6. Send message
        const sendResult = await sendWhatsAppMessage(customer.phone, message);

        if (!sendResult.success) {
            return res.status(400).json({
                success: false,
                message: sendResult.message || 'Failed to send WhatsApp message via API.'
            });
        }

        res.json({ success: true, message: 'Promotion shared successfully on WhatsApp!' });
    } catch (err) {
        console.error('[PromotionController] sharePromotionWhatsApp error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};
