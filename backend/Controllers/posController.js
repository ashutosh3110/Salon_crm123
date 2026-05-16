const Invoice = require('../Models/Invoice');
const Product = require('../Models/Product');
const Customer = require('../Models/Customer');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const Setting = require('../Models/Setting');
const { sendWapixoTemplate } = require('../Utils/whatsapp');
const { spendWallet } = require('../Utils/walletHelper');
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
            gstPercent,
            includingGst = false,
            baseAmount,
            gstAmount,
            cgst,
            sgst,
            subtotal: reqSubtotal,
            payments = [], // Array of { method, amount, transactionId }
            useLoyaltyPoints = 0,
            useWalletAmount = 0,
            promotionId,
            discount = 0,
            membershipDiscount = 0,
            previousDueCollected = 0,
            bookingId,
            orderId
        } = req.body;

        const salonId = req.user.salonId;

        // 1. Generate Invoice Number (atomic to prevent duplicate numbers)
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

        const finalSubtotal = reqSubtotal || subtotal;
        const total = Math.max(0, finalSubtotal - discount - (Number(membershipDiscount) || 0) - useLoyaltyPoints + tax);

        // Calculate paid amount from split payments
        const paidAmount = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        // previousDueCollected is a separate field for money taken for old dues
        // The current invoice due is just the total minus what was paid for this transaction
        const dueAmount = Math.max(0, total - useWalletAmount - paidAmount);

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
            subtotal: finalSubtotal,
            discount,
            membershipDiscount: (Number(membershipDiscount) || 0),
            tax,
            gstPercent,
            includingGst,
            baseAmount,
            gstAmount,
            cgst,
            sgst,
            total,
            payments,
            dueAmount,
            paymentStatus: dueAmount > 0 ? (paidAmount + useWalletAmount > 0 ? 'partially_paid' : 'pending') : 'paid',
            loyaltyPointsRedeemed: useLoyaltyPoints,
            loyaltyPointsEarned: earnedPoints,
            walletRedeemed: useWalletAmount,
            previousDueCollected: (Number(previousDueCollected) || 0) > 0 ? Number(previousDueCollected) : Math.max(0, (paidAmount + useWalletAmount) - total),
            bookingId,
            orderId
        });

        // 5. Update Customer Profile
        const customer = await Customer.findById(clientId);
        if (customer) {
            customer.loyaltyPoints = (customer.loyaltyPoints || 0) - useLoyaltyPoints + earnedPoints;
            
            // Use wallet helper to spend balance if applicable
            if (useWalletAmount > 0) {
                await spendWallet(clientId, useWalletAmount, `Payment for POS Invoice #${invoiceNumber}`);
            }

            const totalReceived = (Number(useWalletAmount) || 0) + (Number(paidAmount) || 0);
            const collectedPrev = Number(previousDueCollected) || 0;
            
            // New due amount = (Existing Due + Current Bill) - (All money received today)
            customer.dueAmount = Math.max(0, (customer.dueAmount || 0) + total - totalReceived);
            
            customer.totalVisits = (customer.totalVisits || 0) + 1;
            customer.totalSpend = (customer.totalSpend || 0) + total;
            customer.lastVisit = new Date();
            customer.lastOutletId = outletId;

            await customer.save();

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

        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate('customerId', 'name phone email')
            .populate('outletId', 'name')
            .populate('items.stylistIds', 'name');

        res.status(201).json({ success: true, data: populatedInvoice });

        // Send WhatsApp Message for product purchase
        try {
            const hasProducts = items.some(item => item.type === 'product');
            if (hasProducts && customer) {
                const { checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
                const canSend = await checkAndDeductWhatsAppCredit(outletId || salonId);
                if (canSend) {
                    const salon = await Salon.findById(salonId);
                    const brandName = salon?.businessName || salon?.name || 'Our Salon';
                    const productNames = items.filter(item => item.type === 'product').map(i => i.name).join(', ');
                    const totalQty = items.filter(item => item.type === 'product').reduce((acc, i) => acc + i.quantity, 0);

                    await sendWapixoTemplate(
                        customer.phone,
                        process.env.WHATSAPP_TEMPLATE_PRODUCT_BUY || 'product_buy',
                        [
                            customer.name,
                            brandName,
                            productNames.length > 30 ? productNames.substring(0, 27) + '...' : productNames,
                            String(totalQty),
                            `₹${items.find(i => i.type === 'product').price}`,
                            `₹${discount || 0}`,
                            payments[0]?.method?.toUpperCase() || 'CASH',
                            `₹${total}`
                        ]
                    );
                }
            }
        } catch (wsErr) {
            console.error('WhatsApp failed:', wsErr.message);
        }
    } catch (err) {
        console.error('POS Checkout Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all invoices for a salon
exports.getInvoices = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { outletId } = req.query;
        const query = { salonId };
        if (outletId) query.outletId = outletId;

        const invoices = await Invoice.find(query)
            .populate('customerId', 'name phone email')
            .populate('outletId', 'name')
            .populate('items.stylistIds', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: invoices.length, data: invoices });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get dashboard stats
exports.getDashboard = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { outletId } = req.query;

        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const todayStart = new Date(now.getTime() + istOffset);
        todayStart.setUTCHours(0, 0, 0, 0);
        const startOfDay = new Date(todayStart.getTime() - istOffset);

        const todayEnd = new Date(now.getTime() + istOffset);
        todayEnd.setUTCHours(23, 59, 59, 999);
        const endOfDay = new Date(todayEnd.getTime() - istOffset);

        const statsQuery = { salonId, createdAt: { $gte: startOfDay, $lte: endOfDay } };
        if (outletId) statsQuery.outletId = outletId;

        const [todayInvoices, allRecentInvoices] = await Promise.all([
            Invoice.find(statsQuery),
            Invoice.find({ salonId, ...(outletId && { outletId }) })
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
            } else {
                const method = (inv.paymentMethod || inv.payments?.[0]?.method || 'cash').toLowerCase();
                if (method === 'cash') breakdown.cash += amount;
                else if (method === 'upi' || method === 'online') breakdown.upi += amount;
                else breakdown.cash += amount;
            }
        });

        res.json({
            success: true,
            data: {
                stats: { revenue, count, avgBill, unpaidCount },
                breakdown: [
                    { name: 'Cash', value: breakdown.cash, color: '#10b981' },
                    { name: 'UPI', value: breakdown.upi, color: '#8b5cf6' },
                    { name: 'Unpaid', value: breakdown.unpaid, color: '#f59e0b' },
                ],
                recentInvoices: allRecentInvoices.map(inv => ({
                    ...inv.toObject(),
                    clientId: inv.customerId,
                    clientName: inv.customerId?.name || 'Guest'
                }))
            }
        });
    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send invoice via WhatsApp
exports.sendInvoiceWhatsApp = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id).populate('customerId');
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const phone = invoice.customerId?.phone;
        if (!phone) return res.status(400).json({ success: false, message: 'Customer phone not found' });
        if (!req.file) return res.status(400).json({ success: false, message: 'No PDF file provided' });

        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
        const fileUrl = `${baseUrl}/${req.file.path.replace(/\\/g, '/')}`;

        const { sendWapixoTemplate, checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
        const canSend = await checkAndDeductWhatsAppCredit(invoice.outletId || invoice.salonId);
        if (!canSend) return res.status(400).json({ success: false, message: 'Insufficient credits' });

        const salon = await Salon.findById(invoice.salonId);
        const brandName = salon?.businessName || salon?.name || 'Our Salon';

        const result = await sendWapixoTemplate(
            phone,
            process.env.WHATSAPP_TEMPLATE_INVOICE || 'customer_invoice_template',
            [invoice.customerId?.name || 'Customer', brandName, invoice.invoiceNumber],
            fileUrl
        );

        if (result.success) res.json({ success: true, message: 'WhatsApp sent' });
        else res.status(500).json({ success: false, message: result.message });
    } catch (err) {
        console.error('WhatsApp Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Send invoice via Email
exports.sendInvoiceEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id).populate('customerId');
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const email = invoice.customerId?.email;
        if (!email) return res.status(400).json({ success: false, message: 'Customer email not found' });
        if (!req.file) return res.status(400).json({ success: false, message: 'No PDF file provided' });

        const sendEmail = require('../Utils/sendEmail');
        const salon = await Salon.findById(invoice.salonId);
        const brandName = salon?.businessName || salon?.name || 'Our Salon';

        await sendEmail({
            email,
            subject: `Invoice from ${brandName} - #${invoice.invoiceNumber}`,
            html: `<div style="font-family: sans-serif; padding: 20px;">
                <h2>Invoice #${invoice.invoiceNumber}</h2>
                <p>Dear ${invoice.customerId.name},</p>
                <p>Thank you for visiting ${brandName}. Your invoice is attached.</p>
                <p><strong>Total:</strong> ₹${invoice.total}</p>
            </div>`,
            attachments: [{ filename: `Invoice_${invoice.invoiceNumber}.pdf`, path: req.file.path }]
        });

        res.json({ success: true, message: 'Email sent' });
    } catch (err) {
        console.error('Email Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
