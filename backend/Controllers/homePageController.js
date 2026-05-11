const mongoose = require('mongoose');
const Cms = require('../Models/Cms');
const Outlet = require('../Models/Outlet');
const Service = require('../Models/Service');
const Product = require('../Models/Product');
const Feedback = require('../Models/Feedback');
const MembershipPlan = require('../Models/MembershipPlan');
const Setting = require('../Models/Setting');

// 1. Fetch Banners (Global + Tenant Specific)
exports.getBanners = async (req, res) => {
    try {
        const tenantId = req.query.tenantId;
        console.log(`[CMS] Fetching banners. tenantId: ${tenantId}`);

        let query = { section: 'banners' };
        if (tenantId && mongoose.Types.ObjectId.isValid(tenantId)) {
            // Fetch both global (null) and specific tenant banners
            query.tenantId = { $in: [null, new mongoose.Types.ObjectId(tenantId)] };
        } else {
            // If no tenantId, only fetch global banners
            query.tenantId = null;
        }

        const cmsData = await Cms.find(query);
        // Merge all banners from found documents
        const banners = cmsData.reduce((acc, curr) => [...acc, ...(curr.content || [])], []);
        
        res.json({ success: true, data: banners });
    } catch (error) {
        console.error('getBanners error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 2. Other Nearest Salon / Outlets
exports.getNearestOutlets = async (req, res) => {
    try {
        const { lat, lng, radius = 50 } = req.query;
        let query = { isActive: true };

        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(radius) * 1000
                }
            };
        }

        let outlets = await Outlet.find(query).limit(10);
        
        // Fallback: If no nearby outlets found with coordinates, return all active outlets
        if (outlets.length === 0 && lat && lng) {
            outlets = await Outlet.find({ isActive: true }).limit(10);
        }

        res.json({ success: true, data: outlets });
    } catch (error) {
        console.error('getNearestOutlets error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 3. Services by Outlet
exports.getServicesByOutlet = async (req, res) => {
    try {
        const { outletId } = req.params;
        const services = await Service.find({ 
            $or: [
                { outletIds: outletId },
                { outletIds: { $size: 0 } },
                { outletIds: { $exists: false } },
                { outletId: outletId },
                { outletId: 'all' }
            ]
        });
        res.json({ success: true, data: services });
    } catch (error) {
        console.error('getServicesByOutlet error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// 3.5. Service Categories by Outlet
exports.getServiceCategoriesByOutlet = async (req, res) => {
    try {
        const { outletId } = req.params;
        // In this system, categories are global per salon, not specifically tied to outlets in the Category model? 
        // Let's check Outlet to Salon relationship, then fetch categories for that Salon.
        const outlet = await Outlet.findById(outletId);
        if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });
        
        const Category = require('../Models/Category');
        const categories = await Category.find({ salonId: outlet.salonId, status: 'active' });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('getServiceCategoriesByOutlet error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 4. Products by Outlet
exports.getProductsByOutlet = async (req, res) => {
    try {
        const { outletId } = req.params;
        const products = await Product.find({
            $or: [
                { outletIds: outletId },
                { outletIds: { $size: 0 } },
                { outletIds: { $exists: false } },
                { outletId: outletId },
                { outletId: 'all' }
            ]
        });
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('getProductsByOutlet error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 5. Trusted Reviews
exports.getTrustedReviews = async (req, res) => {
    try {
        const { outletId } = req.params;
        // Trusted review check by rating >= 4
        const reviews = await Feedback.find({ 
            outletId: outletId,
            status: 'Approved',
            rating: { $gte: 4 }
        }).sort({ createdAt: -1 }).limit(10);
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('getTrustedReviews error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 6. Membership Plans
exports.getMembershipPlans = async (req, res) => {
    try {
        const { outletId } = req.params;
        const outlet = await Outlet.findById(outletId);
        if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });
        
        const plans = await MembershipPlan.find({ salonId: outlet.salonId, isActive: true });
        res.json({ success: true, data: plans });
    } catch (error) {
        console.error('getMembershipPlans error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 7. Loyalty Rules
exports.getLoyaltyRules = async (req, res) => {
    try {
        const setting = await Setting.findOne();
        if (setting && setting.loyaltySettings) {
            return res.json({ success: true, data: setting.loyaltySettings });
        }
        // Fallback default to ensure UI shows something
        res.json({ 
            success: true, 
            data: {
                active: true,
                pointsRate: 100,
                redeemValue: 1,
                minRedeemPoints: 0
            } 
        });
    } catch (error) {
        console.error('getLoyaltyRules error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
