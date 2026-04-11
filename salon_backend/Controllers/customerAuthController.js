const Customer = require('../Models/Customer');
const Product = require('../Models/Product');
const Outlet = require('../Models/Outlet');
const jwt = require('jsonwebtoken');



// @desc    Get customer favorites (products & salons)
// @route   GET /api/auth/favorites
// @access  Private (Customer)
exports.getFavorites = async (req, res) => {
    try {
        const customerId = req.user._id;
        console.log(`[Favorites] Fetching for customer: ${customerId}`);

        const [products, outlets] = await Promise.all([
            Product.find({ likedBy: customerId }).populate('categoryId', 'name'),
            Outlet.find({ likedBy: customerId })
        ]);

        console.log(`[Favorites] Found ${products.length} products, ${outlets.length} outlets`);

        res.json({
            success: true,
            data: {
                products,
                outlets
            }
        });

    } catch (err) {
        console.error('Get favorites error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Request OTP for customer login
// @route   POST /api/auth/request-otp
// @access  Public
exports.requestOtp = async (req, res) => {
    try {
        const { phone, tenantId } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // Return a fixed OTP for demo/testing as requested
        const otp = '1234';

        res.json({
            success: true,
            message: 'OTP sent successfully',
            otp: otp 
        });

    } catch (err) {
        console.error('Request OTP error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify OTP and login/register customer
// @route   POST /api/auth/login-otp
// @access  Public
exports.customerLoginOtp = async (req, res) => {
    try {
        const { phone, otp, tenantId } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        if (otp !== '1234') {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (!tenantId) {
            return res.status(400).json({ success: false, message: 'Salon context (tenantId) is required' });
        }

        // Find or create customer for this specific salon
        let customer = await Customer.findOne({ phone, salonId: tenantId });
        let isNewUser = false;

        if (!customer) {
            isNewUser = true;
            customer = await Customer.create({
                name: 'New Customer',
                phone,
                salonId: tenantId,
                status: 'active'
            });
        }

        customer.lastLogin = new Date();
        await customer.save();

        const token = jwt.sign(
            { id: customer._id, role: 'customer', salonId: customer.salonId },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            data: {
                accessToken: token,
                client: {
                    _id: customer._id,
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    role: 'customer',
                    isNewUser: isNewUser || customer.name === 'New Customer'
                }
            }
        });

    } catch (err) {
        console.error('Customer login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Register a new customer (Advanced profile)
// @route   POST /api/auth/register-customer
// @access  Public
exports.registerCustomer = async (req, res) => {
    try {
        const { phone, name, email, tenantId, dob, anniversary, gender } = req.body;

        if (!tenantId) {
            return res.status(400).json({ success: false, message: 'Salon ID is required' });
        }

        let customer = await Customer.findOne({ phone, salonId: tenantId });
        if (customer) {
            return res.status(400).json({ success: false, message: 'Customer already exists for this salon.' });
        }

        customer = await Customer.create({
            phone,
            name,
            email,
            salonId: tenantId,
            dob,
            anniversary,
            gender: gender || 'women',
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: customer
        });
    } catch (err) {
        console.error('Register customer error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// @desc    Update customer profile
// @route   PATCH /api/auth/profile
// @access  Private (Customer)
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, gender, avatar, birthday } = req.body;
        
        const customer = await Customer.findById(req.user.id);
        
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Update fields if provided
        if (name) customer.name = name;
        if (email) customer.email = email;
        if (gender) customer.gender = gender;
        if (avatar) customer.avatar = avatar;
        if (birthday) customer.dob = birthday; // Birthday mapped to dob in model

        await customer.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: customer
        });

    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get customer profile
// @route   GET /api/auth/profile
// @access  Private (Customer)
exports.getProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id);
        
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({
            success: true,
            data: customer
        });

    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
