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

// Public routes (NO protect middleware before these)
router.get('/nearby', getNearbyOutlets);
router.get('/reverse-geocode', reverseGeocode);

// Protected routes
router.use(protect);

router.post('/:id/like', toggleLike);

router.route('/')
    .get(getOutlets)
    .post(authorize('admin', 'manager'), createOutlet);

router.route('/:id')
    .get(getOutlet)
    .put(authorize('admin', 'manager'), updateOutlet)
    .delete(authorize('admin'), deleteOutlet);

module.exports = router;
