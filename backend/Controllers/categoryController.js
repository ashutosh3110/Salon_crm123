const Category = require('../Models/Category');

// @desc    Get all categories for salon
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
    try {
        let salonId = req.user?.salonId;
        
        // If superadmin, allow overriding via query
        if (req.user?.role === 'superadmin' && req.query.salonId) {
            salonId = req.query.salonId;
        }

        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID is required' });
        }

        const categories = await Category.find({ salonId })
            .populate('serviceCount')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        // Handle local file upload path
        if (req.file) {
            req.body.image = `/uploads/categories/${req.file.filename}`;
        }

        const category = await Category.create({
            ...req.body,
            salonId
        });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const salonId = req.user?.salonId;
        
        // Ensure the category belongs to the salon
        const categoryCheck = await Category.findOne({ _id: req.params.id, salonId });
        if (!categoryCheck) {
            return res.status(404).json({ success: false, message: "Category not found or unauthorized access" });
        }

        // Handle local file upload path
        if (req.file) {
            req.body.image = `/uploads/categories/${req.file.filename}`;
        }

        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        if (category.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await category.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
