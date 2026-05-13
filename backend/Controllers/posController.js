const Invoice = require('../Models/Invoice');
const Product = require('../Models/Product');
const Customer = require('../Models/Customer');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const Setting = require('../Models/Setting');
const { sendWapixoTemplate } = require('../Utils/whatsapp');
const Salon = require('../Models/Salon');

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
            payments = [], // Array of { method, amount, transactionId }
            useLoyaltyPoints = 0,
            useWalletAmount = 0,
            promotionId,
            discount = 0,
            bookingId,
            orderId
        } = req.body;

        const salonId = req.user.salonId;

        // 1. Generate Invoice Number (atomic to prevent duplicate numbers)
        const Salon = require('../Models/Salon');
        const salonDoc = await Salon.findByIdAndUpdate(
            salonId,
            { $inc: { invoiceCounter: 1 } },
            { new: true, upsert: false }
        );
        const seq = salonDoc?.invoiceCounter || Date.now();
        const invoiceNumber = `INV-${salonId.toString().slice(-4).toUpperCase()}-${String(seq).padStart(5, '0')}`;

        // 2. Calculate totals and verify items
        let subtotal = 0;
        for (const item of items) {
            subtotal += (item.price || 0) * (item.quantity || 1);

            // If product, update stock
            if (item.type === 'product' && item.itemId) {
                try {
                    const product = await Product.findById(item.itemId);
                    if (product) {
                        const qty = Number(item.quantity) || 1;
                        product.stock = (product.stock || 0) - qty;
                        
                        if (outletId) {
                            const outletKey = outletId.toString();
                            const currentOutletStock = product.stockByOutlet.get(outletKey) || 0;
                            product.stockByOutlet.set(outletKey, Math.max(0, currentOutletStock - qty));
                        }
                        await product.save();
                    }
                } catch (invErr) {
                    console.error('[POS-Inventory] Sync Error:', invErr.message);
                }
            }
        }

        const total = Math.max(0, subtotal - discount - useLoyaltyPoints - useWalletAmount + tax);
        
        // Calculate paid amount from split payments
        const paidAmount = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const dueAmount = Math.max(0, total - paidAmount);

        // 3. Calculate loyalty points (Rule from settings)
        const settings = await Setting.findOne();
        const pointsRate = settings?.loyaltySettings?.pointsRate || 100;
        const earnedPoints = Math.floor(total / pointsRate);

        // 4. Create Invoice
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
            payments,
            dueAmount,
            paymentStatus: dueAmount > 0 ? (paidAmount > 0 ? 'partially_paid' : 'pending') : 'paid',
            loyaltyPointsRedeemed: useLoyaltyPoints,
            loyaltyPointsEarned: earnedPoints,
            walletRedeemed: useWalletAmount,
            bookingId,
            orderId
        });

        // 5. Update Customer Profile
        const customer = await Customer.findById(clientId);
        if (customer) {
            // Deduct redeemed
            customer.loyaltyPoints = (customer.loyaltyPoints || 0) - useLoyaltyPoints;
            customer.walletBalance = (customer.walletBalance || 0) - useWalletAmount;
            
            // Add earned and update debt
            customer.loyaltyPoints += earnedPoints;
            customer.dueAmount = (customer.dueAmount || 0) + dueAmount;
            
            // Stats
            customer.totalVisits = (customer.totalVisits || 0) + 1;
            customer.totalSpend = (customer.totalSpend || 0) + total;
            customer.lastVisit = new Date();
            customer.lastOutletId = outletId;

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

        // Send Product Purchase WhatsApp Message (if items contain products)
        try {
            const hasProducts = items.some(item => item.type === 'product');
            if (hasProducts && customer) {
                const salon = await Salon.findById(salonId);
                const brandName = salon?.businessName || salon?.name || 'Our Salon';
                const firstProduct = items.find(item => item.type === 'product');
                const productNames = items.filter(item => item.type === 'product').map(i => i.name).join(', ');
                const totalQty = items.filter(item => item.type === 'product').reduce((acc, i) => acc + i.quantity, 0);

                await sendWapixoTemplate(
                    customer.phone,
                    process.env.WHATSAPP_TEMPLATE_PRODUCT_BUY,
                    [
                        customer.name,
                        brandName,
                        productNames.length > 30 ? productNames.substring(0, 27) + '...' : productNames,
                        String(totalQty),
                        `₹${firstProduct.price}`,
                        `₹${discount || 0}`,
                        paymentMethod,
                        `₹${total}`
                    ]
                );
            }
        } catch (wsErr) {
            console.error('Product Purchase WhatsApp failed:', wsErr.message);
        }

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
        const { outletId } = req.query;
        
        const query = { salonId };
        if (outletId) query.outletId = outletId;

        const invoices = await Invoice.find(query)
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

// @desc    Get dashboard stats for POS
// @route   GET /api/pos/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { outletId } = req.query;
        
        // Define Today's range in IST (+5:30)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const todayStart = new Date(now.getTime() + istOffset);
        todayStart.setUTCHours(0, 0, 0, 0);
        const startOfDay = new Date(todayStart.getTime() - istOffset);
        
        const todayEnd = new Date(now.getTime() + istOffset);
        todayEnd.setUTCHours(23, 59, 59, 999);
        const endOfDay = new Date(todayEnd.getTime() - istOffset);

        const statsQuery = { 
            salonId, 
            createdAt: { $gte: startOfDay, $lte: endOfDay } 
        };
        if (outletId) statsQuery.outletId = outletId;

        const recentQuery = { salonId };
        if (outletId) recentQuery.outletId = outletId;

        const [todayInvoices, allRecentInvoices] = await Promise.all([
            Invoice.find(statsQuery),
            Invoice.find(recentQuery)
                .populate('customerId', 'name phone')
                .populate('outletId', 'name')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const revenue = todayInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const count = todayInvoices.length;
        const avgBill = count > 0 ? Math.round(revenue / count) : 0;
        const unpaidCount = todayInvoices.filter(i => (i.paymentStatus || '').toLowerCase() !== 'paid').length;

        const breakdown = { cash: 0, card: 0, upi: 0, unpaid: 0 };
        todayInvoices.forEach(inv => {
            const amount = inv.total || 0;
            if ((inv.paymentStatus || '').toLowerCase() !== 'paid') {
                breakdown.unpaid += amount;
                return;
            }
            
            const method = (inv.paymentMethod || inv.payments?.[0]?.method || 'cash').toLowerCase();
            if (method === 'cash') breakdown.cash += amount;
            else if (method === 'card') breakdown.card += amount;
            else if (method === 'upi' || method === 'online') breakdown.upi += amount;
            else breakdown.cash += amount;
        });

        const recentInvoices = allRecentInvoices.map(inv => ({
            ...inv.toObject(),
            clientId: inv.customerId, // Map for frontend compatibility
            clientName: inv.customerId?.name || 'Guest'
        }));

        res.json({
            success: true,
            data: {
                stats: {
                    revenue,
                    count,
                    avgBill,
                    unpaidCount
                },
                breakdown: [
                    { name: 'Cash', value: breakdown.cash, color: '#10b981' },
                    { name: 'Card', value: breakdown.card, color: '#3b82f6' },
                    { name: 'UPI', value: breakdown.upi, color: '#8b5cf6' },
                    { name: 'Unpaid', value: breakdown.unpaid, color: '#f59e0b' },
                ],
                recentInvoices
            }
        });

    } catch (err) {
        console.error('POS Dashboard Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
