const express = require('express');
const { getCmsData, updateCmsSection } = require('../Controllers/cmsController');
const { protect, authorize } = require('../Middleware/auth');

const router = express.Router();

router.get('/', getCmsData);
router.patch('/:section', protect, authorize('superadmin', 'admin', 'manager'), updateCmsSection);

module.exports = router;
