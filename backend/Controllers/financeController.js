const Supplier = require('../Models/Supplier');
const SupplierInvoice = require('../Models/SupplierInvoice');
const Expense = require('../Models/Expense');
const PettyCash = require('../Models/PettyCash');
const FinanceTransaction = require('../Models/FinanceTransaction');
const EndOfDay = require('../Models/EndOfDay');
const Booking = require('../Models/Booking');
const Order = require('../Models/Order');

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
        const { id, ...data } = req.body;
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
        const { startDate, endDate, category } = req.query;
        let query = { salonId: req.user.salonId };
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (category && category !== 'All') {
            query.category = category;
        }
        const expenses = await Expense.find(query).sort({ date: -1 });
        res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const expense = await Expense.create({ 
            ...req.body, 
            salonId: req.user.salonId,
            createdBy: req.user._id
        });

        // Add to central ledger
        await FinanceTransaction.create({
            salonId: req.user.salonId,
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
        const now = new Date();
        const businessDate = now.toISOString().split('T')[0];

        // 1. Current Balance
        const transactions = await FinanceTransaction.find({ salonId, accountType: 'cash' });
        let balance = 0;
        transactions.forEach(t => {
            balance += (t.type === 'income' ? t.amount : -t.amount);
        });

        // 2. Today's Status
        const eod = await EndOfDay.findOne({ salonId, date: businessDate });
        
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
        const transactions = await FinanceTransaction.find({ 
            salonId: req.user.salonId, 
            accountType: 'cash' 
        }).sort({ date: -1 }).limit(100);
        
        res.status(200).json({ 
            success: true, 
            data: { results: transactions.map(t => ({
                id: t._id,
                type: t.category === 'Top-Up' ? 'FUND_ADDED' : 'EXPENSE',
                amount: t.amount,
                description: t.description,
                category: t.category,
                staff: 'Manager',
                date: t.date.toISOString().split('T')[0],
                timestamp: t.date
            })) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPettyCashClosings = async (req, res) => {
    try {
        const closings = await EndOfDay.find({ salonId: req.user.salonId }).sort({ date: -1 });
        res.status(200).json({ 
            success: true, 
            data: { results: closings.map(c => ({
                id: c._id,
                date: c.date,
                closingBalance: c.cashInHand,
                discrepancy: 0,
                denominations: {},
                verifiedBy: 'Manager',
                timestamp: c.createdAt
            })) }
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
        const { amount, description, source } = req.body;
        const txn = await FinanceTransaction.create({
            salonId: req.user.salonId,
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
        const { amount, category, description, staff } = req.body;
        const txn = await FinanceTransaction.create({
            salonId: req.user.salonId,
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
        const { denominations, verifiedBy } = req.body;
        const now = new Date();
        const businessDate = now.toISOString().split('T')[0];

        // Calculate total from denominations
        let total = 0;
        Object.entries(denominations).forEach(([d, c]) => {
            total += (Number(d) * Number(c));
        });

        const eod = await EndOfDay.create({
            salonId: req.user.salonId,
            date: businessDate,
            cashInHand: total,
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
        const invoices = await SupplierInvoice.find({ salonId: req.user.salonId })
            .populate('supplierId', 'name')
            .sort({ invoiceDate: -1 });
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addSupplierInvoice = async (req, res) => {
    try {
        const invoice = await SupplierInvoice.create({
            ...req.body,
            salonId: req.user.salonId,
            createdBy: req.user._id
        });

        // If paid anything, record transaction
        if (invoice.paidAmount > 0) {
            await FinanceTransaction.create({
                salonId: req.user.salonId,
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

        // Update supplier current balance
        await Supplier.findByIdAndUpdate(invoice.supplierId, {
            $inc: { currentBalance: -(invoice.totalAmount - invoice.paidAmount) }
        });

        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addInvoicePayment = async (req, res) => {
    try {
        const { invoiceId, amount, paymentMethod, notes } = req.body;
        const invoice = await SupplierInvoice.findOne({ _id: invoiceId, salonId: req.user.salonId });
        
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        invoice.paidAmount += amount;
        invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;
        
        if (invoice.balanceAmount <= 0) invoice.status = 'paid';
        else invoice.status = 'partially-paid';

        await invoice.save();

        // Record transaction
        await FinanceTransaction.create({
            salonId: req.user.salonId,
            type: 'expense',
            category: 'Supplier Payment',
            amount,
            paymentMethod: paymentMethod || 'bank_transfer',
            accountType: paymentMethod === 'cash' ? 'cash' : 'bank',
            description: `Payment for Invoice: ${invoice.invoiceNumber}`,
            referenceId: invoice._id,
            referenceType: 'SupplierInvoice',
            performedBy: req.user._id
        });

        // Update supplier balance
        await Supplier.findByIdAndUpdate(invoice.supplierId, {
            $inc: { currentBalance: amount } // Reduced the debt
        });

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── DASHBOARD & SUMMARY ──────────────────────────────────────────────────

exports.getFinanceSummary = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // 1. Transactions and Balances
        const transactions = await FinanceTransaction.find({ salonId }).sort({ date: -1 });
        
        let cashInHand = 0;
        let bankBalance = 0;
        transactions.forEach(t => {
            const amt = t.type === 'income' ? t.amount : -t.amount;
            if (t.accountType === 'cash') cashInHand += amt;
            else bankBalance += amt;
        });

        // 2. KPIs (MTD)
        const monthlyTransactions = transactions.filter(t => t.date >= startOfMonth);
        const grossInflow = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        // 3. Monthly Trend (Last 12 Months)
        const monthlyTrend = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            
            const monthTx = transactions.filter(t => t.date >= mStart && t.date <= mEnd);
            monthlyTrend.push({
                name: d.toLocaleString('default', { month: 'short' }),
                revenue: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
            });
        }

        // 4. Cost Allocation (Top categories)
        const expenses = await Expense.find({ salonId });
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
            label: t.description,
            amount: t.amount,
            type: t.type,
            staff: 'System', // Can be updated to populate user
            at: t.date
        }));

        res.status(200).json({
            success: true,
            data: {
                cashPosition: {
                    openingCash: 0, // Could pull from last EOD
                    bankBalance
                },
                kpis: {
                    grossInflow,
                    totalExpenses,
                    supplierPurchasesMtd: 0, // Calculate from invoices
                    pendingRefunds: 0,
                    netLiquidity: grossInflow - totalExpenses
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
        const reports = await EndOfDay.find({ salonId: req.user.salonId }).sort({ date: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitEOD = async (req, res) => {
    try {
        const report = await EndOfDay.create({
            ...req.body,
            salonId: req.user.salonId,
            performedBy: req.user._id
        });
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
