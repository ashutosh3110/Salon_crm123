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

        // Check active status
        if (userData.isActive === false) {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account is pending approval or has been suspended. Please contact support.' 
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
                    salonId: userData.salonId || (role === 'admin' ? userData._id : null)
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

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        let userData;
        if (req.user.role === 'admin') {
            userData = await Salon.findById(req.user.id);
        } else {
            userData = await User.findById(req.user.id);
        }

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: userData._id,
                name: userData.name || userData.ownerName,
                email: userData.email,
                phone: userData.phone,
                role: req.user.role,
                salonId: req.user.salonId
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update user details
// @route   PATCH /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            ownerName: req.body.name, // For Salon model
            email: req.body.email,
            phone: req.body.phone
        };

        let user;
        if (req.user.role === 'admin') {
            user = await Salon.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
                new: true,
                runValidators: true
            });
        } else {
            user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
                new: true,
                runValidators: true
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name || user.ownerName,
                email: user.email,
                phone: user.phone,
                role: req.user.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        let user;
        if (req.user.role === 'admin') {
            user = await Salon.findById(req.user.id).select('+password');
        } else {
            user = await User.findById(req.user.id).select('+password');
        }

        // Check current password
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = req.body.newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
