const Product = require('../Models/Product');
const { getIO } = require('../Utils/socket');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
    try {
        // Fallback for customer side where req.user might be missing or salonId not on user
        const salonId = req.user?.salonId || req.query.salonId;
        
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID is required' });
        }

        const filter = { salonId };
        
        // Optional search/filter
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.categoryId) {
            filter.categoryId = req.query.categoryId;
        }

        const products = await Product.find(filter)
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
    try {
        req.body.salonId = req.user.salonId;
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        
        // Security: ensure it belongs to the salon
        if (product.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        
        if (product.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        await product.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Core toggle like logic (reusable for API and Socket)
const handleProductLikeToggle = async (productId, customerId, salonId) => {
    const product = await Product.findById(productId);
    if (!product) return null;

    const idStr = customerId.toString();
    const index = product.likedBy.findIndex(id => id.toString() === idStr);

    if (index === -1) {
        product.likedBy.push(customerId);
        product.likes += 1;
    } else {
        product.likedBy.splice(index, 1);
        product.likes = Math.max(0, product.likes - 1);
    }

    await product.save();

    // Broadcast update via socket
    try {
        const io = require('../Utils/socket').getIO();
        io.to(product.salonId.toString()).emit('product_liked', {
            productId: product._id,
            likes: product.likes,
            likedBy: product.likedBy
        });
    } catch (socketError) {
        console.error('Socket broadcast failed:', socketError);
    }

    return { 
        likes: product.likes, 
        isLiked: index === -1,
        likedBy: product.likedBy
    };
};

exports.toggleLike = async (req, res) => {
    try {
        const result = await handleProductLikeToggle(req.params.id, req.user._id, req.user.salonId);
        if (!result) return res.status(404).json({ success: false, error: 'Product not found' });
        
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.handleProductLikeToggle = handleProductLikeToggle;
