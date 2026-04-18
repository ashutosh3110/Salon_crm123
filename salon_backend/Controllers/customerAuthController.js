const Customer = require('../Models/Customer');
const Product = require('../Models/Product');
const Outlet = require('../Models/Outlet');
const Salon = require('../Models/Salon');
const Otp = require('../Models/Otp');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendSms = require('../Utils/sendSms');

const generateReferralCode = () => {
    return 'WAP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
};

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

        // Generate 4-digit random OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in the dedicated Otp collection
        await Otp.findOneAndUpdate(
            { phone },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        // Send SMS via SMS India Hub
        const brand = "VAHANCAB";
        const message =  `Welcome to the ${brand} powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;
        
        try {
            await sendSms(phone, message, process.env.SMS_INDIA_HUB_DLT_TEMPLATE_ID);
        } catch (smsErr) {
            console.error('SMS Send Error:', smsErr.message);
        }

        res.json({
            success: true,
            message: 'OTP sent successfully',
            // Return OTP in dev mode for easier testing
            otp: process.env.NODE_ENV === 'development' ? otp : undefined 
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
        const { phone, otp, tenantId, referralCode: appliedReferralCode } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        // 1. Verify OTP from Otp collection
        const otpRecord = await Otp.findOne({ phone, otp });
        
        // Allow '1234' for development
        const isDemoOtp = process.env.NODE_ENV === 'development' && otp === '1234';
        const isOtpValid = otpRecord && otpRecord.expiresAt > new Date();

        if (!isOtpValid && !isDemoOtp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // 2. If no tenantId is provided, just return success (phone verified)
        // This is used for the flow where user verifies phone first, then picks a salon
        if (!tenantId || tenantId === 'system') {
            return res.json({
                success: true,
                message: 'Phone verified successfully',
                data: { phoneVerified: true }
            });
        }

        // Remove OTP record after successful verification only when we have a real tenantId
        if (otpRecord && !isDemoOtp) await Otp.deleteOne({ _id: otpRecord._id });

        // 3. Procceed with salon-specific login/registration
        // Find or create customer for this specific salon
        let customer = await Customer.findOne({ phone, salonId: tenantId });
        let isNewUser = false;

        if (!customer) {
            isNewUser = true;
            console.log(`[Referral] New customer ${phone} registering in salon ${tenantId}. Code applied: ${appliedReferralCode}`);
            
            customer = await Customer.create({
                name: 'Guest',
                phone,
                salonId: tenantId,
                referralCode: generateReferralCode(),
                status: 'active'
            });

            // Handle Referral Logic if new user
            if (appliedReferralCode) {
                const referrer = await Customer.findOne({ referralCode: appliedReferralCode, salonId: tenantId });
                console.log(`[Referral] Referrer lookup for code ${appliedReferralCode}: ${referrer ? 'Found (' + referrer.name + ')' : 'Not Found'}`);
                
                if (referrer && referrer._id.toString() !== customer._id.toString()) {
                    const salon = await Salon.findById(tenantId).select('loyaltySetting');
                    const rewards = salon?.loyaltySetting || {};
                    const pointsReferrer = rewards.referralPoints || 200;
                    const pointsReferred = rewards.referredPoints || 100;

                    // Award points to Referrer
                    referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + pointsReferrer;
                    await referrer.save();
                    
                    await LoyaltyTransaction.create({
                        customerId: referrer._id,
                        salonId: tenantId,
                        type: 'CREDIT',
                        amount: pointsReferrer,
                        source: 'REFERRAL',
                        description: `Referral bonus for inviting ${customer.phone}`
                    });

                    // Award points to New Customer
                    customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsReferred;
                    // We will save customer at the end of the controller
                    
                    await LoyaltyTransaction.create({
                        customerId: customer._id,
                        salonId: tenantId,
                        type: 'CREDIT',
                        amount: pointsReferred,
                        source: 'REFERRAL',
                        description: `Welcome bonus using referral code ${appliedReferralCode}`
                    });
                    console.log(`[Referral] Points awarded: Referrer(+${pointsReferrer}), New(+${pointsReferred})`);
                }
            }
        } else if (!customer.referralCode) {
            customer.referralCode = generateReferralCode();
        }

        // Check if customer is inactive
        if (customer.status === 'inactive' || customer.status === 'suspended') {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account has been deactivated. Please contact the salon admin.' 
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
                    referralCode: customer.referralCode,
                    loyaltyPoints: customer.loyaltyPoints || 0,
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
        const { phone, name, email, tenantId, dob, anniversary, gender, referralCode: appliedReferralCode } = req.body;

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
            referralCode: generateReferralCode(),
            status: 'active'
        });

        // Handle Referral Logic
        if (appliedReferralCode) {
            const referrer = await Customer.findOne({ referralCode: appliedReferralCode });
            if (referrer && referrer._id.toString() !== customer._id.toString()) {
                const salon = await Salon.findById(tenantId).select('loyaltySetting');
                const rewards = salon?.loyaltySetting || {};
                const pointsReferrer = rewards.referralPoints || 200;
                const pointsReferred = rewards.referredPoints || 100;

                // Award points to Referrer
                referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + pointsReferrer;
                await referrer.save();
                
                await LoyaltyTransaction.create({
                    customerId: referrer._id,
                    salonId: tenantId,
                    type: 'CREDIT',
                    amount: pointsReferrer,
                    source: 'REFERRAL',
                    description: `Referral bonus for inviting ${customer.phone}`
                });

                // Award points to New Customer
                customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsReferred;
                await customer.save(); // Save the points to customer
                
                await LoyaltyTransaction.create({
                    customerId: customer._id,
                    salonId: tenantId,
                    type: 'CREDIT',
                    amount: pointsReferred,
                    source: 'REFERRAL',
                    description: `Welcome bonus using referral code ${appliedReferralCode}`
                });
            }
        }

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
        const { name, email, gender, avatar, birthday, dob, anniversary } = req.body;
        
        const userId = req.user.id || req.user._id;
        const customer = await Customer.findById(userId);
        
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Update fields if provided
        if (name !== undefined) customer.name = name;
        if (email !== undefined) customer.email = email;
        if (gender !== undefined) customer.gender = gender;
        if (avatar !== undefined) customer.avatar = avatar;
        
        // Handle both 'birthday' (legacy) and 'dob' (new)
        if (dob !== undefined) customer.dob = dob;
        else if (birthday !== undefined) customer.dob = birthday;

        if (anniversary !== undefined) customer.anniversary = anniversary;

        await customer.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: customer
        });

    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
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
// @desc    Delete customer profile
// @route   DELETE /api/auth/profile
// @access  Private (Customer)
exports.deleteAccount = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.user._id);
        
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
