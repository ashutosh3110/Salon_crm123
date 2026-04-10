const express = require('express');
const router = express.Router();
const { requestOtp, customerLoginOtp, registerCustomer } = require('../Controllers/customerAuthController');

// Public routes for customer app
router.post('/request-otp', requestOtp);
router.post('/login-otp', customerLoginOtp);
router.post('/register-customer', registerCustomer);

module.exports = router;
