const Salon = require('../Models/Salon');
const User = require('../Models/User');
const Plan = require('../Models/Plan');
const sendEmail = require('../Utils/sendEmail');
const bcrypt = require('bcryptjs');

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

        console.log('Incoming Create Salon Request:', { name, email, password });
        const adminPassword = password || '123456';
        console.log('Using Admin Password:', adminPassword);
        
        // Hash the password manually for the User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        console.log('Hashed Password Generated:', hashedPassword);

        // 1. Check if salon or admin already exists
        const existingSalon = await Salon.findOne({ email });
        if (existingSalon) {
            return res.status(400).json({ success: false, message: 'Salon with this email already exists' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Fetch default features and limits from the plan (default: free)
        const planName = req.body.subscriptionPlan || 'free';
        const plan = await Plan.findOne({ name: { $regex: new RegExp(`^${planName}$`, 'i') } });
        
        const features = plan ? plan.features : {};
        const limits = plan ? plan.limits : { staffLimit: 3, outletLimit: 1, whatsappLimit: 50 };

        // 2. Create Salon
        const salon = await Salon.create({
            name,
            description,
            ownerName,
            email,
            phone,
            gstNumber,
            password: hashedPassword, // Store as hash for user visibility
            address: {
                street: address,
                city: city
            },
            status: 'active', // Direct approved
            isActive: true,
            subscriptionPlan: planName,
            features,
            limits
        });
        console.log('Salon Record Created:', salon._id);

        // 3. Create Admin User for this salon
        const user = await User.create({
            name: ownerName,
            email,
            password: hashedPassword, // Use the manually hashed password
            role: 'admin',
            salonId: salon._id,
            isActive: true // Direct approved
        });
        console.log('User Record Created:', user._id);

        // 4. Send Onboarding Email
        try {
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Welcome to ${process.env.EMAIL_FROM_NAME}!</h2>
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
                salon
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

        // If status is changing, update isActive flags accordingly
        if (req.body.status) {
            if (req.body.status === 'active' || req.body.status === 'trial') {
                req.body.isActive = true;
                // Also update the admin user for this salon
                await User.findOneAndUpdate({ email: salon.email }, { isActive: true });
            } else if (['suspended', 'expired', 'pending'].includes(req.body.status)) {
                req.body.isActive = false;
                // Also update the admin user for this salon
                await User.findOneAndUpdate({ email: salon.email }, { isActive: false });
            }
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

// @desc    Get current salon details
// @route   GET /api/salons/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const salon = await Salon.findById(req.user.salonId);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }
        res.json({ success: true, data: salon });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Register a new salon (Public)
// @route   POST /api/salons/register
// @access  Public
exports.registerSalon = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            ownerName, 
            email, 
            phone, 
            gstNumber, 
            address, 
            city,
            password 
        } = req.body;

        console.log('Public Salon Registration:', { name, email });
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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Fetch plan details
        const planName = req.body.subscriptionPlan || 'free';
        const plan = await Plan.findOne({ name: { $regex: new RegExp(`^${planName}$`, 'i') } });
        
        const features = plan ? plan.features : {};
        const limits = plan ? plan.limits : { staffLimit: 3, outletLimit: 1, whatsappLimit: 50 };

        // 2. Create Salon with PENDING status
        const salon = await Salon.create({
            name,
            description,
            ownerName,
            email,
            phone,
            gstNumber,
            password: hashedPassword,
            address: {
                street: address,
                city: city
            },
            status: 'pending', // Waiting for approval
            isActive: false,    // Cannot operate yet
            subscriptionPlan: planName,
            features,
            limits
        });

        // 3. Create Admin User for this salon with INACTIVE status
        const user = await User.create({
            name: ownerName,
            email,
            password: hashedPassword,
            role: 'admin',
            salonId: salon._id,
            isActive: false // Cannot login yet
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful! Your account is pending approval by Superadmin.',
            data: {
                salonId: salon._id
            }
        });

    } catch (err) {
        console.error('Error in salon registration:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message || 'Server Error' 
        });
    }
};
