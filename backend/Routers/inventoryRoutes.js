const express = require('express');
const router = express.Router();
const {
    updateStock,
    getStockHistory,
    getLowStockAlerts,
    getInventorySummary
} = require('../Controllers/inventoryController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.post('/update-stock', updateStock);
router.get('/history', getStockHistory);
router.get('/low-stock', getLowStockAlerts);
router.get('/summary', getInventorySummary);

module.exports = router;
