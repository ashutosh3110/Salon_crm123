const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleLike
} = require('../Controllers/productController');
const { protect } = require('../Middleware/auth');

router.route('/')
    .get(getProducts)
    .post(protect, createProduct);

router.route('/:id')
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

router.post('/:id/like', protect, toggleLike);

module.exports = router;
