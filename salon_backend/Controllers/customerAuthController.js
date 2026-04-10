const User = require('../Models/User');
const jwt = require('jsonwebtoken');

// @desc    Request OTP for customer login
// @route   POST /api/auth/request-otp
// @access  Public
exports.requestOtp = async (req, res) => {
    try {
        const { phone, tenantId } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // In a real app, send OTP via SMS. Here we return 123456 for testing/demo.
        const otp = '123456';

        // Check if user exists, if not, we can still "send OTP" 
        // and handle registration during verify-otp or in a separate step.
        // Frontend handles step 3 (profile completion) if user is new.

        res.json({
            success: true,
            message: 'OTP sent successfully',
            otp: otp // Returning for demo purposes
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
        const { phone, otp, tenantId, referralCode } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        if (otp !== '123456') {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Find or create customer
        let user = await User.findOne({ phone, role: 'customer' });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await User.create({
                name: 'New Customer', // Placeholder, updated in profile completion
                email: `cust_${Date.now()}@wapixo.com`, // Placeholder
                phone,
                password: Math.random().toString(36).slice(-8), // Dummy password
                role: 'customer',
                salonId: tenantId, // Optional: link to the salon where they first login
                status: 'active'
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, salonId: user.salonId },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            data: {
                accessToken: token,
                client: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                    isNewUser: isNewUser || user.name === 'New Customer'
                }
            }
        });

    } catch (err) {
        console.error('Customer login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Register a new customer (optional, prior to OTP)
// @route   POST /api/auth/register-customer
// @access  Public
exports.registerCustomer = async (req, res) => {
    try {
        const { phone, name, email, password, tenantId, dob, anniversary } = req.body;

        let user = await User.findOne({ phone, role: 'customer' });
        if (user) {
            return res.status(400).json({ success: false, message: 'Customer already exists. Please login.' });
        }

        user = await User.create({
            phone,
            name,
            email,
            password: password || '123456',
            role: 'customer',
            salonId: tenantId,
            dob,
            address: anniversary, // Using address field for anniversary for now if not in model
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: user
        });
    } catch (err) {
        console.error('Register customer error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};
