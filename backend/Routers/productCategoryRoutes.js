const express = require('express');
const router = express.Router();
const {
    getProductCategories,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory
} = require('../Controllers/productCategoryController');
const { protect, authorize } = require('../Middleware/auth');

router.route('/')
    .get(getProductCategories)
    .post(protect, authorize('admin', 'manager', 'p:inventory'), createProductCategory);

router.route('/:id')
    .put(protect, authorize('admin', 'manager', 'p:inventory'), updateProductCategory)
    .delete(protect, authorize('admin', 'manager', 'p:inventory'), deleteProductCategory);

module.exports = router;
