const express = require('express');
const router = express.Router();
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getServicesGrouped
} = require('../Controllers/serviceController');
const { protect, authorize } = require('../Middleware/auth');

router.get('/grouped', getServicesGrouped);

router
    .route('/')
    .get(getServices)
    .post(protect, authorize('admin', 'manager'), createService);

router
    .route('/:id')
    .get(getService)
    .put(protect, authorize('admin', 'manager'), updateService)
    .delete(protect, authorize('admin', 'manager'), deleteService);

module.exports = router;
