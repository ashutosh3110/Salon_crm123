const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../Controllers/categoryController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getCategories)
    .post(authorize('admin', 'manager'), createCategory);

router
    .route('/:id')
    .put(authorize('admin', 'manager'), updateCategory)
    .delete(authorize('admin', 'manager'), deleteCategory);

module.exports = router;
