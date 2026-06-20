const MembershipPlan = require('../Models/MembershipPlan');
const { sendWapixoTemplate } = require('../Utils/whatsapp');
const Salon = require('../Models/Salon');
const CustomerMembership = require('../Models/CustomerMembership');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Setting = require('../Models/Setting');
const Invoice = require('../Models/Invoice');
const Outlet = require('../Models/Outlet');

// Helper to create invoice on membership purchase
const createMembershipInvoice = async ({ salonId, customerId, plan, outletId, paymentMethod, paymentId, isPaid }) => {
    try {
        let selectedOutletId = outletId;
        if (!selectedOutletId) {
            const defaultOutlet = await Outlet.findOne({ salonId });
            if (defaultOutlet) {
                selectedOutletId = defaultOutlet._id;
            }
        }
        if (!selectedOutletId) {
            console.error('No outlet found for creating membership invoice');
            return null;
        }

        const basePrice = Number(plan.price || 0);
        const taxRate = Number(plan.taxRate || 0);
        let calculatedBase = 0;
        let calculatedTax = 0;
        let calculatedTotal = 0;

        if (plan.taxType === 'including') {
            calculatedTotal = basePrice;
            calculatedBase = basePrice / (1 + taxRate / 100);
            calculatedTax = calculatedTotal - calculatedBase;
        } else {
            calculatedBase = basePrice;
            calculatedTax = basePrice * (taxRate / 100);
            calculatedTotal = basePrice + calculatedTax;
        }

        // Generate Invoice Number
        const salonDoc = await Salon.findByIdAndUpdate(
            salonId,
            { $inc: { invoiceCounter: 1 } },
            { new: true }
        );
        const seq = salonDoc?.invoiceCounter || Date.now();
        const invoiceNumber = `INV-${salonId.toString().slice(-4).toUpperCase()}-${String(seq).padStart(5, '0')}`;

        const invoiceItems = [{
            type: 'service',
            itemId: plan._id,
            name: `${plan.name} Membership Plan`,
            price: Number(calculatedBase.toFixed(2)),
            quantity: 1,
            isInclusiveTax: plan.taxType === 'including',
            gstPercent: taxRate
        }];

        const newInvoice = await Invoice.create({
            invoiceNumber,
            salonId,
            outletId: selectedOutletId,
            customerId,
            items: invoiceItems,
            subtotal: Number(calculatedBase.toFixed(2)),
            discount: 0,
            membershipDiscount: 0,
            tax: Number(calculatedTax.toFixed(2)),
            gstPercent: taxRate,
            serviceGstPercent: taxRate,
            includingGst: plan.taxType === 'including',
            baseAmount: Number(calculatedBase.toFixed(2)),
            gstAmount: Number(calculatedTax.toFixed(2)),
            cgst: Number((calculatedTax / 2).toFixed(2)),
            sgst: Number((calculatedTax / 2).toFixed(2)),
            total: Number(calculatedTotal.toFixed(2)),
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: isPaid ? 'paid' : 'pending',
            payments: isPaid ? [{
                method: paymentMethod || 'cash',
                amount: Number(calculatedTotal.toFixed(2)),
                transactionId: paymentId,
                date: new Date()
            }] : [],
            dueAmount: isPaid ? 0 : Number(calculatedTotal.toFixed(2))
        });

        return newInvoice;
    } catch (err) {
        console.error('Error in createMembershipInvoice helper:', err);
        return null;
    }
};

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } catch (e) {
        console.error('Razorpay Init Error:', e);
    }
} else {
    console.warn('Razorpay keys are missing in membershipPlanController.');
}


