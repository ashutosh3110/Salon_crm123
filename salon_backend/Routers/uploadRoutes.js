const express = require('express');
const { uploadImage } = require('../Controllers/uploadController');
const { upload } = require('../Middleware/upload');
const { protect } = require('../Middleware/auth');

const router = express.Router();

// Route for simple Cloudinary upload
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;
