const Service = require('../Models/Service');
const Category = require('../Models/Category');

// @desc    Get all services for salon
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res) => {
    try {
        let salonId = req.user?.salonId;
        
        // If superadmin, allow overriding via query
        if (req.user?.role === 'superadmin' && req.query.salonId) {
            salonId = req.query.salonId;
        }

        const outletId = req.query.outletId;

        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID is required' });
        }

        let query = { salonId };

        if (outletId) {
            // Service is available for this outlet IF:
            // 1. the outletId is in the outletIds array
            // 2. OR the outletIds array is empty (meaning it's common for all outlets)
            query.$or = [
                { outletIds: outletId },
                { outletIds: { $size: 0 } },
                { outletIds: { $exists: false } }
            ];
        }

        const services = await Service.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (err) {
        console.error('Get Services Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Private
exports.getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.json({
            success: true,
            data: service
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create service
// @route   POST /api/services
// @access  Private (Admin)
exports.createService = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        
        const service = await Service.create({
            ...req.body,
            salonId
        });

        res.status(201).json({
            success: true,
            data: service
        });
    } catch (err) {
        console.error('Create Service Error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin)
exports.updateService = async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Check ownership
        if (service.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: service
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Check ownership
        if (service.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await service.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get services grouped by category
// @route   GET /api/services/grouped
// @access  Public
exports.getServicesGrouped = async (req, res) => {
    try {
        const salonId = req.query.salonId || req.query.tenantId;
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID is required' });
        }

        // Fetch all categories for this salon
        const categories = await Category.find({ salonId, status: 'active' }).lean();
        
        // Fetch all active services for this salon
        const services = await Service.find({ salonId, status: 'active' }).lean();

        // Group services by category
        const grouped = categories.map(cat => {
            return {
                ...cat,
                services: services.filter(s => 
                    s.category === cat.name || String(s.category) === String(cat._id)
                )
            };
        }).filter(group => group.services.length > 0);

        res.json({
            success: true,
            data: grouped
        });
    } catch (err) {
        console.error('Get Grouped Services Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
