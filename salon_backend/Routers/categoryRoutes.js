const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../Controllers/categoryController');
const { optimizedUpload } = require('../Middleware/upload');
const { processToWebP } = require('../Middleware/imageProcessor');
const { protect, authorize } = require('../Middleware/auth');

router
    .route('/')
    .get(protect, getCategories)
    .post(protect, authorize('admin', 'manager'), optimizedUpload.single('image'), processToWebP('categories'), createCategory);

router
    .route('/:id')
    .put(protect, authorize('admin', 'manager'), optimizedUpload.single('image'), processToWebP('categories'), updateCategory)
    .delete(protect, authorize('admin', 'manager'), deleteCategory);

module.exports = router;
