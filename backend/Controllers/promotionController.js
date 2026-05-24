const Promotion = require('../Models/Promotion');
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
        const promo = await Promotion.create({ ...req.body, salonId });
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
                mongoose.model('Booking').countDocuments({ clientId: customerId, couponCode: code, status: { $ne: 'cancelled' } }),
                mongoose.model('Order').countDocuments({ customerId: customerId, couponCode: code, status: { $ne: 'cancelled' } }),
                mongoose.model('Invoice').countDocuments({ customerId: customerId, couponCode: code, status: { $ne: 'cancelled' } })
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

            if (promo.type === 'PERCENTAGE') {
                discount = (eligibleSubtotal * promo.value) / 100;
            } else {
                discount = Math.min(promo.value, eligibleSubtotal);
            }
        } else {
            // Fallback to billAmount
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