// @desc    Get all membership plans for a salon
// @route   GET /api/membership-plans
// @access  Public/Private
exports.getMembershipPlans = async (req, res) => {
    try {
        let salonId = req.user?.salonId || req.query.salonId;
        
        const query = {};
        if (salonId) query.salonId = salonId;
        
        // If public route, only show active plans
        if (!req.user) {
            query.isActive = true;
        }

        const plans = await MembershipPlan.find(query).populate('outletIds', 'name');

        res.status(200).json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single membership plan
// @route   GET /api/membership-plans/:id
// @access  Private
exports.getMembershipPlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create new membership plan
// @route   POST /api/membership-plans
// @access  Private (Admin/Manager)
exports.createMembershipPlan = async (req, res) => {
    try {
        req.body.salonId = req.user.salonId;
        
        const plan = await MembershipPlan.create(req.body);

        res.status(201).json({
            success: true,
            data: plan
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update membership plan
// @route   PATCH /api/membership-plans/:id
// @access  Private (Admin/Manager)
exports.updateMembershipPlan = async (req, res) => {
    try {
        let plan = await MembershipPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Make sure user owns plan
        if (plan.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this plan'
            });
        }

        plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete membership plan
// @route   DELETE /api/membership-plans/:id
// @access  Private (Admin/Manager)
exports.deleteMembershipPlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Make sure user owns plan
        if (plan.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this plan'
            });
        }

        await plan.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create Razorpay order for membership
// @route   POST /api/loyalty/membership/order
// @access  Private (Customer)
exports.createMembershipOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        console.log('Creating Membership Order for planId:', planId);

        const plan = await MembershipPlan.findById(planId);
        if (!plan) {
            console.error('Plan not found:', planId);
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        const globalSettings = await Setting.findOne();
        const sGst = globalSettings?.serviceGst || 18;
        const taxAmount = Math.round(plan.price * (sGst / 100));
        const totalWithTax = plan.price + taxAmount;

        const options = {
            amount: Math.round(totalWithTax * 100), // in paise
            currency: 'INR',
            receipt: `mem_${req.user._id.toString().slice(-14)}_${Date.now().toString().slice(-10)}`
        };

        if (!razorpay) {
            console.error('Razorpay instance is missing');
            return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
        }

        console.log('Calling Razorpay API with options:', options);
        const order = await razorpay.orders.create(options);
        
        console.log('Razorpay Order Created:', order.id);
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (err) {
        console.error('Membership Order Exception:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message || 'Fatal error during order creation',
            error: process.env.NODE_ENV === 'development' ? err : undefined
        });
    }
};

// @desc    Verify membership payment and activate
// @route   POST /api/loyalty/membership/verify
// @access  Private (Customer)
exports.verifyMembershipPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET')
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const plan = await MembershipPlan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        // Calculate expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.duration || 30));

        const Customer = require('../Models/Customer');
        const customer = await Customer.findById(req.user._id);

        const invoice = await createMembershipInvoice({
            salonId: plan.salonId,
            customerId: req.user._id,
            plan,
            outletId: customer?.lastOutletId || null,
            paymentMethod: 'online',
            paymentId: razorpay_payment_id,
            isPaid: true
        });

        // Create or Update membership
        const membership = await CustomerMembership.findOneAndUpdate(
            { customerId: req.user._id, salonId: plan.salonId },
            {
                planId,
                status: 'active',
                expiryDate,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                invoiceId: invoice?._id || null,
                amount: invoice?.total || plan.price
            },
            { upsert: true, new: true }
        );

        // Send Membership WhatsApp Message
        try {
            const customer = await Customer.findById(req.user._id);
            const salon = await Salon.findById(plan.salonId);
            const brandName = salon?.businessName || salon?.name || 'Our Salon';
            
            const { checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
            const canSendMem = await checkAndDeductWhatsAppCredit(customer.lastOutletId || plan.salonId);

            if (canSendMem) {
                await sendWapixoTemplate(
                    customer.phone,
                    process.env.WHATSAPP_TEMPLATE_MEMBERSHIP_PLAN,
                    [
                        customer.name,
                        brandName,
                        plan.name,
                        `${plan.serviceDiscountValue}${plan.serviceDiscountType === 'percentage' ? '%' : ' Rs'}`,
                        `${plan.productDiscountValue}${plan.productDiscountType === 'percentage' ? '%' : ' Rs'}`,
                        new Date().toLocaleDateString(),
                        expiryDate.toLocaleDateString()
                    ]
                );
            }
        } catch (wsErr) {
            console.error('Membership WhatsApp failed:', wsErr.message);
        }

        // Send Push Notification
        try {
            const { sendNotification, sendAdminNotification } = require('../Utils/notification');
            const { sendWhatsAppMessage } = require('../Utils/whatsapp');
            const User = require('../Models/User');
            const customer = await Customer.findById(req.user._id);
            const salon = await Salon.findById(plan.salonId);

            await sendNotification({
                customerId: req.user._id,
                salonId: plan.salonId,
                title: 'Membership Activated! 🎖️',
                message: `Hi ${customer.name}, your ${plan.name} membership is now active until ${expiryDate.toLocaleDateString()}. Enjoy your benefits!`,
                type: 'membership',
                actionUrl: '/app/membership'
            });

            // Admin Notifications
            const adminTitle = 'New Membership Purchased! 🎖️';
            const adminMsg = `New ${plan.name} membership purchased by ${customer.name} for ₹${plan.price}.`;

            await sendAdminNotification({
                salonId: plan.salonId,
                title: adminTitle,
                message: adminMsg,
                type: 'membership',
                actionUrl: '/admin/memberships'
            });

            // WhatsApp to Admins
            const canSendMemAdm = await checkAndDeductWhatsAppCredit(customer.lastOutletId);
            if (canSendMemAdm) {
                const admins = await User.find({ salonId: plan.salonId, role: 'admin', status: 'active' });
                for (const ad of admins) {
                    if (ad.phone) {
                        await sendWhatsAppMessage(ad.phone, `Admin Alert: ${adminMsg}`);
                    }
                }
            }
        } catch (pushErr) {
            console.error('Membership Notification failed:', pushErr.message);
        }

        res.json({ success: true, data: membership });
    } catch (err) {
        console.error('Membership Verify Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const WalletTransaction = require('../Models/WalletTransaction');
const Customer = require('../Models/Customer');


// @desc    Get active membership for customer
// @route   GET /api/loyalty/membership/active
// @access  Private (Customer)
exports.getActiveMembership = async (req, res) => {
    try {
        let customerId = req.user._id;

        // Allow admins/staff to check membership for a specific customer
        if (req.query.customerId && ['admin', 'manager', 'superadmin', 'staff', 'receptionist'].includes(req.user.role)) {
            customerId = req.query.customerId;
        }

        const membership = await CustomerMembership.findOne({
            customerId,
            status: 'active',
            expiryDate: { $gt: new Date() }
        }).populate('planId');

        res.json({ success: true, data: membership });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Buy membership using wallet balance
// @route   POST /api/loyalty/membership/wallet-pay
// @access  Private (Customer)
exports.buyMembershipWithWallet = async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await MembershipPlan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const customer = await Customer.findById(req.user.id || req.user._id);
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const globalSettings = await Setting.findOne();
        const sGst = globalSettings?.serviceGst || 18;
        const taxAmount = Math.round(Number(plan.price) * (sGst / 100));
        const totalWithTax = Number(plan.price) + taxAmount;

        if ((customer.walletBalance || 0) < totalWithTax) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        // Deduct balance
        customer.walletBalance -= totalWithTax;
        await customer.save();

        // Create wallet transaction
        await WalletTransaction.create({
            customerId: req.user._id,
            salonId: plan.salonId,
            amount: totalWithTax,
            type: 'DEBIT',
            description: `Membership Purchase: ${plan.name} (Inc. GST)`,
            status: 'COMPLETED'
        });

        const invoice = await createMembershipInvoice({
            salonId: plan.salonId,
            customerId: req.user._id,
            plan,
            outletId: customer.lastOutletId || null,
            paymentMethod: 'wallet',
            paymentId: `wallet_${Date.now()}`,
            isPaid: true
        });

        // Activate membership
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.duration || 30));

        const membership = await CustomerMembership.findOneAndUpdate(
            { customerId: req.user._id, salonId: plan.salonId },
            {
                planId,
                status: 'active',
                expiryDate,
                amount: invoice?.total || totalWithTax,
                paymentId: `wallet_${Date.now()}`,
                invoiceId: invoice?._id || null
            },
            { upsert: true, new: true }
        );

        // Send Membership WhatsApp Message
        try {
            const salon = await Salon.findById(plan.salonId);
            const brandName = salon?.businessName || salon?.name || 'Our Salon';
            
            const { checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
            const canSendMemWallet = await checkAndDeductWhatsAppCredit(customer.lastOutletId || plan.salonId);

            if (canSendMemWallet) {
                await sendWapixoTemplate(
                    customer.phone,
                    process.env.WHATSAPP_TEMPLATE_MEMBERSHIP_PLAN,
                    [
                        customer.name,
                        brandName,
                        plan.name,
                        `${plan.serviceDiscountValue}${plan.serviceDiscountType === 'percentage' ? '%' : ' Rs'}`,
                        `${plan.productDiscountValue}${plan.productDiscountType === 'percentage' ? '%' : ' Rs'}`,
                        new Date().toLocaleDateString(),
                        expiryDate.toLocaleDateString()
                    ]
                );
            }
        } catch (wsErr) {
            console.error('Membership WhatsApp failed:', wsErr.message);
        }

        // Send Push Notification
        try {
            const { sendNotification, sendAdminNotification } = require('../Utils/notification');
            const { sendWhatsAppMessage } = require('../Utils/whatsapp');
            const User = require('../Models/User');
            const salon = await Salon.findById(plan.salonId);
            const brandName = salon?.businessName || salon?.name || 'Our Salon';

            await sendNotification({
                customerId: req.user._id,
                salonId: plan.salonId,
                title: 'Membership Activated! 🎖️',
                message: `Hi ${customer.name}, your ${plan.name} membership is now active until ${expiryDate.toLocaleDateString()}. Enjoy your benefits!`,
                type: 'membership',
                actionUrl: '/app/membership'
            });

            // Admin Notifications
            const adminTitle = 'New Membership Purchased! 🎖️';
            const adminMsg = `New ${plan.name} membership purchased by ${customer.name} using wallet balance.`;

            await sendAdminNotification({
                salonId: plan.salonId,
                title: adminTitle,
                message: adminMsg,
                type: 'membership',
                actionUrl: '/admin/memberships'
            });

            // WhatsApp to Admins
            const canSendMemWalletAdm = await checkAndDeductWhatsAppCredit(customer.lastOutletId);
            if (canSendMemWalletAdm) {
                const admins = await User.find({ salonId: plan.salonId, role: 'admin', status: 'active' });
                for (const ad of admins) {
                    if (ad.phone) {
                        await sendWhatsAppMessage(ad.phone, `Admin Alert: ${adminMsg}`);
                    }
                }
            }
        } catch (pushErr) {
            console.error('Membership Notification failed:', pushErr.message);
        }

        res.json({ success: true, data: membership });
    } catch (err) {
        console.error('Membership Wallet Pay Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Assign membership plan to a customer directly by admin
// @route   POST /api/loyalty/membership/assign
// @access  Private (Admin/Manager)
exports.assignMembershipDirect = async (req, res) => {
    try {
        const { customerId, planId, outletId, paymentMethod = 'cash' } = req.body;
        const salonId = req.user.salonId;

        if (!customerId || !planId) {
            return res.status(400).json({ success: false, message: 'Please provide customerId and planId' });
        }

        const plan = await MembershipPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Membership plan not found' });
        }

        const Customer = require('../Models/Customer');
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Create the invoice
        const invoice = await createMembershipInvoice({
            salonId,
            customerId,
            plan,
            outletId,
            paymentMethod,
            paymentId: `admin_assigned_${Date.now()}`,
            isPaid: paymentMethod !== 'unpaid'
        });

        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.duration || 30));

        // Create or Update membership
        const membership = await CustomerMembership.findOneAndUpdate(
            { customerId, salonId },
            {
                planId,
                status: 'active',
                expiryDate,
                amount: invoice?.total || plan.price,
                paymentId: `admin_assigned_${Date.now()}`,
                invoiceId: invoice?._id || null
            },
            { upsert: true, new: true }
        );

        // Update Customer Stats
        customer.totalVisits = (customer.totalVisits || 0) + 1;
        customer.totalSpend = (customer.totalSpend || 0) + (invoice?.total || plan.price);
        customer.lastVisit = new Date();
        if (outletId) {
            customer.lastOutletId = outletId;
        }
        if (paymentMethod === 'unpaid') {
            customer.dueAmount = (customer.dueAmount || 0) + (invoice?.total || plan.price);
        }
        await customer.save();

        // Send Push Notification & WhatsApp to customer
        try {
            const { sendNotification } = require('../Utils/notification');
            const { sendWapixoTemplate } = require('../Utils/whatsapp');
            const Salon = require('../Models/Salon');
            const salon = await Salon.findById(salonId);
            const brandName = salon?.businessName || salon?.name || 'Our Salon';

            await sendNotification({
                customerId,
                salonId,
                title: 'Membership Activated! 🎖️',
                message: `Hi ${customer.name}, your ${plan.name} membership has been activated by ${req.user.name || 'Admin'} until ${expiryDate.toLocaleDateString()}. Enjoy your benefits!`,
                type: 'membership',
                actionUrl: '/app/membership'
            });

            // Send WhatsApp
            const { checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
            const canSendMem = await checkAndDeductWhatsAppCredit(customer.lastOutletId || salonId);

            if (canSendMem) {
                await sendWapixoTemplate(
                    customer.phone,
                    process.env.WHATSAPP_TEMPLATE_MEMBERSHIP_PLAN,
                    [
                        customer.name,
                        brandName,
                        plan.name,
                        `${plan.serviceDiscountValue}${plan.serviceDiscountType === 'percentage' ? '%' : ' Rs'}`,
                        `${plan.productDiscountValue}${plan.productDiscountType === 'percentage' ? '%' : ' Rs'}`,
                        new Date().toLocaleDateString(),
                        expiryDate.toLocaleDateString()
                    ]
                );
            }
        } catch (msgErr) {
            console.error('Admin assignment messaging failed:', msgErr.message);
        }

        res.json({
            success: true,
            message: 'Membership plan assigned successfully',
            data: membership
        });

    } catch (err) {
        console.error('Assign membership direct error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
