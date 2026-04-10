const User = require('../Models/User');

// @desc    Get all users for current salon
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const users = await User.find({ salonId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        let { email, name, role } = req.body;
        role = role ? role.toLowerCase() : 'stylist';

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const password = req.body.password || '123456';

        const user = await User.create({
            ...req.body,
            role,
            password,
            salonId: req.user.salonId
        });

        // Send Welcome Email
        try {
            const sendEmail = require('../Utils/sendEmail');
            await sendEmail({
                email: user.email,
                subject: 'Welcome to Salon CRM - Your Account Credentials',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #333; text-align: center;">Welcome to the Team!</h2>
                        <p>Hello <strong>${name}</strong>,</p>
                        <p>You have been added as <strong>${role}</strong> to our salon management system.</p>
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #D32F2F; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Temporary Password:</strong> ${password}</p>
                        </div>
                        <p>Please login and update your profile.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 11px; color: #777; text-align: center;">Team Salon CRM</p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Email sending failed during user creation:', emailErr);
        }

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Create User Error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only allow update if same salon
        if (user.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (req.body.role) {
            req.body.role = req.body.role.toLowerCase();
        }

        user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        if (!req.params.id || req.params.id === 'undefined') {
            return res.status(400).json({ success: false, message: 'Invalid User ID' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only allow delete if same salon
        if (user.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await user.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
