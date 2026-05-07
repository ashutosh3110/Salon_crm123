const express = require('express');
const { uploadImage } = require('../Controllers/uploadController');
const { upload } = require('../Middleware/upload');
const { protect } = require('../Middleware/auth');
const checkImageLimit = require('../Middleware/imageLimit');

const router = express.Router();

// Route for simple Cloudinary upload
router.post('/', protect, upload.single('image'), checkImageLimit, uploadImage);

module.exports = router;
