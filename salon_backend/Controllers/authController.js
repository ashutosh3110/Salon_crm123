const User = require('../Models/User');
const Salon = require('../Models/Salon');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Try to find in User collection (SuperAdmin, Staff, etc.)
        let user = await User.findOne({ email });
        let role = user ? user.role : null;
        let userData = user;

        // 2. If not found, try to find in Salon collection (Salon Owners)
        if (!user) {
            const salon = await Salon.findOne({ email });
            if (salon) {
                userData = salon;
                role = 'admin'; // Salons are treated as admins
            }
        }

        if (!userData) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
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

        // Generate JWT
        const token = jwt.sign(
            { id: userData._id, role: role, salonId: userData.salonId || (role === 'admin' ? userData._id : null) },
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
                    salonId: userData.salonId || (role === 'admin' ? userData._id : null),
                    planStatus: userData.planStatus || 'none',
                    status: userData.status || 'active'
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

        // 1. Check User collection
        let userData = await User.findOne({ email });
        
        // 2. Check Salon collection if not found
        if (!userData) {
            userData = await Salon.findOne({ email });
        }

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email'
            });
        }

        const sendEmail = require('../Utils/sendEmail');
        const otp = '123456'; // As requested: "otp bhejo 6 digit ka 123456"

        await sendEmail({
            email: userData.email,
            subject: 'Password Reset OTP - Wapixo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Forgot Password?</h2>
                    <p>Hello <strong>${userData.name || userData.ownerName}</strong>,</p>
                    <p>You requested a password reset. Please use the following 6-digit OTP to verify your identity:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="letter-spacing: 5px; color: #D32F2F; margin: 0;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 11px; color: #777; text-align: center;">Team Wapixo</p>
                </div>
            `
        });

        res.json({
            success: true,
            message: 'OTP sent to your email address'
        });

    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (otp === '123456') {
            res.json({
                success: true,
                message: 'OTP verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (otp !== '123456') {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // 1. Check User collection
        let userData = await User.findOne({ email });
        
        // 2. Check Salon collection if not found
        if (!userData) {
            userData = await Salon.findOne({ email });
        }

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password (pre-save hook will hash it)
        userData.password = password;
        await userData.save();

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user details
// @route   PATCH /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
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

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
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
        res.status(500).json({ success: false, message: 'Server error' });
    }
};