const express = require('express');
const router = express.Router();
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getServicesGrouped,
    bulkImportServices
} = require('../Controllers/serviceController');
const { optimizedUpload } = require('../Middleware/upload');
const { processToWebP } = require('../Middleware/imageProcessor');
const { protect, authorize } = require('../Middleware/auth');
const checkImageLimit = require('../Middleware/imageLimit');

router.get('/grouped', protect, getServicesGrouped);
router.post('/bulk-import', protect, authorize('admin', 'manager'), optimizedUpload.single('file'), bulkImportServices);

router
    .route('/')
    .get(protect, getServices)
    .post(protect, authorize('admin', 'manager'), optimizedUpload.single('image'), checkImageLimit, processToWebP('services'), createService);

router
    .route('/:id')
    .get(getService)
    .put(protect, authorize('admin', 'manager'), optimizedUpload.single('image'), checkImageLimit, processToWebP('services'), updateService)
    .delete(protect, authorize('admin', 'manager'), deleteService);

module.exports = router;
