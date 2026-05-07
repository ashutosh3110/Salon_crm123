const express = require('express');
const router = express.Router();
const {
    getProductCategories,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory
} = require('../Controllers/productCategoryController');
const { protect } = require('../Middleware/auth');

router.route('/')
    .get(getProductCategories)
    .post(protect, createProductCategory);

router.route('/:id')
    .put(protect, updateProductCategory)
    .delete(protect, deleteProductCategory);

module.exports = router;
