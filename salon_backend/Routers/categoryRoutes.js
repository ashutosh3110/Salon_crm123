const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../Controllers/categoryController');
const { protect, authorize } = require('../Middleware/auth');

router
    .route('/')
    .get(protect, getCategories)
    .post(protect, authorize('admin', 'manager'), createCategory);

router
    .route('/:id')
    .put(protect, authorize('admin', 'manager'), updateCategory)
    .delete(protect, authorize('admin', 'manager'), deleteCategory);

module.exports = router;
