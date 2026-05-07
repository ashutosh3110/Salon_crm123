const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    removeFromCart,
    clearCart
} = require('../Controllers/cartController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.route('/')
    .get(getCart)
    .post(addToCart)
    .delete(clearCart);

router.delete('/:productId', removeFromCart);

module.exports = router;
