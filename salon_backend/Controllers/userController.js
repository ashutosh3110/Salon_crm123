const Staff = require('../Models/Staff');

// @desc    Get all staff members for current salon
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const salonId = req.user.role === 'customer' ? req.query.salonId : req.user.salonId;
        
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID is required' });
        }

        const staff = await Staff.find({ salonId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single staff member
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const staff = await Staff.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        res.json({
            success: true,
            data: staff
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new staff member
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        let { email, name, role, phone, password, outletId } = req.body;
        role = role ? role.toLowerCase() : 'stylist';

        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: 'Staff member already exists with this email' });
        }

        const pass = password || '123456';

        // Handle uploaded avatar
        const avatarPath = req.file ? req.file.path : undefined;

        const staff = await Staff.create({
            name,
            email,
            phone,
            role,
            avatar: avatarPath,
            password: pass,
            outletId,
            salonId: req.user.salonId
        });

        // Send Welcome Email
        try {
            const sendEmail = require('../Utils/sendEmail');
            await sendEmail({
                email: staff.email,
                subject: 'Welcome to the Team - Your Account Credentials',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #333; text-align: center;">Welcome to the Team!</h2>
                        <p>Hello <strong>${name}</strong>,</p>
                        <p>You have been added as <strong>${role}</strong> to our salon management system.</p>
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #D32F2F; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Temporary Password:</strong> ${pass}</p>
                        </div>
                        <p>Please login and update your profile.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 11px; color: #777; text-align: center;">Team Salon CRM</p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Email sending failed during staff creation:', emailErr);
        }

        res.status(201).json({
            success: true,
            data: staff
        });
    } catch (err) {
        console.error('Create Staff Error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Update staff member
// @route   PATCH /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        let staff = await Staff.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        if (req.body.role) {
            req.body.role = req.body.role.toLowerCase();
        }

        // Handle uploaded avatar
        if (req.file) {
            req.body.avatar = req.file.path;
        }

        const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: updatedStaff
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete staff member
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const staff = await Staff.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        await Staff.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Staff member removed successfully'
        });
    } catch (err) {
        console.error('Delete staff error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
