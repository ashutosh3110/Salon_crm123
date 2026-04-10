const Plan = require('../Models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public (so users can see them during registration)
exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.find().lean();
        const Salon = require('../Models/Salon');
        
        // Calculate salon count dynamically for each plan
        const plansWithCount = await Promise.all(plans.map(async (plan) => {
            const count = await Salon.countDocuments({ 
                subscriptionPlan: { $regex: new RegExp(`^${plan.name}$`, 'i') } 
            });
            return { ...plan, salonsCount: count };
        }));

        res.json({ success: true, count: plansWithCount.length, data: plansWithCount });
    } catch (err) {
        console.error('Error fetching plans:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
// @access  Public
exports.getPlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.json({ success: true, data: plan });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create plan
// @route   POST /api/plans
// @access  Private/SuperAdmin
exports.createPlan = async (req, res) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).json({ success: true, data: plan });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private/SuperAdmin
exports.updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        // Dynamically sync updated features and limits to all salons using this plan
        const Salon = require('../Models/Salon');
        // Update all salons whose subscriptionPlan matches this plan's name (case-insensitive)
        await Salon.updateMany(
            { subscriptionPlan: { $regex: new RegExp(`^${plan.name}$`, 'i') } },
            { 
                $set: { 
                    features: plan.features || {},
                    limits: plan.limits || { staffLimit: 3, outletLimit: 1, whatsappLimit: 50 } 
                } 
            }
        );

        res.json({ success: true, data: plan });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private/SuperAdmin
exports.deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        await plan.deleteOne();
        res.json({ success: true, message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all available features (admin menus)
// @route   GET /api/plans/features/list
// @access  Private/SuperAdmin
exports.getFeatures = async (req, res) => {
    try {
        const features = [
            { key: 'pos', label: 'POS & Billing', desc: 'Generate bills, invoices and track payments' },
            { key: 'appointments', label: 'Bookings & Calendar', desc: 'Manage salon appointments and staff schedules' },
            { key: 'inventory', label: 'Inventory Management', desc: 'Track products, stock levels and purchase orders' },
            { key: 'marketing', label: 'Marketing Hub', desc: 'Campaigns, coupons and promotional tools' },
            { key: 'payroll', label: 'HR & Payroll', desc: 'Attendance, salary slips and staff performance' },
            { key: 'crm', label: 'Customer Relations (CRM)', desc: 'Wallets, segments and feedback management' },
            { key: 'loyalty', label: 'Loyalty Program', desc: 'Reward points and membership benefits' },
            { key: 'finance', label: 'Finance & Expense', desc: 'Expense tracking, GST reports and cash management' },
            { key: 'mobileApp', label: 'Mobile App Presence', desc: 'Digital presence and app connectivity' },
            { key: 'whatsapp', label: 'WhatsApp Automation', desc: 'Send automated reminders and notifications' },
            { key: 'reports', label: 'Advanced Analytics', desc: 'In-depth business reports and insights' },
            { key: 'feedback', label: 'Digital Feedback', desc: 'Collect and analyze customer reviews' }
        ];
        res.json({ success: true, data: features });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

