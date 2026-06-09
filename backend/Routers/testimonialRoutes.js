const express = require('express');
const { submitTestimonial, getApprovedTestimonials, getAllTestimonials, updateTestimonialStatus } = require('../Controllers/testimonialController');
const { protect, authorize } = require('../Middleware/auth');
const { upload } = require('../Middleware/upload');

const router = express.Router();

router.post('/', upload.single('image'), submitTestimonial);
router.get('/', getApprovedTestimonials);
router.get('/all', protect, authorize('superadmin'), getAllTestimonials);
router.patch('/:id/status', protect, authorize('superadmin'), updateTestimonialStatus);

module.exports = router;
