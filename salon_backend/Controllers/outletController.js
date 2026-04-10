const Outlet = require('../Models/Outlet');
const Salon = require('../Models/Salon');

// @desc    Get all outlets for a salon
// @route   GET /api/outlets
// @access  Private
exports.getOutlets = async (req, res) => {
    try {
        const outlets = await Outlet.aggregate([
            { $match: { salonId: req.user.salonId } },
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
        const outlet = await Outlet.create(req.body);

        res.status(201).json({ success: true, data: outlet });
    } catch (err) {
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
        const { lat, lng, radius = 5 } = req.query; // radius in km

        let query = { isActive: true };
        let outlets;

        if (lat && lng) {
            // Geospatial query
            outlets = await Outlet.find({
                isActive: true,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
                    }
                }
            }).lean();

            // Calculate distance for each outlet manually for the frontend if needed
            // Or use $geoNear aggregation for better distance info
            outlets = outlets.map(o => {
                // If using $near, order is already closest to farthest
                // We'll just add a distanceKm indicator (mock for now if not using aggregation)
                return { ...o, distanceKm: null }; 
            });
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
