const express = require('express');
const router = express.Router();
const {
    updateStock,
    getStockHistory,
    getLowStockAlerts,
    getInventorySummary,
    transferStock,
    getTransferHistory
} = require('../Controllers/inventoryController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.post('/update-stock', updateStock);
router.get('/history', getStockHistory);
router.get('/low-stock', getLowStockAlerts);
router.get('/summary', getInventorySummary);
router.post('/transfer', transferStock);
router.get('/transfers', getTransferHistory);

module.exports = router;
