const express = require('express');
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, uploadImage } = require('../Controllers/blogController');
const { protect, authorize } = require('../Middleware/auth');
const { upload } = require('../Middleware/upload');

const router = express.Router();

router.route('/')
    .get(getBlogs)
    .post(protect, authorize('superadmin'), createBlog);

router.post('/upload-image', protect, authorize('superadmin'), upload.single('image'), uploadImage);

router.route('/:id')
    .get(getBlog)
    .patch(protect, authorize('superadmin'), updateBlog)
    .delete(protect, authorize('superadmin'), deleteBlog);

module.exports = router;
