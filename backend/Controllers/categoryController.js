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

// @desc    Bulk Import Categories
// @route   POST /api/categories/bulk-import
// @access  Private (Admin)
exports.bulkImportCategories = async (req, res) => {
    try {
        const XLSX = require('xlsx');
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Use buffer since optimizedUpload uses memoryStorage
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const salonId = req.user.salonId;
        const results = {
            totalRows: data.length,
            importedCount: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Helper to get value case-insensitively
                const getValue = (keys) => {
                    for (const key of keys) {
                        if (row[key] !== undefined) return row[key];
                    }
                    return undefined;
                };

                const name = getValue(['Name', 'name', 'Category Name', 'category name']);
                const gender = getValue(['Gender', 'gender', 'Demographic', 'demographic']);
                const status = getValue(['Status', 'status']);

                // Basic validation
                if (!name) {
                    results.errors.push(`Row ${i + 1}: Name is required`);
                    continue;
                }

                // Check if category already exists for this salon
                const existing = await Category.findOne({ salonId, name: new RegExp(`^${name}$`, 'i') });
                if (existing) {
                    results.errors.push(`Row ${i + 1}: Category "${name}" already exists`);
                    continue;
                }

                await Category.create({
                    name: name,
                    gender: (gender || 'both').toLowerCase(),
                    status: (status || 'active').toLowerCase(),
                    salonId: salonId
                });
                results.importedCount++;
            } catch (err) {
                results.errors.push(`Row ${i + 1}: ${err.message}`);
            }
        }

        res.json({ success: true, ...results });
    } catch (err) {
        console.error('Bulk Import Categories Error:', err);
        res.status(500).json({ success: false, message: 'Server Error during import' });
    }
};
