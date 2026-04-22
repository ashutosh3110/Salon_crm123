const express = require('express');
const router = express.Router();
const { 
    getDashboard, 
    getSegments, 
    getCampaigns, 
    createCampaign,
    getAutomations
} = require('../Controllers/marketingController');
const { protect, authorize } = require('../Middleware/auth');

// All routes protected and authorize for dashboard/marketing permissions
router.use(protect);
router.use(authorize('admin', 'manager', 'p:marketing'));

router.get('/dashboard', getDashboard);
router.get('/segments', getSegments);
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.get('/automations', getAutomations);

module.exports = router;
