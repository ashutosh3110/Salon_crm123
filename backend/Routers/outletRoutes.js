const express = require('express');
const router = express.Router();
const {
    getOutlets,
    getOutlet,
    createOutlet,
    updateOutlet,
    deleteOutlet,
    getNearbyOutlets,
    reverseGeocode,
    toggleLike
} = require('../Controllers/outletController');
const { protect, authorize } = require('../Middleware/auth');
const { optimizedUpload } = require('../Middleware/upload');
const { processToWebP } = require('../Middleware/imageProcessor');
const checkImageLimit = require('../Middleware/imageLimit');

// Public routes (NO protect middleware before these)
router.get('/nearest', require('../Controllers/homePageController').getNearestOutlets);
router.get('/nearby', getNearbyOutlets);
router.get('/reverse-geocode', reverseGeocode);
router.get('/', getOutlets);

// Protected routes
router.use(protect);

router.post('/:id/like', toggleLike);

router.route('/')
    .post(authorize('admin', 'manager', 'p:setup'), optimizedUpload.array('images', 5), checkImageLimit, processToWebP('outlets'), createOutlet);

router.route('/:id')
    .get(getOutlet)
    .put(authorize('admin', 'manager', 'superadmin', 'p:setup'), optimizedUpload.array('images', 5), checkImageLimit, processToWebP('outlets'), updateOutlet)
    .delete(authorize('admin', 'p:setup'), deleteOutlet);

module.exports = router;
