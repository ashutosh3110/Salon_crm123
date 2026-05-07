const Cart = require('../Models/Cart');
const Product = require('../Models/Product');

// @desc    Get customer cart
// @route   GET /api/cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ customerId: req.user._id })
            .populate('items.productId');

        if (!cart) {
            return res.status(200).json({ success: true, data: { items: [] } });
        }

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add or update cart item
// @route   POST /api/cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const customerId = req.user._id;
        const salonId = req.body.salonId || req.user.salonId;

        if (!salonId) {
            return res.status(400).json({ success: false, error: 'Salon ID is required' });
        }

        let cart = await Cart.findOne({ customerId });

        if (!cart) {
            cart = await Cart.create({
                customerId,
                salonId,
                items: [{ productId, quantity: quantity || 1 }]
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity = quantity;
            } else {
                // Add new item
                cart.items.push({ productId, quantity: quantity || 1 });
            }
            await cart.save();
        }

        const populatedCart = await cart.populate('items.productId');
        res.status(200).json({ success: true, data: populatedCart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Remove from cart
// @route   DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ customerId: req.user._id });
        if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
        await cart.save();

        const populatedCart = await cart.populate('items.productId');
        res.status(200).json({ success: true, data: populatedCart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ customerId: req.user._id });
        res.status(200).json({ success: true, data: { items: [] } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
