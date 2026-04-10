const Salon = require('../Models/Salon');
const User = require('../Models/User');
const sendEmail = require('../Utils/sendEmail');

// @desc    Create a new salon and its admin
// @route   POST /api/salons
// @access  Private/SuperAdmin
exports.createSalon = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            ownerName, 
            email, 
            phone, 
            gstNumber, 
            address, // This is 'street' from frontend
            city,
            password 
        } = req.body;

        const adminPassword = password || '123456';

        // 1. Check if salon or admin already exists
        const existingSalon = await Salon.findOne({ email });
        if (existingSalon) {
            return res.status(400).json({ success: false, message: 'Salon with this email already exists' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // 2. Create Salon
        const salon = await Salon.create({
            name,
            description,
            ownerName,
            email,
            phone,
            gstNumber,
            address: {
                street: address,
                city: city
            },
            status: 'active', // Direct approved
            isActive: true
        });

        // 3. Create Admin User for this salon
        const user = await User.create({
            name: ownerName,
            email,
            password: adminPassword,
            role: 'admin',
            salonId: salon._id,
            isActive: true // Direct approved
        });

        // 4. Send Onboarding Email
        try {
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333 text-align: center;">Welcome to ${process.env.EMAIL_FROM_NAME}!</h2>
                    <p>Dear <strong>${ownerName}</strong>,</p>
                    <p>Congratulations! Your salon, <strong>${name}</strong>, has been successfully registered on our platform.</p>
                    <p>You can now log in to your dashboard using the following credentials:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="${process.env.FRONTEND_BASE_URL}">${process.env.FRONTEND_BASE_URL}</a></p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${adminPassword}</p>
                    </div>
                    <p>Please log in and complete your profile setup. For security reasons, we recommend changing your password after your first login.</p>
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777; text-align: center;">Best Regards,<br>Team ${process.env.EMAIL_FROM_NAME}</p>
                </div>
            `;

            await sendEmail({
                email: email,
                subject: `Welcome to ${process.env.EMAIL_FROM_NAME} - Your Salon Account is Ready!`,
                html: html
            });
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
            // We don't want to fail the whole request if email fails, but we log it
        }

        res.status(201).json({
            success: true,
            message: 'Salon and Admin created successfully. Onboarding email sent.',
            data: {
                salon,
                admin: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (err) {
        console.error('Error creating salon:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message || 'Server Error' 
        });
    }
};

// @desc    Get all salons
// @route   GET /api/salons
// @access  Private/SuperAdmin
exports.getSalons = async (req, res) => {
    try {
        const salons = await Salon.find();
        res.json({ success: true, count: salons.length, data: salons });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single salon
// @route   GET /api/salons/:id
// @access  Private/SuperAdmin
exports.getSalon = async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);

        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        res.json({ success: true, data: salon });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update salon
// @route   PUT /api/salons/:id
// @access  Private/SuperAdmin
exports.updateSalon = async (req, res) => {
    try {
        let salon = await Salon.findById(req.params.id);

        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        salon = await Salon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: salon });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete salon
// @route   DELETE /api/salons/:id
// @access  Private/SuperAdmin
exports.deleteSalon = async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);

        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        // Delete all users associated with this salon
        await User.deleteMany({ salonId: req.params.id });

        // Delete the salon
        await salon.deleteOne();

        res.json({ success: true, message: 'Salon and associated users deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get salon statistics
// @route   GET /api/salons/stats
// @access  Private/SuperAdmin
exports.getSalonStats = async (req, res) => {
    try {
        const totalSalons = await Salon.countDocuments();
        const activeCount = await Salon.countDocuments({ status: 'active' });
        const trialCount = await Salon.countDocuments({ status: 'trial' });
        const expiredCount = await Salon.countDocuments({ status: 'expired' });
        const suspendedCount = await Salon.countDocuments({ status: 'suspended' });

        res.json({
            success: true,
            data: {
                totalSalons,
                countsByStatus: [
                    { _id: 'active', count: activeCount },
                    { _id: 'trial', count: trialCount },
                    { _id: 'expired', count: expiredCount },
                    { _id: 'suspended', count: suspendedCount }
                ]
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
