const Invoice = require('../Models/Invoice');
const Product = require('../Models/Product');
const Customer = require('../Models/Customer');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const Setting = require('../Models/Setting');

// @desc    Checkout and generate invoice
// @route   POST /api/pos/checkout
// @access  Private
exports.checkout = async (req, res) => {
    try {
        const {
            clientId,
            outletId,
            items,
            tax,
            paymentMethod,
            useLoyaltyPoints = 0,
            useWalletAmount = 0,
            promotionId,
            discount = 0,
            bookingId
        } = req.body;

        const salonId = req.user.salonId;

        // 1. Generate Invoice Number
        const count = await Invoice.countDocuments({ salonId });
        const invoiceNumber = `INV-${salonId.toString().slice(-4).toUpperCase()}-${(count + 1).toString().padStart(5, '0')}`;

        // 2. Calculate totals and verify items
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.price * item.quantity;

            // If product, update stock
            if (item.type === 'product') {
                await Product.findByIdAndUpdate(item.itemId, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        const total = subtotal - discount - useLoyaltyPoints - useWalletAmount + tax;

        // 3. Create Invoice
        const invoice = await Invoice.create({
            invoiceNumber,
            salonId,
            outletId,
            customerId: clientId,
            items,
            subtotal,
            discount,
            tax,
            total,
            paymentMethod,
            loyaltyPointsRedeemed: useLoyaltyPoints,
            walletRedeemed: useWalletAmount,
            bookingId
        });

        // 4. Update Customer Loyalty Points
        const customer = await Customer.findById(clientId);
        if (customer) {
            // Deduct redeemed points
            if (useLoyaltyPoints > 0) {
                customer.loyaltyPoints -= useLoyaltyPoints;
            }

            // Earn new points (Rule from settings)
            const settings = await Setting.findOne();
            const pointsRate = settings?.loyaltySettings?.pointsRate || 100; // 1 point per 100 Rs
            const earnedPoints = Math.floor(total / pointsRate);
            
            customer.loyaltyPoints += earnedPoints;
            customer.walletBalance -= useWalletAmount;

            await customer.save();

            // Log Transaction
            if (earnedPoints > 0) {
                await LoyaltyTransaction.create({
                    customerId: customer._id,
                    salonId,
                    amount: earnedPoints,
                    type: 'EARN',
                    description: `Earned from POS Invoice #${invoiceNumber}`
                });
            }
        }

        res.status(201).json({
            success: true,
            data: invoice
        });

    } catch (err) {
        console.error('POS Checkout Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all invoices for a salon
// @route   GET /api/pos/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const invoices = await Invoice.find({ salonId })
            .populate('customerId', 'name phone email')
            .populate('outletId', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
