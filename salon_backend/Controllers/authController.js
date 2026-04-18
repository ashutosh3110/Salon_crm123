const User = require('../Models/User');
const Salon = require('../Models/Salon');
const Staff = require('../Models/Staff');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Try to find in SuperAdmin / Salon Admin (User collection)
        let userData = await User.findOne({ email }).select('+password');
        let role = userData ? userData.role : null;

        // 2. Try to find in Staff (Salon employees/managers)
        if (!userData) {
            userData = await Staff.findOne({ email }).select('+password');
            if (userData) role = userData.role;
        }

        // 3. Try specifically for Salon Owner
        if (!userData) {
            userData = await Salon.findOne({ email }).select('+password');
            if (userData) role = 'admin'; // Owner is treated as admin
        }

        if (!userData) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // 4. Status Checks
        if (userData.isActive === false) {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account is currently inactive. Please contact support.' 
            });
        }

        if (userData.status === 'suspended') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access is suspended. Please contact Admin.' 
            });
        }

        // Check password
        const isMatch = await userData.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Determine Salon ID and fetch subscription info
        const salonId = userData.salonId || (role === 'admin' && userData.constructor.modelName === 'Salon' ? userData._id : null);
        let subscriptionPlan = 'none';
        let salonIsActive = false;

        if (salonId) {
            const salon = await Salon.findById(salonId);
            if (salon) {
                subscriptionPlan = salon.subscriptionPlan || 'none';
                salonIsActive = salon.isActive;
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { id: userData._id, role: role, salonId: salonId },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            data: {
                accessToken: token,
                user: {
                    id: userData._id,
                    name: userData.name || userData.ownerName,
                    email: userData.email,
                    role: role,
                    salonId: salonId,
                    status: userData.status || 'active',
                    subscriptionPlan: subscriptionPlan,
                    salonIsActive: salonIsActive
                }
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check across all 3 admin-tier collections
        let userData = await User.findOne({ email });
        if (!userData) userData = await Staff.findOne({ email });
        if (!userData) userData = await Salon.findOne({ email });

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email'
            });
        }

        const sendEmail = require('../Utils/sendEmail');
        const Otp = require('../Models/Otp');
        
        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database (valid for 10 minutes)
        await Otp.create({
            phone: email, // Using phone field for email as identifier in Otp model
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendEmail({
            email: userData.email,
            subject: 'Password Reset OTP - Wapixo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Forgot Password?</h2>
                    <p>Hello <strong>${userData.name || userData.ownerName}</strong>,</p>
                    <p>You requested a password reset. Please use the following 6-digit OTP:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="letter-spacing: 5px; color: #D32F2F; margin: 0;">${otp}</h1>
                    </div>
                </div>
            `
        });

        res.json({ success: true, message: 'OTP sent to your email' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const Otp = require('../Models/Otp');

        const otpRecord = await Otp.findOne({ phone: email, otp });

        if (otpRecord && otpRecord.expiresAt > new Date()) {
            res.json({ success: true, message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const Otp = require('../Models/Otp');
        const otpRecord = await Otp.findOne({ phone: email, otp });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Find across collections
        let Model = User;
        let userData = await User.findOne({ email });
        
        if (!userData) { 
            userData = await Staff.findOne({ email });
            Model = Staff;
        }
        if (!userData) {
            userData = await Salon.findOne({ email });
            Model = Salon;
        }

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        userData.password = password;
        await userData.save();

        res.json({ success: true, message: 'Password reset successful.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user is set by protect middleware
        res.json({
            success: true,
            data: req.user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };

        let Model;
        if (req.user.role === 'superadmin') Model = User;
        else if (req.user.role === 'admin' && !req.user.salonId) Model = Salon;
        else if (req.user.role === 'customer') {
            const Customer = require('../Models/Customer');
            Model = Customer;
        } else {
            Model = Staff;
        }

        const user = await Model.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        let Model;
        if (req.user.role === 'superadmin') Model = User;
        else if (req.user.role === 'admin' && !req.user.ownerName) Model = Salon; 
        else if (req.user.role === 'customer') {
            const Customer = require('../Models/Customer');
            Model = Customer;
        } else {
            Model = Staff;
        }

        const user = await Model.findById(req.user._id).select('+password');

        if (!(await user.comparePassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = req.body.newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};