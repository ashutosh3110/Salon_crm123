const express = require('express');
const router = express.Router();
const { requestOtp, customerLoginOtp, registerCustomer, updateProfile, getProfile, getFavorites, deleteAccount } = require('../Controllers/customerAuthController');
const { protect } = require('../Middleware/auth');

// Public routes for customer app
router.post('/request-otp', requestOtp);
router.post('/login-otp', customerLoginOtp);
router.post('/register-customer', registerCustomer);

// Private routes
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);
router.get('/favorites', protect, getFavorites);

module.exports = router;
