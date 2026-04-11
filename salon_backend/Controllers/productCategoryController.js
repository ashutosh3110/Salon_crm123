const ProductCategory = require('../Models/ProductCategory');

// @desc    Get all product categories for a salon
// @route   GET /api/product-categories
// @access  Private
exports.getProductCategories = async (req, res) => {
    try {
        const salonId = req.user?.salonId || req.query.salonId;
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID is required' });
        }
        const categories = await ProductCategory.find({ salonId });
        res.json({ success: true, count: categories.length, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new product category
// @route   POST /api/product-categories
// @access  Private
exports.createProductCategory = async (req, res) => {
    try {
        req.body.salonId = req.user.salonId;
        const category = await ProductCategory.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update product category
// @route   PUT /api/product-categories/:id
// @access  Private
exports.updateProductCategory = async (req, res) => {
    try {
        let category = await ProductCategory.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        category = await ProductCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete product category
// @route   DELETE /api/product-categories/:id
// @access  Private
exports.deleteProductCategory = async (req, res) => {
    try {
        const category = await ProductCategory.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        await category.deleteOne();
        res.json({ success: true, message: 'Category removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
