const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleLike
} = require('../Controllers/productController');
const { protect } = require('../Middleware/auth');

router.get('/outlet/:outletId', require('../Controllers/homePageController').getProductsByOutlet);

router.route('/')
    .get(getProducts)
    .post(protect, createProduct);

router.route('/:id')
    .get(getProduct)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

router.post('/:id/like', protect, toggleLike);

module.exports = router;
