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
        const adminPassword = password || Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Using Admin Password:', adminPassword);
        
        // Hash the password manually for the User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        console.log('Hashed Password Generated:', hashedPassword);

        // 1. Check if salon already exists
        const existingSalon = await Salon.findOne({ email });
        if (existingSalon) {
            return res.status(400).json({ success: false, message: 'Salon with this email already exists' });
        }

        // Fetch default features and limits from the plan (default: free)
        const planName = req.body.subscriptionPlan || 'none';
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
        const { status, subscriptionPlan, search, startDate, endDate, page = 1, limit = 10 } = req.query;
        
        const query = {};

        // Filtering
        const freePlanRegex = /^free/i;
        if (status) {
            if (status === 'trial') {
                query.$or = [{ status: 'trial' }, { subscriptionPlan: freePlanRegex }];
            } else if (status === 'active') {
                query.status = 'active';
                query.subscriptionPlan = { $not: freePlanRegex }; 
            } else {
                query.status = status;
            }
        }
        if (subscriptionPlan) query.subscriptionPlan = subscriptionPlan;
        
        // Date Range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { ownerName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Salon.countDocuments(query);
        const salons = await Salon.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ 
            success: true, 
            data: {
                results: salons,
                totalResults: total,
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit),
                page: parseInt(page)
            } 
        });
    } catch (err) {
        console.error('getSalons Error:', err);
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
            } else if (['suspended', 'expired', 'pending', 'rejected'].includes(req.body.status)) {
                req.body.isActive = false;
            }
        }

        // If status is changing to active, send activation email
        if (req.body.status === 'active' && salon.status !== 'active') {
            try {
                // Generate a new random password on approval
                const newPlainPassword = Math.floor(100000 + Math.random() * 900000).toString();
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPlainPassword, salt);
                
                // Update the request body with the new hashed password
                req.body.password = hashedPassword;

                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #2e7d32; text-align: center;">Account Activated!</h2>
                        <p>Dear <strong>${salon.ownerName}</strong>,</p>
                        <p>Great news! Your salon account, <strong>${salon.name}</strong>, has been <strong>Approved & Activated</strong>.</p>
                        <p>You can now log in to your dashboard using the credentials below:</p>
                        
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2e7d32;">
                            <p style="margin: 5px 0; font-size: 14px;"><strong>Login URL:</strong> <a href="${process.env.FRONTEND_BASE_URL}/login" style="color: #B4912B;">${process.env.FRONTEND_BASE_URL}/login</a></p>
                            <p style="margin: 5px 0; font-size: 14px;"><strong>Username/Email:</strong> ${salon.email}</p>
                            <p style="margin: 5px 0; font-size: 14px;"><strong>Your Generated Password:</strong> <span style="font-size: 18px; color: #2e7d32; font-family: monospace; letter-spacing: 2px;">${newPlainPassword}</span></p>
                        </div>

                        <p style="font-size: 13px; color: #666; background: #fff3cd; padding: 10px; border-radius: 5px;"><strong>Security Tip:</strong> Please log in and change your password immediately from your profile settings.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #777; text-align: center;">Best Regards,<br>Team ${process.env.EMAIL_FROM_NAME}</p>
                    </div>
                `;
                await sendEmail({
                    email: salon.email,
                    subject: `Account Activated & Login Details - ${process.env.EMAIL_FROM_NAME}`,
                    html
                });
            } catch (err) {
                console.error('Activation email failed:', err);
            }
        }

        // If status is changing to rejected, send rejection email
        if (req.body.status === 'rejected' && salon.status !== 'rejected') {
            try {
                const reason = req.body.rejectionReason || 'Your application did not meet our current verification requirements.';
                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #d32f2f; text-align: center;">Application Update</h2>
                        <p>Dear <strong>${salon.ownerName}</strong>,</p>
                        <p>Thank you for your interest in <strong>${process.env.EMAIL_FROM_NAME}</strong>.</p>
                        <p>After reviewing your application for <strong>${salon.name}</strong>, we regret to inform you that we cannot approve your account at this time.</p>
                        
                        <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #d32f2f;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #d32f2f; font-weight: bold;">Rejection Reason:</p>
                            <p style="margin: 0; font-size: 15px; color: #333; line-height: 1.5;">${reason}</p>
                        </div>

                        <p>If you believe this is a mistake or if you can provide additional information to address the above reason, please feel free to contact our support team.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #777; text-align: center;">Best Regards,<br>Team ${process.env.EMAIL_FROM_NAME}</p>
                    </div>
                `;
                await sendEmail({
                    email: salon.email,
                    subject: `Application Update - ${process.env.EMAIL_FROM_NAME}`,
                    html
                });
            } catch (err) {
                console.error('Rejection email failed:', err);
            }
        }

        // If status is changing to suspended, send suspension email
        if (req.body.status === 'suspended' && salon.status !== 'suspended') {
            try {
                const reason = req.body.suspensionReason || 'Violation of terms of service or pending administrative review.';
                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #f44336; text-align: center;">Account Suspended</h2>
                        <p>Dear <strong>${salon.ownerName}</strong>,</p>
                        <p>This is to inform you that your salon account, <strong>${salon.name}</strong>, has been <strong>Suspended</strong> by the administrator.</p>
                        
                        <div style="background-color: #fffde7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #fbc02d;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #856404; font-weight: bold;">Reason for Suspension:</p>
                            <p style="margin: 0; font-size: 15px; color: #333; line-height: 1.5;">${reason}</p>
                        </div>

                        <p>During suspension, you will not be able to access your dashboard or process new bookings. To resolve this issue, please contact our support team at the earliest.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #777; text-align: center;">Best Regards,<br>Team ${process.env.EMAIL_FROM_NAME}</p>
                    </div>
                `;
                await sendEmail({
                    email: salon.email,
                    subject: `Account Suspended - ${process.env.EMAIL_FROM_NAME}`,
                    html
                });
            } catch (err) {
                console.error('Suspension email failed:', err);
            }
        }

        // If status is changing back to active from suspended, send reactivation email
        if (req.body.status === 'active' && salon.status === 'suspended') {
            try {
                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #2e7d32; text-align: center;">Account Reactivated!</h2>
                        <p>Dear <strong>${salon.ownerName}</strong>,</p>
                        <p>Great news! Your salon account, <strong>${salon.name}</strong>, has been <strong>Reactivated</strong>.</p>
                        <p>The suspension on your account has been lifted, and you can now resume your business operations as usual.</p>
                        
                        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #c8e6c9; text-align: center;">
                            <p style="margin: 0; color: #2e7d32; font-weight: bold;">You can now log in to your dashboard.</p>
                        </div>

                        <p>If you have any questions, feel free to reach out to us.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #777; text-align: center;">Best Regards,<br>Team ${process.env.EMAIL_FROM_NAME}</p>
                    </div>
                `;
                await sendEmail({
                    email: salon.email,
                    subject: `Account Reactivated - ${process.env.EMAIL_FROM_NAME}`,
                    html
                });
            } catch (err) {
                console.error('Reactivation email failed:', err);
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

        // Delete all staff associated with this salon
        await Staff.deleteMany({ salonId: req.params.id });

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
        
        // Use case-insensitive regex for free plan check (matches 'Free', 'Free Plan', etc.)
        const freePlanRegex = /^free/i;
        const freePlanQuery = { subscriptionPlan: freePlanRegex };

        // Active count: status active and NOT free plan
        const activeCount = await Salon.countDocuments({ status: 'active', subscriptionPlan: { $not: freePlanRegex } });
        // Trial count: status trial OR subscriptionPlan free
        const trialCount = await Salon.countDocuments({ $or: [{ status: 'trial' }, freePlanQuery] });
        const expiredCount = await Salon.countDocuments({ status: 'expired' });
        const suspendedCount = await Salon.countDocuments({ status: 'suspended' });
        const pendingCount = await Salon.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            data: {
                totalSalons,
                countsByStatus: [
                    { _id: 'active', count: activeCount },
                    { _id: 'trial', count: trialCount },
                    { _id: 'expired', count: expiredCount },
                    { _id: 'suspended', count: suspendedCount },
                    { _id: 'pending', count: pendingCount }
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
        if (!req.user || !req.user.salonId) {
            return res.status(400).json({ success: false, message: 'User is not associated with any salon' });
        }
        const salon = await Salon.findById(req.user.salonId);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }
        res.json({ success: true, data: salon });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update current salon details
// @route   PATCH /api/salons/me
// @access  Private
exports.updateMe = async (req, res) => {
    try {
        if (!req.user || !req.user.salonId) {
            return res.status(400).json({ success: false, message: 'User is not associated with any salon' });
        }

        // Prevent updating sensitive fields via /me
        const forbiddenFields = ['_id', 'id', 'email', 'subscriptionPlan', 'features', 'limits', 'isActive', 'password'];
        const updateData = { ...req.body };
        forbiddenFields.forEach(field => delete updateData[field]);

        const salon = await Salon.findByIdAndUpdate(req.user.salonId, updateData, {
            new: true,
            runValidators: true
        });

        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        res.json({ success: true, data: salon });
    } catch (err) {
        console.error('UpdateMe Error:', err);
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
        const adminPassword = password || Math.floor(100000 + Math.random() * 900000).toString();
        
        // 1. Check if salon already exists
        const existingSalon = await Salon.findOne({ email });
        if (existingSalon) {
            return res.status(400).json({ success: false, message: 'Salon with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Fetch plan details
        const planName = req.body.subscriptionPlan || 'none';
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

        console.log('Public Salon Record Created (Pending):', salon._id);

        // Send "Application Received" Email
        try {
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Welcome to ${process.env.EMAIL_FROM_NAME}!</h2>
                    <p>Dear <strong>${ownerName}</strong>,</p>
                    <p>Thank you for registering <strong>${name}</strong>. Your account has been created and is currently <strong>Pending Approval</strong> from our Superadmin team.</p>
                    
                    <div style="background-color: #fff4e5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ff9800;">
                        <h3 style="margin-top: 0; color: #856404; font-size: 16px;">Next Steps</h3>
                        <p style="margin: 5px 0; font-size: 14px;">Our team is currently verifying your details. You will receive a <strong>Confirmation Email</strong> with your login credentials once your account is activated.</p>
                    </div>

                    <p>Best Regards,<br>Team ${process.env.EMAIL_FROM_NAME}</p>
                </div>
            `;
            await sendEmail({
                email: email,
                subject: `Registration Received - ${process.env.EMAIL_FROM_NAME}`,
                html
            });
        } catch (err) {
            console.error('Registration email failed:', err);
        }

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

// @desc    Resend credentials (Reset password to 123456 and email)
// @route   POST /api/salons/:id/resend-credentials
// @access  Private/SuperAdmin
exports.resendCredentials = async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });

        const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update Salon
        salon.password = hashedPassword;
        await salon.save();

        // Send Email
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Account Credentials Reset</h2>
                <p>Hello <strong>${salon.ownerName}</strong>,</p>
                <p>Your login credentials for <strong>${salon.name}</strong> have been reset by the administrator.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${salon.email}</p>
                    <p style="margin: 5px 0;"><strong>New Password:</strong> ${newPassword}</p>
                </div>
                <p>Please log in and change your password immediately for security.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777; text-align: center;">Team ${process.env.EMAIL_FROM_NAME}</p>
            </div>
        `;

        await sendEmail({
            email: salon.email,
            subject: 'Your Account Credentials - Wapixo',
            html
        });

        res.json({ success: true, message: `Credentials sent to ${salon.email}` });
    } catch (err) {
        console.error('Resend credentials error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
