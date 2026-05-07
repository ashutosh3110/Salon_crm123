const Outlet = require('../Models/Outlet');
const Salon = require('../Models/Salon');
const { getIO } = require('../Utils/socket');

// @desc    Get all outlets for a salon
// @route   GET /api/outlets
// @access  Private
exports.getOutlets = async (req, res) => {
    try {
        // If superadmin, show ALL outlets. Otherwise, filter by salonId.
        const matchStage = req.user.role === 'superadmin' 
            ? {} 
            : { salonId: req.user.salonId };

        const outlets = await Outlet.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'outletId',
                    as: 'staff'
                }
            },
            {
                $addFields: {
                    staffCount: { 
                        $size: {
                            $filter: {
                                input: "$staff",
                                as: "s",
                                cond: { $ne: ["$$s.role", "customer"] }
                            }
                        }
                    }
                }
            },
            { $project: { staff: 0 } }
        ]);
        res.json({ success: true, count: outlets.length, data: outlets });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Get single outlet
// @route   GET /api/outlets/:id
// @access  Private
exports.getOutlet = async (req, res) => {
    try {
        const outlet = await Outlet.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });
        res.json({ success: true, data: outlet });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new outlet
// @route   POST /api/outlets
// @access  Private (Admin/Manager)
exports.createOutlet = async (req, res) => {
    try {
        const salon = await Salon.findById(req.user.salonId);
        const outletCount = await Outlet.countDocuments({ salonId: req.user.salonId });

        if (salon.limits?.outletLimit > 0 && outletCount >= salon.limits.outletLimit) {
            return res.status(400).json({ 
                success: false, 
                message: `Plan Limit Reached: Your ${salon.subscriptionPlan} plan only allows up to ${salon.limits.outletLimit} outlets.` 
            });
        }

        req.body.salonId = req.user.salonId;

        // Parse JSON strings from FormData
        if (typeof req.body.chairs === 'string') {
            try { req.body.chairs = JSON.parse(req.body.chairs); } catch (e) { req.body.chairs = []; }
        }
        if (typeof req.body.beds === 'string') {
            try { req.body.beds = JSON.parse(req.body.beds); } catch (e) { req.body.beds = []; }
        }
        if (typeof req.body.config === 'string') {
            try { req.body.config = JSON.parse(req.body.config); } catch (e) { req.body.config = {}; }
        }

        // Handle flat address fields from FormData
        if (!req.body.address || typeof req.body.address === 'string') {
            const street = req.body.address;
            req.body.address = {
                street: street || '',
                city: req.body.city || '',
                state: req.body.state || '',
                pincode: req.body.pincode || ''
            };
        }

        // Handle flat location fields from FormData
        if (req.body.latitude && req.body.longitude) {
            req.body.location = {
                type: 'Point',
                coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
            };
        }

        // Handle multiple local file uploads
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            const existingImages = Array.isArray(req.body.images) ? req.body.images : (req.body.images ? [req.body.images] : []);
            req.body.images = [...existingImages, ...newImages];
        }

        const outlet = await Outlet.create(req.body);

        res.status(201).json({ success: true, data: outlet });
    } catch (err) {
        console.error('Create outlet error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update outlet
// @route   PUT /api/outlets/:id
// @access  Private (Admin/Manager)
exports.updateOutlet = async (req, res) => {
    try {
        let outlet = await Outlet.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });

        // Parse JSON strings from FormData
        if (typeof req.body.chairs === 'string') {
            try { req.body.chairs = JSON.parse(req.body.chairs); } catch (e) { req.body.chairs = []; }
        }
        if (typeof req.body.beds === 'string') {
            try { req.body.beds = JSON.parse(req.body.beds); } catch (e) { req.body.beds = []; }
        }
        if (typeof req.body.config === 'string') {
            try { req.body.config = JSON.parse(req.body.config); } catch (e) { req.body.config = {}; }
        }

        // Handle flat address fields from FormData
        if (req.body.address && typeof req.body.address !== 'object') {
            const street = req.body.address;
            req.body.address = {
                street: street || outlet.address.street,
                city: req.body.city || outlet.address.city,
                state: req.body.state || outlet.address.state,
                pincode: req.body.pincode || outlet.address.pincode
            };
        }

        // Handle flat location fields from FormData
        if (req.body.latitude && req.body.longitude) {
            req.body.location = {
                type: 'Point',
                coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
            };
        }

        // Handle multiple local file uploads
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            const existingImages = Array.isArray(req.body.images) ? req.body.images : (req.body.images ? [req.body.images] : []);
            req.body.images = [...existingImages, ...newImages];
        }

        outlet = await Outlet.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: outlet });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete outlet
// @route   DELETE /api/outlets/:id
// @access  Private (Admin)
exports.deleteOutlet = async (req, res) => {
    try {
        const outlet = await Outlet.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });

        await outlet.deleteOne();
        res.json({ success: true, message: 'Outlet deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get nearby outlets or all outlets for discovery
// @route   GET /api/outlets/nearby
// @access  Public
exports.getNearbyOutlets = async (req, res) => {
    try {
        const { lat, lng, radius = 50 } = req.query; // radius in km, default 50
        let outlets;

        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);

            outlets = await Outlet.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [longitude, latitude] },
                        distanceField: "distance",
                        spherical: true,
                        maxDistance: parseFloat(radius) * 1000, // km to meters
                        distanceMultiplier: 0.001, // meters to km
                        query: { isActive: true }
                    }
                },
                {
                    $lookup: {
                        from: 'salons',
                        localField: 'salonId',
                        foreignField: '_id',
                        as: 'salon'
                    }
                },
                { $unwind: { path: '$salon', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        name: 1,
                        address: 1,
                        location: 1,
                        images: 1,
                        phone: 1,
                        isActive: 1,
                        distance: 1,
                        salonId: 1,
                        salonName: '$salon.name'
                    }
                }
            ]);
        } else {
            // No coordinates provided, just return all active outlets
            outlets = await Outlet.find({ isActive: true }).lean();
        }

        res.json({ success: true, count: outlets.length, data: outlets });
    } catch (err) {
        console.error('Nearby outlets error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reverse geocode mock (optional)
exports.reverseGeocode = async (req, res) => {
    res.json({ status: 'OK', displayAddress: 'Current Location', formattedAddress: 'Detecting...' });
};
// Core toggle like logic (reusable for API and Socket handler)
const handleOutletLikeToggle = async (outletId, customerId) => {
    const outlet = await Outlet.findById(outletId);
    if (!outlet) return null;

    const idStr = customerId.toString();
    const index = outlet.likedBy.findIndex(id => id.toString() === idStr);

    if (index === -1) {
        outlet.likedBy.push(customerId);
        outlet.likes += 1;
    } else {
        outlet.likedBy.splice(index, 1);
        outlet.likes = Math.max(0, outlet.likes - 1);
    }

    await outlet.save();

    // Broadcast update via socket
    try {
        const io = require('../Utils/socket').getIO();
        io.to(outlet.salonId.toString()).emit('outlet_liked', {
            outletId: outlet._id,
            likes: outlet.likes,
            likedBy: outlet.likedBy
        });
    } catch (socketError) {
        console.error('Socket broadcast failed:', socketError);
    }

    return { 
        likes: outlet.likes, 
        isLiked: index === -1,
        likedBy: outlet.likedBy
    };
};

exports.toggleLike = async (req, res) => {
    try {
        const result = await handleOutletLikeToggle(req.params.id, req.user._id);
        if (!result) return res.status(404).json({ success: false, message: 'Outlet not found' });
        
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.handleOutletLikeToggle = handleOutletLikeToggle;
