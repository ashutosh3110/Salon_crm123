const Invoice = require('../Models/Invoice');
const Supplier = require('../Models/Supplier');
const SupplierInvoice = require('../Models/SupplierInvoice');
const Expense = require('../Models/Expense');
const PettyCash = require('../Models/PettyCash');
const FinanceTransaction = require('../Models/FinanceTransaction');
const EndOfDay = require('../Models/EndOfDay');
const Booking = require('../Models/Booking');
const Order = require('../Models/Order');

const { sendWhatsAppMessage, checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');

const getAuthorizedOutletId = (req, sourceVal) => {
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
        return req.user.outletId.toString();
    }
    return sourceVal;
};

// ─── SUPPLIER CONTROLLERS ──────────────────────────────────────────────────

exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({ salonId: req.user.salonId });
        res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.upsertSupplier = async (req, res) => {
    try {
        const id = req.params.id || req.body.id;
        const data = { ...req.body };
        delete data.id;
        let supplier;
        if (id) {
            supplier = await Supplier.findByIdAndUpdate(id, data, { new: true });
        } else {
            supplier = await Supplier.create({ ...data, salonId: req.user.salonId });
        }
        res.status(200).json({ success: true, data: supplier });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        await Supplier.findOneAndDelete({ _id: req.params.id, salonId: req.user.salonId });
        res.status(200).json({ success: true, message: 'Supplier removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── EXPENSE CONTROLLERS ────────────────────────────────────────────────────

exports.getExpenses = async (req, res) => {
    try {
        let { startDate, endDate, category, outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        let query = { salonId: req.user.salonId };
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (category && category !== 'All') {
            query.category = category;
        }
        if (outletId && outletId !== 'all') {
            query.outletId = outletId;
        }
        const expenses = await Expense.find(query).populate('outletId', 'name').sort({ date: -1 });
        res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addExpense = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            req.body.outletId = req.user.outletId.toString();
        }
        const expense = await Expense.create({
            ...req.body,
            salonId: req.user.salonId,
            createdBy: req.user._id
        });

        // Add to central ledger
        await FinanceTransaction.create({
            salonId: req.user.salonId,
            outletId: expense.outletId,
            type: 'expense',
            category: 'Operational Expense',
            amount: expense.amount,
            paymentMethod: expense.paymentMethod,
            accountType: expense.paymentMethod === 'cash' || expense.paymentMethod === 'petty_cash' ? 'cash' : 'bank',
            description: `Expense: ${expense.category} - ${expense.description}`,
            referenceId: expense._id,
            referenceType: 'Expense',
            performedBy: req.user._id
        });

        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── PETTY CASH CONTROLLERS ────────────────────────────────────────────────
exports.getPettyCashSummary = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let { outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        const now = new Date();
        const businessDate = now.toISOString().split('T')[0];

        // 1. Current Balance
        const transQuery = { salonId, accountType: 'cash' };
        if (outletId && outletId !== 'all') transQuery.outletId = outletId;
        const transactions = await FinanceTransaction.find(transQuery);
        let balance = 0;
        transactions.forEach(t => {
            balance += (t.type === 'income' ? t.amount : -t.amount);
        });

        // 2. Today's Status
        const eodQuery = { salonId, date: businessDate };
        if (outletId && outletId !== 'all') eodQuery.outletId = outletId;
        const eod = await EndOfDay.findOne(eodQuery);

        res.status(200).json({
            success: true,
            data: {
                balance,
                businessDate,
                isOpenedToday: true, // Defaulting to true for now or check for a "DayOpen" transaction
                isClosedToday: !!eod,
                categories: ['Staff Refreshment', 'Cleaning Supplies', 'Office', 'Transport', 'Repairs', 'Misc'],
                denominations: [500, 200, 100, 50, 20, 10, 5, 2, 1]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPettyCashEntries = async (req, res) => {
    try {
        let { outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        const query = {
            salonId: req.user.salonId,
            accountType: 'cash'
        };
        if (outletId && outletId !== 'all') query.outletId = outletId;
        const transactions = await FinanceTransaction.find(query).sort({ date: -1 }).limit(100);

        res.status(200).json({
            success: true,
            data: {
                results: transactions.map(t => ({
                    id: t._id,
                    type: t.category === 'Top-Up' ? 'FUND_ADDED' : 'EXPENSE',
                    amount: t.amount,
                    description: t.description,
                    category: t.category,
                    staff: 'Manager',
                    date: t.date.toISOString().split('T')[0],
                    timestamp: t.date
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPettyCashClosings = async (req, res) => {
    try {
        let { outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        const query = { salonId: req.user.salonId };
        if (outletId && outletId !== 'all') query.outletId = outletId;
        const closings = await EndOfDay.find(query).sort({ date: -1 });
        res.status(200).json({
            success: true,
            data: {
                results: closings.map(c => ({
                    id: c._id,
                    date: c.date,
                    closingBalance: c.cashInHand || c.actualCash || 0,
                    discrepancy: c.discrepancy || 0,
                    denominations: {},
                    verifiedBy: 'Manager',
                    timestamp: c.createdAt
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.openPettyCashDay = async (req, res) => {
    // Simple placeholder for day opening
    res.status(200).json({ success: true, message: 'Day opened' });
};

exports.addPettyCashFund = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            req.body.outletId = req.user.outletId.toString();
        }
        const { amount, description, source, outletId } = req.body;
        const txn = await FinanceTransaction.create({
            salonId: req.user.salonId,
            outletId,
            type: 'income',
            category: 'Top-Up',
            amount,
            accountType: 'cash',
            paymentMethod: 'cash',
            description: description || `Fund injection from ${source}`,
            performedBy: req.user._id
        });
        res.status(201).json({ success: true, data: txn });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addPettyCashExpense = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            req.body.outletId = req.user.outletId.toString();
        }
        const { amount, category, description, staff, outletId } = req.body;
        const txn = await FinanceTransaction.create({
            salonId: req.user.salonId,
            outletId,
            type: 'expense',
            category: category || 'Miscellaneous',
            amount,
            accountType: 'cash',
            paymentMethod: 'cash',
            description: description || `Petty cash expense by ${staff}`,
            performedBy: req.user._id
        });
        res.status(201).json({ success: true, data: txn });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.closePettyCashDay = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            req.body.outletId = req.user.outletId.toString();
        }
        const { denominations, verifiedBy, outletId } = req.body;
        const now = new Date();
        const businessDate = now.toISOString().split('T')[0];

        // Calculate total from denominations
        let total = 0;
        Object.entries(denominations).forEach(([d, c]) => {
            total += (Number(d) * Number(c));
        });

        const eod = await EndOfDay.create({
            salonId: req.user.salonId,
            outletId,
            date: businessDate,
            cashInHand: total,
            actualCash: total,
            expectedCash: total,
            bankBalance: 0, // Should be calculated
            totalSales: 0,
            totalExpenses: 0,
            performedBy: req.user._id
        });

        res.status(201).json({ success: true, data: eod });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── INVOICE CONTROLLERS ───────────────────────────────────────────────────

exports.getSupplierInvoices = async (req, res) => {
    try {
        const query = { salonId: req.user.salonId };
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            query.outletId = req.user.outletId;
        } else if (req.query.outletId) {
            query.outletId = req.query.outletId;
        }
        const invoices = await SupplierInvoice.find(query)
            .populate('supplierId', 'name')
            .sort({ invoiceDate: -1 });
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addSupplierInvoice = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            req.body.outletId = req.user.outletId.toString();
        }
        const invoice = await SupplierInvoice.create({
            ...req.body,
            salonId: req.user.salonId,
            createdBy: req.user._id
        });

        // If paid anything, record transaction
        if (invoice.paidAmount > 0) {
            await FinanceTransaction.create({
                salonId: req.user.salonId,
                outletId: invoice.outletId,
                type: 'expense',
                category: 'Supplier Payment',
                amount: invoice.paidAmount,
                paymentMethod: req.body.paymentMethod || 'bank_transfer',
                accountType: req.body.paymentMethod === 'cash' ? 'cash' : 'bank',
                description: `Invoice Payment: ${invoice.invoiceNumber} to ${req.body.supplierName || 'Supplier'}`,
                referenceId: invoice._id,
                referenceType: 'SupplierInvoice',
                performedBy: req.user._id
            });
        }



        // Send WhatsApp if requested
        if (req.body.sendWhatsApp && invoice.supplierId) {
            try {
                const supplier = await Supplier.findById(invoice.supplierId);
                if (supplier && supplier.phone) {
                    const message = `Hello ${supplier.name},\n\nWe have recorded a new Invoice from you:\nInvoice No: ${invoice.invoiceNumber}\nDate: ${new Date(invoice.invoiceDate).toLocaleDateString()}\nTotal Amount: ₹${invoice.totalAmount}\nPaid Amount: ₹${invoice.paidAmount}\nOutstanding Balance: ₹${invoice.totalAmount - invoice.paidAmount}\n\nThank you!\n- Salon Team`;
                    await checkAndDeductWhatsAppCredit(req.user.salonId).catch(() => { });
                    await sendWhatsAppMessage(supplier.phone, message).catch(err => console.error('Failed to send WhatsApp:', err));
                }
            } catch (err) {
                console.error('WhatsApp hook failed:', err);
            }
        }

        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addInvoicePayment = async (req, res) => {
    try {
        const { invoiceId, amount, paymentMethod, notes } = req.body;
        const query = { _id: invoiceId, salonId: req.user.salonId };
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            query.outletId = req.user.outletId;
        }
        const invoice = await SupplierInvoice.findOne(query);

        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        invoice.paidAmount += amount;
        invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;

        if (invoice.balanceAmount <= 0) invoice.status = 'paid';
        else invoice.status = 'partially-paid';

        await invoice.save();

        // Record transaction
        await FinanceTransaction.create({
            salonId: req.user.salonId,
            outletId: invoice.outletId,
            type: 'expense',
            category: 'Supplier Payment',
            amount,
            paymentMethod: paymentMethod === 'online' ? 'upi' : (paymentMethod || 'bank_transfer'),
            accountType: paymentMethod === 'cash' ? 'cash' : 'bank',
            description: `Payment for Invoice: ${invoice.invoiceNumber}`,
            referenceId: invoice._id,
            referenceType: 'SupplierInvoice',
            performedBy: req.user._id
        });



        // Send WhatsApp if requested
        if (req.body.sendWhatsApp) {
            try {
                const supplier = await Supplier.findById(invoice.supplierId);
                if (supplier && supplier.phone) {
                    const message = `Hello ${supplier.name},\n\nWe have recorded a payment of ₹${amount} against Invoice No: ${invoice.invoiceNumber}.\nRemaining Outstanding Balance: ₹${invoice.balanceAmount}\n\nThank you!\n- Salon Team`;
                    await checkAndDeductWhatsAppCredit(req.user.salonId).catch(() => { });
                    await sendWhatsAppMessage(supplier.phone, message).catch(err => console.error('Failed to send WhatsApp:', err));
                }
            } catch (err) {
                console.error('WhatsApp hook failed:', err);
            }
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── DASHBOARD & SUMMARY ──────────────────────────────────────────────────

exports.getFinanceSummary = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let { outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Build queries
        const invoiceQuery = { salonId, status: { $ne: 'cancelled' } };
        const transactionQuery = { salonId };
        const supplierInvoiceQuery = { salonId, invoiceDate: { $gte: startOfMonth } };
        const expenseQuery = { salonId };

        if (outletId && outletId !== 'all') {
            invoiceQuery.outletId = outletId;
            transactionQuery.outletId = outletId;
            supplierInvoiceQuery.outletId = outletId;
            expenseQuery.outletId = outletId;
        }

        // Fetch POS invoices, ledger transactions, and supplier invoices
        const invoices = await Invoice.find(invoiceQuery);
        const transactions = await FinanceTransaction.find(transactionQuery).sort({ date: -1 });
        const mtdSupplierInvoices = await SupplierInvoice.find(supplierInvoiceQuery);
        const supplierPurchasesMtd = mtdSupplierInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        // 1. Transactions and Balances
        let cashInHand = 0;
        let bankBalance = 0;

        // Add POS payments
        invoices.forEach(inv => {
            (inv.payments || []).forEach(p => {
                if (p.method === 'cash') {
                    cashInHand += (p.amount || 0);
                } else if (['card', 'upi', 'online', 'bank_transfer', 'cheque'].includes(p.method)) {
                    bankBalance += (p.amount || 0);
                }
            });
        });

        // Add ledger transactions
        transactions.forEach(t => {
            const amt = t.type === 'income' ? t.amount : -t.amount;
            if (t.accountType === 'cash') cashInHand += amt;
            else bankBalance += amt;
        });

        // 2. KPIs (MTD)
        const monthlyTransactions = transactions.filter(t => t.date >= startOfMonth);

        const mtdInvoices = invoices.filter(inv => inv.createdAt >= startOfMonth);
        let mtdSales = 0;
        mtdInvoices.forEach(inv => {
            (inv.payments || []).forEach(p => {
                mtdSales += (p.amount || 0);
            });
        });

        const grossInflow = mtdSales + monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

        // Filter out transactions related to Supplier Payment to prevent double counting
        const supplierPaymentsMtd = monthlyTransactions
            .filter(t => t.type === 'expense' && t.category === 'Supplier Payment')
            .reduce((s, t) => s + t.amount, 0);

        const totalExpensesRaw = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const totalExpenses = totalExpensesRaw - supplierPaymentsMtd;

        // 3. Monthly Trend (Last 12 Months)
        const monthlyTrend = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const monthTx = transactions.filter(t => t.date >= mStart && t.date <= mEnd);
            const monthInvoices = invoices.filter(inv => inv.createdAt >= mStart && inv.createdAt <= mEnd);

            let monthSales = 0;
            monthInvoices.forEach(inv => {
                (inv.payments || []).forEach(p => {
                    monthSales += (p.amount || 0);
                });
            });

            monthlyTrend.push({
                name: d.toLocaleString('default', { month: 'short' }),
                revenue: monthSales + monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
            });
        }

        // 4. Cost Allocation (Top categories)
        const expenses = await Expense.find(expenseQuery);
        const categories = {};
        expenses.forEach(e => {
            categories[e.category] = (categories[e.category] || 0) + e.amount;
        });
        const totalExp = Object.values(categories).reduce((s, v) => s + v, 0);
        const costAllocation = Object.entries(categories).map(([label, val]) => ({
            label,
            percentage: totalExp > 0 ? Math.round((val / totalExp) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

        // 5. Recent Transactions
        const recentTransactions = transactions.slice(0, 5).map(t => ({
            id: t._id,
            label: t.description || t.category || (t.type === 'income' ? 'Direct Income' : 'Shop Expense'),
            amount: t.amount,
            type: t.type,
            staff: 'System',
            at: t.date
        }));

        res.status(200).json({
            success: true,
            data: {
                cashPosition: {
                    openingCash: cashInHand, // Actual cash in hand position
                    bankBalance
                },
                kpis: {
                    grossInflow,
                    totalExpenses,
                    supplierPurchasesMtd,
                    pendingRefunds: 0,
                    netLiquidity: grossInflow - totalExpenses - supplierPurchasesMtd
                },
                monthlyTrend,
                recentTransactions,
                costAllocation
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── END OF DAY ──────────────────────────────────────────────────────────

exports.getEODReports = async (req, res) => {
    try {
        const query = { salonId: req.user.salonId };
        let { outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        if (outletId && outletId !== 'all') {
            query.outletId = outletId;
        }
        const reports = await EndOfDay.find(query).sort({ date: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEODSummary = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let { outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const start = new Date(date); start.setHours(0, 0, 0, 0);
        const end = new Date(date); end.setHours(23, 59, 59, 999);

        // Fetch last closed EOD for opening cash
        const lastEodQuery = { salonId, date: { $lt: start } };
        if (outletId && outletId !== 'all') lastEodQuery.outletId = outletId;
        const lastEod = await EndOfDay.findOne(lastEodQuery).sort({ date: -1 });
        const openingCash = lastEod?.actualCash || 0;

        // Exclude cancelled invoices
        const invoiceQuery = {
            salonId,
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'cancelled' }
        };
        if (outletId && outletId !== 'all') invoiceQuery.outletId = outletId;
        const invoices = await Invoice.find(invoiceQuery);

        // Fetch other ledger transactions for expenses and other cash inflows
        const transQuery = {
            salonId,
            date: { $gte: start, $lte: end }
        };
        if (outletId && outletId !== 'all') transQuery.outletId = outletId;
        const transactions = await FinanceTransaction.find(transQuery);

        const totalRevenue = invoices.reduce((s, i) => s + (i.total || 0), 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);

        let cashSales = 0;
        let cardSales = 0;
        let onlineSales = 0;

        invoices.forEach(i => {
            if (i.payments && i.payments.length > 0) {
                i.payments.forEach(p => {
                    if (p.method === 'cash') {
                        cashSales += (p.amount || 0);
                    } else if (p.method === 'card') {
                        cardSales += (p.amount || 0);
                    } else if (['online', 'upi', 'bank_transfer', 'cheque'].includes(p.method)) {
                        onlineSales += (p.amount || 0);
                    }
                });
            } else {
                if (i.paymentMethod === 'cash') {
                    cashSales += (i.total || 0);
                } else if (i.paymentMethod === 'card') {
                    cardSales += (i.total || 0);
                } else if (i.paymentMethod === 'online' || i.paymentMethod === 'upi') {
                    onlineSales += (i.total || 0);
                }
            }
        });

        let cashExpenses = 0;
        let otherCashIncome = 0;

        transactions.forEach(t => {
            if (t.type === 'expense') {
                if (t.accountType === 'cash') {
                    cashExpenses += t.amount;
                }
            } else if (t.type === 'income') {
                if (t.accountType === 'cash') {
                    otherCashIncome += t.amount;
                }
            }
        });

        // Net cash estimate includes opening cash + cash sales + other cash ledger inflows - cash expenses
        const netCashEstimate = openingCash + cashSales + otherCashIncome - cashExpenses;

        const existingCloseQuery = { salonId, date: { $gte: start, $lte: end } };
        if (outletId && outletId !== 'all') existingCloseQuery.outletId = outletId;
        const existingClose = await EndOfDay.findOne(existingCloseQuery);

        res.json({
            success: true,
            data: {
                metrics: {
                    totalSales: totalRevenue,
                    dailyExpenses: totalExpenses,
                    netForDay: totalRevenue - totalExpenses,
                    invoiceCount: invoices.length,
                    cashSales,
                    cardSales,
                    onlineSales,
                    openingCash,
                    netCashEstimate
                },
                dayClosed: !!existingClose,
                closure: existingClose || null,
                reconciled: !!existingClose,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getEODHistory = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let { outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        const limit = parseInt(req.query.limit) || 15;
        const query = { salonId };
        if (outletId && outletId !== 'all') query.outletId = outletId;
        const reports = await EndOfDay.find(query).sort({ date: -1 }).limit(limit);
        res.json({ success: true, data: { results: reports } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.closeEOD = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { businessDate, openingCash, actualCash, notes, outletId, denominations } = req.body;
        const targetOutletId = getAuthorizedOutletId(req, outletId);

        const date = businessDate ? new Date(businessDate) : new Date();
        const start = new Date(date); start.setHours(0, 0, 0, 0);
        const end = new Date(date); end.setHours(23, 59, 59, 999);

        // Fetch POS invoices to aggregate sales
        const invoiceQuery = {
            salonId,
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'cancelled' }
        };
        if (targetOutletId && targetOutletId !== 'all') invoiceQuery.outletId = targetOutletId;
        const invoices = await Invoice.find(invoiceQuery);

        let cashSales = 0;
        let cardSales = 0;
        let onlineSales = 0;

        invoices.forEach(i => {
            if (i.payments && i.payments.length > 0) {
                i.payments.forEach(p => {
                    if (p.method === 'cash') {
                        cashSales += (p.amount || 0);
                    } else if (p.method === 'card') {
                        cardSales += (p.amount || 0);
                    } else if (['online', 'upi', 'bank_transfer', 'cheque'].includes(p.method)) {
                        onlineSales += (p.amount || 0);
                    }
                });
            } else {
                if (i.paymentMethod === 'cash') {
                    cashSales += (i.total || 0);
                } else if (i.paymentMethod === 'card') {
                    cardSales += (i.total || 0);
                } else if (i.paymentMethod === 'online' || i.paymentMethod === 'upi') {
                    onlineSales += (i.total || 0);
                }
            }
        });

        // Fetch other ledger transactions for expenses and other cash inflows
        const transQuery = {
            salonId,
            date: { $gte: start, $lte: end }
        };
        if (targetOutletId && targetOutletId !== 'all') transQuery.outletId = targetOutletId;
        const transactions = await FinanceTransaction.find(transQuery);

        let otherCashIncome = 0;
        let otherBankIncome = 0;
        let cashExpenses = 0;
        let bankExpenses = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                if (t.accountType === 'cash') {
                    otherCashIncome += t.amount;
                } else {
                    otherBankIncome += t.amount;
                }
            } else if (t.type === 'expense') {
                if (t.accountType === 'cash') {
                    cashExpenses += t.amount;
                } else {
                    bankExpenses += t.amount;
                }
            }
        });

        const totalCashIncome = cashSales + otherCashIncome;
        const totalBankIncome = cardSales + onlineSales + otherBankIncome;

        const expectedCash = Number(openingCash || 0) + totalCashIncome - cashExpenses;
        const discrepancy = Number(actualCash || 0) - expectedCash;

        // Fetch last closed bank for expectedBank calculations if needed (fallback to 0)
        const lastEodQuery = { salonId, date: { $lt: start } };
        if (targetOutletId && targetOutletId !== 'all') lastEodQuery.outletId = targetOutletId;
        const lastEod = await EndOfDay.findOne(lastEodQuery).sort({ date: -1 });
        const openingBank = lastEod?.actualBank || 0;
        const expectedBank = openingBank + totalBankIncome - bankExpenses;

        const reportQuery = { salonId, date: { $gte: start, $lte: end } };
        if (targetOutletId && targetOutletId !== 'all') reportQuery.outletId = targetOutletId;

        const updatePayload = {
            openingCash: Number(openingCash || 0),
            totalCashIncome,
            totalCashExpense: cashExpenses,
            totalBankIncome,
            totalBankExpense: bankExpenses,
            expectedCash,
            actualCash: Number(actualCash || 0),
            discrepancy,
            openingBank,
            expectedBank,
            actualBank: expectedBank, // Default to expectedBank as it's not manually counted on this screen
            bankDiscrepancy: 0,
            status: 'closed',
            notes: notes ? notes.trim() : '',
            denominations,
            performedBy: req.user._id,
            date: start
        };
        if (targetOutletId && targetOutletId !== 'all') updatePayload.outletId = targetOutletId;

        const report = await EndOfDay.findOneAndUpdate(
            reportQuery,
            updatePayload,
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, data: report });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getGSTSummary = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const fyYear = parseInt(req.query.fy) || new Date().getFullYear();
        const outletId = getAuthorizedOutletId(req, req.query.outletId);
        const fyStart = new Date(fyYear, 3, 1); // April 1
        const fyEnd = new Date(fyYear + 1, 2, 31, 23, 59, 59); // March 31

        const query = { salonId, createdAt: { $gte: fyStart, $lte: fyEnd }, paymentStatus: { $ne: 'unpaid' } };
        if (outletId && outletId !== 'all') query.outletId = outletId;

        const invoices = await Invoice.find(query);

        const months = {};
        const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

        invoices.forEach(inv => {
            const d = new Date(inv.createdAt);
            const mIdx = (d.getMonth() - 3 + 12) % 12;
            const key = mIdx;
            if (!months[key]) months[key] = { invoices: 0, revenue: 0, tax: 0 };
            months[key].invoices += 1;
            months[key].revenue += (inv.total || 0);
            months[key].tax += (inv.tax || 0);
        });

        const monthly = monthLabels.map((label, i) => {
            const m = months[i] || { invoices: 0, revenue: 0, tax: 0 };
            const taxable = Math.max(0, m.revenue - m.tax);
            const cgst = m.tax / 2;
            const sgst = m.tax / 2;
            return { monthLabel: label, taxable, cgst, sgst, gstTotal: m.tax, productGst: 0, serviceGst: m.tax, invoices: m.invoices };
        });

        const totals = monthly.reduce((acc, m) => ({
            taxable: acc.taxable + m.taxable,
            cgst: acc.cgst + m.cgst,
            sgst: acc.sgst + m.sgst,
            gstTotal: acc.gstTotal + m.gstTotal,
            productGst: 0,
            serviceGst: acc.serviceGst + m.serviceGst,
            invoices: acc.invoices + m.invoices,
        }), { taxable: 0, cgst: 0, sgst: 0, gstTotal: 0, productGst: 0, serviceGst: 0, invoices: 0 });

        res.json({ success: true, data: { monthly, totals, fy: `${fyYear}-${fyYear + 1}` } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getCashBank = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let { outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const start = new Date(date); start.setHours(0, 0, 0, 0);
        const end = new Date(date); end.setHours(23, 59, 59, 999);

        // Fetch opening cash/bank from the latest EndOfDay record before today
        const prevEodQuery = { salonId, date: { $lt: start } };
        if (outletId && outletId !== 'all') prevEodQuery.outletId = outletId;
        const prevEod = await EndOfDay.findOne(prevEodQuery).sort({ date: -1 });

        const openingCash = prevEod ? prevEod.actualCash : 0;
        const openingBank = prevEod ? (prevEod.actualBank || 0) : 0;

        // Fetch POS invoices
        const invoiceQuery = { salonId, createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } };
        if (outletId && outletId !== 'all') invoiceQuery.outletId = outletId;
        const invoices = await Invoice.find(invoiceQuery);
        let cashSales = 0;
        let bankSales = 0;
        invoices.forEach(i => {
            (i.payments || []).forEach(p => {
                if (p.method === 'cash') {
                    cashSales += (p.amount || 0);
                } else if (['card', 'upi', 'online', 'bank_transfer', 'cheque'].includes(p.method)) {
                    bankSales += (p.amount || 0);
                }
            });
        });

        // Fetch other ledger transactions
        const transQuery = { salonId, date: { $gte: start, $lte: end } };
        if (outletId && outletId !== 'all') transQuery.outletId = outletId;
        const transactions = await FinanceTransaction.find(transQuery);
        let otherCashIncome = 0;
        let otherBankIncome = 0;
        let cashExpenses = 0;
        let bankExpenses = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                if (t.accountType === 'cash') {
                    otherCashIncome += t.amount;
                } else {
                    otherBankIncome += t.amount;
                }
            } else if (t.type === 'expense') {
                if (t.accountType === 'cash') {
                    cashExpenses += t.amount;
                } else {
                    bankExpenses += t.amount;
                }
            }
        });

        const totalCashIncome = cashSales + otherCashIncome;
        const totalBankIncome = bankSales + otherBankIncome;

        const expectedCash = openingCash + totalCashIncome - cashExpenses;
        const expectedBank = openingBank + totalBankIncome - bankExpenses;

        // Find saved EOD for this day (can be draft pending or closed)
        const savedQuery = { salonId, date: { $gte: start, $lte: end } };
        if (outletId && outletId !== 'all') savedQuery.outletId = outletId;
        const saved = await EndOfDay.findOne(savedQuery);

        res.json({
            success: true,
            data: {
                cash: {
                    opening: openingCash,
                    sales: totalCashIncome,
                    expenses: cashExpenses,
                    net: expectedCash
                },
                bank: {
                    opening: openingBank,
                    sales: totalBankIncome,
                    expenses: bankExpenses,
                    net: expectedBank
                },
                saved: saved ? {
                    actualCash: saved.actualCash,
                    actualBank: saved.actualBank,
                    notes: saved.notes,
                    status: saved.status
                } : null,
                meta: {
                    invoiceCashLabel: `POS Cash (₹${cashSales.toLocaleString('en-IN')}) + Other Cash Inflows (₹${otherCashIncome.toLocaleString('en-IN')})`,
                    invoiceBankLabel: `POS Online (₹${bankSales.toLocaleString('en-IN')}) + Other Bank Inflows (₹${otherBankIncome.toLocaleString('en-IN')})`,
                    expenseCashLabel: `Cash Outflows (₹${cashExpenses.toLocaleString('en-IN')})`,
                    expenseBankLabel: `Bank Outflows (₹${bankExpenses.toLocaleString('en-IN')})`
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.reconcileCashBank = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { businessDate, actualCash, actualBank, notes, locked, outletId, denominations } = req.body;
        const targetOutletId = getAuthorizedOutletId(req, outletId);

        const date = businessDate ? new Date(businessDate) : new Date();
        const start = new Date(date); start.setHours(0, 0, 0, 0);
        const end = new Date(date); end.setHours(23, 59, 59, 999);

        // Fetch opening cash/bank from the latest EndOfDay record before today
        const prevEodQuery = { salonId, date: { $lt: start } };
        if (targetOutletId && targetOutletId !== 'all') prevEodQuery.outletId = targetOutletId;
        const prevEod = await EndOfDay.findOne(prevEodQuery).sort({ date: -1 });

        const openingCash = prevEod ? prevEod.actualCash : 0;
        const openingBank = prevEod ? (prevEod.actualBank || 0) : 0;

        // Fetch POS invoices
        const invoiceQuery = { salonId, createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } };
        if (targetOutletId && targetOutletId !== 'all') invoiceQuery.outletId = targetOutletId;
        const invoices = await Invoice.find(invoiceQuery);
        let cashSales = 0;
        let bankSales = 0;
        invoices.forEach(i => {
            (i.payments || []).forEach(p => {
                if (p.method === 'cash') cashSales += (p.amount || 0);
                else if (['card', 'upi', 'online', 'bank_transfer', 'cheque'].includes(p.method)) bankSales += (p.amount || 0);
            });
        });

        // Fetch other ledger transactions
        const transQuery = { salonId, date: { $gte: start, $lte: end } };
        if (targetOutletId && targetOutletId !== 'all') transQuery.outletId = targetOutletId;
        const transactions = await FinanceTransaction.find(transQuery);
        let otherCashIncome = 0;
        let otherBankIncome = 0;
        let cashExpenses = 0;
        let bankExpenses = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                if (t.accountType === 'cash') otherCashIncome += t.amount;
                else otherBankIncome += t.amount;
            } else if (t.type === 'expense') {
                if (t.accountType === 'cash') cashExpenses += t.amount;
                else bankExpenses += t.amount;
            }
        });

        const totalCashIncome = cashSales + otherCashIncome;
        const totalBankIncome = bankSales + otherBankIncome;

        const expectedCash = openingCash + totalCashIncome - cashExpenses;
        const expectedBank = openingBank + totalBankIncome - bankExpenses;

        const discrepancy = actualCash - expectedCash;
        const bankDiscrepancy = actualBank - expectedBank;

        const reportQuery = { salonId, date: { $gte: start, $lte: end } };
        if (targetOutletId && targetOutletId !== 'all') reportQuery.outletId = targetOutletId;

        const updatePayload = {
            openingCash,
            totalCashIncome,
            totalCashExpense: cashExpenses,
            totalBankIncome,
            totalBankExpense: bankExpenses,
            expectedCash,
            actualCash,
            discrepancy,
            openingBank,
            expectedBank,
            actualBank,
            bankDiscrepancy,
            status: locked ? 'closed' : 'pending',
            notes,
            denominations,
            performedBy: req.user._id,
            date: start
        };
        if (targetOutletId && targetOutletId !== 'all') updatePayload.outletId = targetOutletId;

        // Save or update EndOfDay report
        const report = await EndOfDay.findOneAndUpdate(
            reportQuery,
            updatePayload,
            { upsert: true, new: true }
        );

        res.json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.submitEOD = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            payload.outletId = req.user.outletId.toString();
        }
        const report = await EndOfDay.create({
            ...payload,
            salonId: req.user.salonId,
            performedBy: req.user._id
        });
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let { type, accountType, category, startDate, endDate, outletId, page = 1, limit = 50 } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);

        const query = { salonId };
        if (type) query.type = type;
        if (accountType) query.accountType = accountType;
        if (category) query.category = category;
        if (outletId && outletId !== 'all') query.outletId = outletId;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [transactions, total] = await Promise.all([
            FinanceTransaction.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
            FinanceTransaction.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                results: transactions,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const {
            type,
            category,
            amount,
            accountType,
            paymentMethod,
            description,
            outletId,
            date = new Date()
        } = req.body;
        const targetOutletId = getAuthorizedOutletId(req, outletId);

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        const txnDate = new Date(date);
        const cleanOutletId = (targetOutletId && targetOutletId !== 'all') ? targetOutletId : undefined;

        if (category === 'Bank Deposit') {
            // Cash -> Bank transfer
            const txn1 = await FinanceTransaction.create({
                salonId,
                outletId: cleanOutletId,
                date: txnDate,
                type: 'expense',
                category: 'Bank Deposit',
                amount,
                paymentMethod: 'cash',
                accountType: 'cash',
                description: description || 'Cash deposit to Bank',
                performedBy: req.user._id
            });
            const txn2 = await FinanceTransaction.create({
                salonId,
                outletId: cleanOutletId,
                date: txnDate,
                type: 'income',
                category: 'Bank Deposit',
                amount,
                paymentMethod: 'bank_transfer',
                accountType: 'bank',
                description: description || 'Cash deposit to Bank',
                performedBy: req.user._id
            });
            return res.status(201).json({ success: true, data: [txn1, txn2] });
        }

        if (category === 'Bank Withdrawal') {
            // Bank -> Cash transfer
            const txn1 = await FinanceTransaction.create({
                salonId,
                outletId: cleanOutletId,
                date: txnDate,
                type: 'expense',
                category: 'Bank Withdrawal',
                amount,
                paymentMethod: 'bank_transfer',
                accountType: 'bank',
                description: description || 'Cash withdrawal from Bank',
                performedBy: req.user._id
            });
            const txn2 = await FinanceTransaction.create({
                salonId,
                outletId: cleanOutletId,
                date: txnDate,
                type: 'income',
                category: 'Bank Withdrawal',
                amount,
                paymentMethod: 'cash',
                accountType: 'cash',
                description: description || 'Cash withdrawal from Bank',
                performedBy: req.user._id
            });
            return res.status(201).json({ success: true, data: [txn1, txn2] });
        }

        // Standard single transaction
        const txn = await FinanceTransaction.create({
            salonId,
            outletId: cleanOutletId,
            date: txnDate,
            type,
            category: category || (type === 'income' ? 'Other Income' : 'Other Expense'),
            amount,
            paymentMethod: paymentMethod || (accountType === 'cash' ? 'cash' : 'upi'),
            accountType,
            description,
            performedBy: req.user._id
        });

        res.status(201).json({ success: true, data: txn });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.sendSupplierInvoiceWhatsApp = async (req, res) => {
    try {
        const { id } = req.params;
        const SupplierInvoice = require('../Models/SupplierInvoice');
        const Supplier = require('../Models/Supplier');
        const { sendWhatsAppMessage, checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');

        const query = { _id: id, salonId: req.user.salonId };
        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            query.outletId = req.user.outletId;
        }
        const invoice = await SupplierInvoice.findOne(query).populate('supplierId');
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const supplier = invoice.supplierId;
        if (!supplier || !supplier.phone) {
            return res.status(400).json({ success: false, message: 'Supplier contact phone number not found' });
        }

        // Check if outlet has credits and deduct 1
        const canSendWhatsApp = await checkAndDeductWhatsAppCredit(invoice.salonId);
        if (!canSendWhatsApp) {
            return res.status(400).json({ success: false, message: 'Insufficient WhatsApp credits or feature disabled for this outlet' });
        }

        const formattedDate = new Date(invoice.invoiceDate).toLocaleDateString();
        const formattedAmount = Number(invoice.totalAmount).toLocaleString('en-IN');
        const formattedPaid = Number(invoice.paidAmount).toLocaleString('en-IN');
        const formattedOutstanding = Number(invoice.balanceAmount).toLocaleString('en-IN');

        const message = `*Hello ${supplier.name}!* \n\nHere is the invoice update from our salon. \n\n*Invoice Summary:* \nInvoice No: #${invoice.invoiceNumber}\nDate: ${formattedDate}\nTotal Amount: Rs. ${formattedAmount}\nPaid: Rs. ${formattedPaid}\nOutstanding: Rs. ${formattedOutstanding}\nStatus: *${invoice.status.toUpperCase()}*\n\nThank you!`;

        const result = await sendWhatsAppMessage(supplier.phone, message);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message || 'Failed to send WhatsApp message via Meta Cloud API' });
        }

        res.status(200).json({ success: true, message: 'WhatsApp message sent successfully via API' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInvoicePayments = async (req, res) => {
    try {
        const { id } = req.params;
        const FinanceTransaction = require('../Models/FinanceTransaction');

        const query = {
            salonId: req.user.salonId,
            referenceId: id,
            referenceType: 'SupplierInvoice'
        };
        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            query.outletId = req.user.outletId;
        }
        const transactions = await FinanceTransaction.find(query).sort({ date: 1 });

        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSalesReports = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let { period = 'monthly', startDate, endDate, outletId } = req.query;
        outletId = getAuthorizedOutletId(req, outletId);
        const mongoose = require('mongoose');
        const Staff = require('../Models/Staff');

        let start = startDate ? new Date(startDate) : null;
        let end = endDate ? new Date(endDate) : new Date();

        if (!start) {
            start = new Date();
            if (period === 'daily') {
                start.setDate(start.getDate() - 30); // Last 30 days
            } else if (period === 'weekly') {
                start.setDate(start.getDate() - 84); // Last 12 weeks
            } else if (period === 'yearly') {
                start.setFullYear(start.getFullYear() - 5); // Last 5 years
            } else { // monthly (default)
                start.setFullYear(start.getFullYear() - 1); // Last 12 months
            }
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Fetch all active invoices in this date range
        const invoiceQuery = {
            salonId,
            status: { $in: ['active', 'refunded'] },
            createdAt: { $gte: start, $lte: end }
        };
        if (outletId && outletId !== 'all') {
            invoiceQuery.outletId = outletId;
        }

        const invoices = await Invoice.find(invoiceQuery).populate('customerId', 'name').lean();

        // Calculate KPIs
        let totalSales = 0;
        let servicesRevenue = 0;
        let productsRevenue = 0;
        const invoiceCount = invoices.length;

        invoices.forEach(inv => {
            const invTotal = inv.total || 0;
            totalSales += invTotal;

            let invSubtotal = 0;
            (inv.items || []).forEach(item => {
                invSubtotal += (item.price || 0) * (item.quantity || 1);
            });

            const ratio = invSubtotal > 0 ? (invTotal / invSubtotal) : 1;

            (inv.items || []).forEach(item => {
                const itemRevenue = (item.price || 0) * (item.quantity || 1) * ratio;
                if (item.type === 'service') {
                    servicesRevenue += itemRevenue;
                } else if (item.type === 'product') {
                    productsRevenue += itemRevenue;
                }
            });
        });

        const averageOrderValue = invoiceCount > 0 ? Math.round(totalSales / invoiceCount) : 0;

        // ── Previous period comparison ──────────────────────────────────────
        const periodDiff = end.getTime() - start.getTime();
        const prevPeriodEnd = new Date(start.getTime() - 1);
        const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodDiff);

        const prevInvoiceQuery = {
            salonId,
            status: { $in: ['active', 'refunded'] },
            createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd }
        };
        if (outletId && outletId !== 'all') {
            prevInvoiceQuery.outletId = outletId;
        }

        const prevInvoices = await Invoice.find(prevInvoiceQuery).lean();

        let prevTotalSales = 0;
        let prevServicesRevenue = 0;
        let prevProductsRevenue = 0;
        prevInvoices.forEach(inv => {
            const invTotal = inv.total || 0;
            prevTotalSales += invTotal;

            let invSubtotal = 0;
            (inv.items || []).forEach(item => {
                invSubtotal += (item.price || 0) * (item.quantity || 1);
            });

            const ratio = invSubtotal > 0 ? (invTotal / invSubtotal) : 1;

            (inv.items || []).forEach(item => {
                const itemRevenue = (item.price || 0) * (item.quantity || 1) * ratio;
                if (item.type === 'service') {
                    prevServicesRevenue += itemRevenue;
                } else if (item.type === 'product') {
                    prevProductsRevenue += itemRevenue;
                }
            });
        });
        const prevInvoiceCount = prevInvoices.length;
        const prevAOV = prevInvoiceCount > 0 ? Math.round(prevTotalSales / prevInvoiceCount) : 0;

        const pctChange = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return Math.round(((curr - prev) / prev) * 100);
        };

        const kpiChanges = {
            totalSales: pctChange(totalSales, prevTotalSales),
            servicesRevenue: pctChange(servicesRevenue, prevServicesRevenue),
            productsRevenue: pctChange(productsRevenue, prevProductsRevenue),
            averageOrderValue: pctChange(averageOrderValue, prevAOV),
            invoiceCount: pctChange(invoiceCount, prevInvoiceCount),
        };

        // Group by Date for Trend
        const trendMap = new Map();

        // Populate all buckets with 0 to ensure continuous charts
        let current = new Date(start);
        while (current <= end) {
            let key = '';
            if (period === 'daily') {
                key = current.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                trendMap.set(key, { name: key, sales: 0, count: 0 });
                current.setDate(current.getDate() + 1);
            } else if (period === 'weekly') {
                // Get week identifier
                const oneJan = new Date(current.getFullYear(), 0, 1);
                const numberOfDays = Math.floor((current - oneJan) / (24 * 60 * 60 * 1000));
                const weekNum = Math.ceil((current.getDay() + 1 + numberOfDays) / 7);
                key = `W${weekNum} ${current.getFullYear()}`;
                trendMap.set(key, { name: key, sales: 0, count: 0 });
                current.setDate(current.getDate() + 7);
            } else if (period === 'yearly') {
                key = current.getFullYear().toString();
                trendMap.set(key, { name: key, sales: 0, count: 0 });
                current.setFullYear(current.getFullYear() + 1);
            } else { // monthly
                key = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                trendMap.set(key, { name: key, sales: 0, count: 0 });
                current.setMonth(current.getMonth() + 1);
            }
        }

        // Fill buckets with actual data
        invoices.forEach(inv => {
            const date = new Date(inv.createdAt);
            let key = '';
            if (period === 'daily') {
                key = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
            } else if (period === 'weekly') {
                const oneJan = new Date(date.getFullYear(), 0, 1);
                const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
                const weekNum = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
                key = `W${weekNum} ${date.getFullYear()}`;
            } else if (period === 'yearly') {
                key = date.getFullYear().toString();
            } else { // monthly
                key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }

            if (trendMap.has(key)) {
                const currentData = trendMap.get(key);
                currentData.sales += (inv.total || 0);
                currentData.count += 1;
                trendMap.set(key, currentData);
            } else {
                trendMap.set(key, { name: key, sales: inv.total || 0, count: 1 });
            }
        });

        const trend = Array.from(trendMap.values());

        // Top Services & Products
        const serviceMap = {};
        const productMap = {};
        const stylistStats = {};

        invoices.forEach(inv => {
            const invTotal = inv.total || 0;

            let invSubtotal = 0;
            (inv.items || []).forEach(item => {
                invSubtotal += (item.price || 0) * (item.quantity || 1);
            });

            const ratio = invSubtotal > 0 ? (invTotal / invSubtotal) : 1;

            (inv.items || []).forEach(item => {
                const itemRevenue = (item.price || 0) * (item.quantity || 1) * ratio;
                if (item.type === 'service') {
                    serviceMap[item.name] = (serviceMap[item.name] || 0) + itemRevenue;

                    if (item.stylistIds && item.stylistIds.length > 0) {
                        const splitRevenue = itemRevenue / item.stylistIds.length;
                        item.stylistIds.forEach(idStr => {
                            if (!idStr) return;
                            const id = idStr.toString();
                            if (!stylistStats[id]) {
                                stylistStats[id] = { id, value: 0 };
                            }
                            stylistStats[id].value += splitRevenue;
                        });
                    }
                } else if (item.type === 'product') {
                    productMap[item.name] = (productMap[item.name] || 0) + itemRevenue;
                }
            });
        });

        const services = Object.entries(serviceMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        const products = Object.entries(productMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        // Map stylist stats to staff names
        const staffList = await Staff.find({ salonId }).select('name').lean();
        const staffMap = {};
        staffList.forEach(s => {
            staffMap[s._id.toString()] = s.name;
        });

        const staff = Object.values(stylistStats)
            .map(stat => ({
                name: staffMap[stat.id] || 'Other Staff',
                value: Math.round(stat.value)
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        // Get recent active invoices (up to 50)
        const recentInvoices = invoices
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5)
            .map(inv => ({
                _id: inv._id,
                invoiceNumber: inv.invoiceNumber,
                customerName: inv.customerId?.name || 'Guest Customer',
                total: inv.total,
                paymentMethod: inv.paymentMethod,
                createdAt: inv.createdAt,
                status: inv.status
            }));

        res.status(200).json({
            success: true,
            data: {
                kpis: {
                    totalSales,
                    servicesRevenue,
                    productsRevenue,
                    averageOrderValue,
                    invoiceCount
                },
                kpiChanges,
                trend,
                services,
                products,
                staff,
                recentInvoices
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.seedSampleReports = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const mongoose = require('mongoose');
        const Staff = require('../Models/Staff');
        const Customer = require('../Models/Customer');
        const Outlet = require('../Models/Outlet');

        // Check first outlet
        let outlet = await Outlet.findOne({ salonId });
        if (!outlet) {
            outlet = await Outlet.create({
                salonId,
                name: 'Main Branch',
                phone: '1234567890',
                address: { street: 'Main Street', city: 'Azamgarh', state: 'UP', pincode: '276001' }
            });
        }
        const outletId = outlet._id;

        // Get or create customers
        let customers = await Customer.find({ salonId }).limit(6);
        if (customers.length === 0) {
            customers = [
                await Customer.create({ salonId, name: 'Aarav Sharma', phone: '9999999901' }),
                await Customer.create({ salonId, name: 'Ananya Verma', phone: '9999999902' }),
                await Customer.create({ salonId, name: 'Kabir Singh', phone: '9999999903' }),
                await Customer.create({ salonId, name: 'Meera Nair', phone: '9999999904' }),
                await Customer.create({ salonId, name: 'Rahul Sen', phone: '9999999905' })
            ];
        }

        // Get or create staff
        let staffList = await Staff.find({ salonId, isActive: true });
        if (staffList.length === 0) {
            staffList = [
                await Staff.create({ salonId, name: 'Rehan', role: 'Stylish', email: 'rehan@example.com', password: 'password123' }),
                await Staff.create({ salonId, name: 'Kajal', role: 'Stylish', email: 'kajal@example.com', password: 'password123' }),
                await Staff.create({ salonId, name: 'Sarah', role: 'Stylish', email: 'sarah@example.com', password: 'password123' })
            ];
        }

        const paymentMethods = ['cash', 'card', 'online', 'wallet'];
        const serviceNames = ['Haircut & Style', 'Classic Facial', 'Manicure', 'Pedicure', 'Hair Coloring', 'Head Massage', 'Shave & Beard Trim', 'Bridal Makeup'];
        const productNames = ['Hair Styling Wax', 'Herbal Shampoo', 'Face Scrub', 'Argan Hair Oil', 'Beard Serum', 'Skin Toner'];

        const invoicesToCreate = [];

        // Generate 35 invoices spread across the last 90 days
        for (let i = 0; i < 35; i++) {
            const invoiceDate = new Date();
            invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 90));
            invoiceDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

            const customer = customers[Math.floor(Math.random() * customers.length)];
            const stylist = staffList[Math.floor(Math.random() * staffList.length)];
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

            const items = [];
            let subtotal = 0;

            // Add 1-2 services
            const numServices = 1 + Math.floor(Math.random() * 2);
            for (let s = 0; s < numServices; s++) {
                const sName = serviceNames[Math.floor(Math.random() * serviceNames.length)];
                const price = 200 + Math.floor(Math.random() * 80) * 10;
                items.push({
                    type: 'service',
                    itemId: new mongoose.Types.ObjectId(),
                    name: sName,
                    price,
                    quantity: 1,
                    stylistIds: [stylist._id]
                });
                subtotal += price;
            }

            // Add 0-1 products
            if (Math.random() > 0.4) {
                const pName = productNames[Math.floor(Math.random() * productNames.length)];
                const price = 150 + Math.floor(Math.random() * 35) * 10;
                items.push({
                    type: 'product',
                    itemId: new mongoose.Types.ObjectId(),
                    name: pName,
                    price,
                    quantity: 1
                });
                subtotal += price;
            }

            const discount = Math.random() > 0.75 ? Math.floor(subtotal * 0.1) : 0;
            const tax = Math.round((subtotal - discount) * 0.18);
            const total = subtotal - discount + tax;

            invoicesToCreate.push({
                invoiceNumber: `INV-${Date.now()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
                salonId,
                outletId,
                customerId: customer._id,
                items,
                subtotal,
                discount,
                tax,
                total,
                paymentMethod,
                paymentStatus: 'paid',
                payments: [{
                    method: paymentMethod,
                    amount: total,
                    date: invoiceDate
                }],
                status: 'active',
                createdAt: invoiceDate,
                updatedAt: invoiceDate
            });
        }

        await Invoice.insertMany(invoicesToCreate);
        res.status(201).json({ success: true, message: `Successfully seeded ${invoicesToCreate.length} sample invoices for testing!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
