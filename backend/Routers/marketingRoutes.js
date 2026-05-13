const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getSegments,
    createSegment,
    deleteSegment,
    getSegmentCustomers,
    getCampaigns,
    createCampaign,
    deleteCampaign,
    bulkDeleteCampaigns,
    getAutomations
} = require('../Controllers/marketingController');
const { protect, authorize } = require('../Middleware/auth');

// All routes protected and authorize for dashboard/marketing permissions
router.use(protect);
router.use(authorize('admin', 'manager', 'p:marketing'));

router.get('/dashboard', getDashboard);
router.get('/segments', getSegments);
router.post('/segments', createSegment);
router.delete('/segments/:id', deleteSegment);
router.get('/segments/:id/customers', getSegmentCustomers);
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.delete('/campaigns/bulk', bulkDeleteCampaigns);
router.delete('/campaigns/:id', deleteCampaign);
router.get('/automations', getAutomations);

module.exports = router;
