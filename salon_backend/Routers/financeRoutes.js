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
    submitEOD
} = require('../Controllers/financeController');

// All routes are protected and for admin/manager
router.use(protect);
router.use(authorize('admin', 'manager', 'superadmin'));

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

// End of Day
router.get('/eod', getEODReports);
router.post('/eod', submitEOD);

module.exports = router;
