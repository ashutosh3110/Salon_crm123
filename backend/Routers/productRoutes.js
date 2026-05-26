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
const { protect, authorize } = require('../Middleware/auth');

router.get('/outlet/:outletId', require('../Controllers/homePageController').getProductsByOutlet);

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin', 'manager', 'p:inventory'), createProduct);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('admin', 'manager', 'p:inventory'), updateProduct)
    .delete(protect, authorize('admin', 'manager', 'p:inventory'), deleteProduct);

router.post('/:id/like', protect, toggleLike);

module.exports = router;
