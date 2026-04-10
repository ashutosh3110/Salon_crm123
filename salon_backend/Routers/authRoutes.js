const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

const { protect } = require('../Middleware/auth');

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.patch('/updatedetails', protect, authController.updateDetails);
router.put('/updatepassword', protect, authController.updatePassword);

module.exports = router;
