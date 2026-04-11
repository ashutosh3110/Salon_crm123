const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');

// @desc    Get active promotions
// @route   GET /api/promotions/active
// @access  Private (Registered Customers)
router.get('/active', protect, (req, res) => {
    // Return empty array for now to stop 404
    res.json({
        success: true,
        data: []
    });
});

module.exports = router;
