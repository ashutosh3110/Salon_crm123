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
        
        // Handle local file upload path
        if (req.file) {
            req.body.image = `/uploads/services/${req.file.filename}`;
        }

        const service = await Service.create({
            ...req.body,
            salonId
        });
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin)
exports.updateService = async (req, res) => {
    try {
        const salonId = req.user?.salonId;
        
        // Ensure the service belongs to the salon
        const serviceCheck = await Service.findOne({ _id: req.params.id, salonId });
        if (!serviceCheck) {
            return res.status(404).json({ success: false, message: "Service not found or unauthorized access" });
        }

        // Handle local file upload path
        if (req.file) {
            req.body.image = `/uploads/services/${req.file.filename}`;
        }

        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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

// @desc    Bulk Import Services
// @route   POST /api/services/bulk-import
// @access  Private (Admin)
exports.bulkImportServices = async (req, res) => {
    try {
        const XLSX = require('xlsx');
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Use buffer instead of path since optimizedUpload uses memoryStorage
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

        const Outlet = require('../Models/Outlet');
        const allOutlets = await Outlet.find({ salonId });

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Explicitly initialize outletIds as empty for every row
                let outletIds = [];

                // Helper to get value case-insensitively
                const getValue = (keys) => {
                    for (const key of keys) {
                        if (row[key] !== undefined) return row[key];
                    }
                    return undefined;
                };

                const name = getValue(['Name', 'name', 'Service Name', 'service name']);
                const price = getValue(['Price', 'price', 'Service Price', 'service price']);
                const category = getValue(['Category', 'category', 'Service Category', 'service category']);
                const duration = getValue(['Duration (mins)', 'duration (mins)', 'Duration', 'duration']);
                const description = getValue(['Description', 'description']);
                const gst = getValue(['GST %', 'gst %', 'GST', 'gst']);
                const gender = getValue(['Gender', 'gender']);
                const commApp = getValue(['Commission Applicable', 'commission applicable']);
                const commType = getValue(['Commission Type', 'commission type']);
                const commVal = getValue(['Commission Value', 'commission value']);
                const resType = getValue(['Resource Type', 'resource type']);
                const outletInput = getValue(['Outlets (Comma Separated)', 'outlets (comma separated)', 'Outlets', 'outlets']);

                // Basic validation
                if (!name || !price) {
                    results.errors.push(`Row ${i + 1}: Name and Price are required`);
                    continue;
                }
                
                // Map outlet names to IDs only if provided and not empty
                if (outletInput && typeof outletInput === 'string' && outletInput.trim()) {
                    const names = outletInput.split(',').map(n => n.trim().toLowerCase()).filter(n => n !== '');
                    if (names.length > 0) {
                        outletIds = allOutlets
                            .filter(o => names.includes(o.name.toLowerCase()))
                            .map(o => o._id);
                    }
                }

                await Service.create({
                    name: name,
                    category: category || 'Uncategorized',
                    price: parseFloat(price),
                    duration: parseInt(duration) || 30,
                    description: description || '',
                    gst: parseFloat(gst) || 0,
                    gender: (gender || 'both').toLowerCase(),
                    commissionApplicable: (commApp || 'yes').toLowerCase() === 'yes',
                    commissionType: (commType || 'percent').toLowerCase(),
                    commissionValue: parseFloat(commVal) || 0,
                    resourceType: (resType || 'chair').toLowerCase(),
                    outletIds: outletIds,
                    salonId: salonId,
                    status: 'active'
                });
                results.importedCount++;
            } catch (err) {
                results.errors.push(`Row ${i + 1}: ${err.message}`);
            }
        }

        res.json({ success: true, ...results });
    } catch (err) {
        console.error('Bulk Import Error:', err);
        res.status(500).json({ success: false, message: 'Server Error during import' });
    }
};
