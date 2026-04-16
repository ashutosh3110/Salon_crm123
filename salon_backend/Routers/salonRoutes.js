const express = require('express');
const router = express.Router();
const { 
    createSalon, 
    getSalons, 
    getSalon, 
    updateSalon, 
    deleteSalon,
    getSalonStats,
    registerSalon,
    getMe,
    updateMe,
    resendCredentials
} = require('../Controllers/salonController');
const { protect, authorize } = require('../Middleware/auth');

router.post('/register', registerSalon);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/stats', protect, authorize('superadmin'), getSalonStats);
router.post('/:id/resend-credentials', protect, authorize('superadmin'), resendCredentials);

router.route('/')
    .get(protect, authorize('superadmin'), getSalons)
    .post(protect, authorize('superadmin'), createSalon);
router.get('/:id', getSalon);
router.put('/:id', updateSalon);
router.delete('/:id', deleteSalon);

module.exports = router;
