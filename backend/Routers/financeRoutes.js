const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth');
const {
    getSuppliers,
    upsertSupplier,
    deleteSupplier,
    getExpenses,
    addExpense,
    getPettyCashSummary,
    getPettyCashEntries,
    getPettyCashClosings,
    openPettyCashDay,
    addPettyCashFund,
    addPettyCashExpense,
    closePettyCashDay,
    getSupplierInvoices,
    addSupplierInvoice,
    addInvoicePayment,
    getFinanceSummary,
    getEODReports,
    submitEOD,
    getCashBank,
    reconcileCashBank,
    getEODSummary,
    getEODHistory,
    closeEOD,
    getGSTSummary,
    getTransactions,
    addTransaction
} = require('../Controllers/financeController');

// All routes are protected and for admin/manager
router.use(protect);
router.use(authorize('admin', 'manager', 'superadmin'));

// General Transactions
router.get('/transactions', getTransactions);
router.post('/transactions', addTransaction);

// Suppliers
router.get('/suppliers', getSuppliers);
router.post('/suppliers', upsertSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);

// Petty Cash Terminal
router.get('/petty-cash/summary', getPettyCashSummary);
router.get('/petty-cash/entries', getPettyCashEntries);
router.get('/petty-cash/closings', getPettyCashClosings);
router.post('/petty-cash/open-day', openPettyCashDay);
router.post('/petty-cash/fund', addPettyCashFund);
router.post('/petty-cash/expense', addPettyCashExpense);
router.post('/petty-cash/close', closePettyCashDay);

// Supplier Invoices
router.get('/invoices', getSupplierInvoices);
router.post('/invoices', addSupplierInvoice);
router.post('/invoices/payments', addInvoicePayment);

// Summary / Dashboard
router.get('/summary', getFinanceSummary);

// Tax Reports
router.get('/tax/gst-summary', getGSTSummary);

// Cash & Bank Reconciliation
router.get('/cash-bank', getCashBank);
router.post('/cash-bank/reconcile', reconcileCashBank);

// End of Day
router.get('/eod', getEODReports);
router.post('/eod', submitEOD);
router.get('/eod/summary', getEODSummary);
router.get('/eod/history', getEODHistory);
router.post('/eod/close', closeEOD);

module.exports = router;
