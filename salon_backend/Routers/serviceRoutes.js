const express = require('express');
const router = express.Router();
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService
} = require('../Controllers/serviceController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getServices)
    .post(authorize('admin', 'manager'), createService);

router
    .route('/:id')
    .get(getService)
    .put(authorize('admin', 'manager'), updateService)
    .delete(authorize('admin', 'manager'), deleteService);

module.exports = router;
