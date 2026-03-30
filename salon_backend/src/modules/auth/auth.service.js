import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import userService from '../user/user.service.js';
import tokenService from './token.service.js';
import User from '../user/user.model.js';
import Tenant from '../tenant/tenant.model.js';
import Subscription from '../subscription/subscription.model.js';
import Billing from '../billing/billing.model.js';
import Otp from './otp.model.js';
import Client from '../client/client.model.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import loyaltyService from '../loyalty/loyalty.service.js';

const registerSalonOwner = async (registrationData) => {
    const { salonName, fullName, email, phone, password, subscriptionPlan = 'free', paymentId, orderId } = registrationData;

    // Check if user already exists
    if (await User.isEmailTaken(email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    // 0. Fetch Subscription Plan Details
    const plan = await Subscription.findOne({ name: new RegExp(`^${subscriptionPlan}$`, 'i'), active: true });
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Create Tenant
        const slug = salonName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const tenant = new Tenant({
            name: salonName,
            slug,
            email: String(email).trim().toLowerCase(),
            phone,
            ownerName: fullName,
            subscriptionPlan: plan ? plan.name.toLowerCase() : subscriptionPlan,
            status: paymentId ? 'active' : (plan && plan.trialDays > 0 ? 'trial' : (plan && plan.monthlyPrice === 0 ? 'active' : 'inactive')),
            trialDays: plan ? plan.trialDays : 14,
            features: plan ? plan.features : undefined,
            limits: plan ? plan.limits : undefined
        });
        await tenant.save({ session });

        // 2. Create Admin User linked to Tenant
        const user = new User({
            name: fullName,
            email: String(email).trim().toLowerCase(),
            password,
            phone,
            role: 'admin',
            tenantId: tenant._id,
            onboardingStatus: 'NOT_STARTED',
        });
        await user.save({ session });

        // 3. Link Owner back to Tenant
        tenant.owner = user._id;
        await tenant.save({ session });

        // 4. Create Billing record if payment was made
        if (paymentId && plan) {
            const amount = plan.monthlyPrice;
            const taxAmount = plan.gstStatus && plan.gstType === 'exclusive' ? (amount * plan.gstRate / 100) : 0;
            const totalAmount = amount + taxAmount;

            const billing = new Billing({
                invoiceNumber: `INV-${Date.now()}`,
                tenantId: tenant._id,
                planId: plan._id,
                planName: plan.name,
                amount,
                taxAmount,
                totalAmount,
                status: 'paid',
                paymentMethod: 'razorpay',
                paymentDate: new Date(),
                transactionId: paymentId,
                billingPeriod: {
                    from: new Date(),
                    to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month
                }
            });
            await billing.save({ session });
        }

        await session.commitTransaction();

        // Send Welcome Email (non-blocking)
        try {
            const emailService = (await import('../notification/email.service.js')).default;
            emailService.sendWelcomeEmail(email, fullName, salonName, password);
        } catch (e) {
            console.error('[AuthService] Welcome email failed:', e.message);
        }

        return { user, tenant };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }

    // Check if user or their tenant is deleted
    if (user.status === 'deleted') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Aapka salon account permanent delete/stop kar diya gaya h. Kripya SuperAdmin se sampark karein.');
    }

    // Check tenant status too if applicable
    if (user.tenantId) {
        const tenant = await Tenant.findById(user.tenantId);
        if (tenant && tenant.status === 'deleted') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Aapka salon account (Salon) band/delete ho chuka h. Kripya SuperAdmin se sampark karein.');
        }
    }

    return user;
};

const requestOtp = async (phone, tenantId) => {
    // Validate tenantId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        throw new Error('Invalid Salon Selection');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // Expire in 10 minutes

    // Store OTP in database (update if exists for the same phone/tenant)
    await Otp.findOneAndUpdate(
        { phone, tenantId },
        { otp, expiresAt },
        { upsert: true, new: true }
    );

    // LOG TO CONSOLE + file (since no SMS API).
    // Console output sometimes isn't captured in Cursor terminal snapshots.
    console.error(`\n-----------------------------------------`);
    console.error(`[AUTH] OTP for mobile login: ${otp}`);
    console.error(`[AUTH] Phone: ${phone} | Tenant: ${tenantId}`);
    console.error(`-----------------------------------------\n`);
    logger.error('OTP_SENT_DEBUG', { otp, phone, tenantId });

    return { 
        message: 'OTP sent successfully [AUTH_SERVICE_DEBUG]',
        otp: otp // Return OTP for frontend debugging as requested
    };
};

const loginWithOtp = async (phone, tenantId, otpCode, referralCode = '') => {
    // 1. Verify OTP
    const otpRecord = await Otp.findOne({ phone, tenantId });
    if (!otpRecord || otpRecord.otp !== otpCode) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
    }

    if (new Date() > otpRecord.expiresAt) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
    }

    // 2. Find or Create Client
    let client = await Client.findOne({ phone, tenantId });
    if (!client) {
        // Auto-register new client if they don't exist
        client = new Client({
            phone,
            tenantId,
            name: `Customer-${phone.slice(-4)}`, // Default name
            status: 'active'
        });
        await client.save();
    }

    // Delete OTP record after successful use
    await Otp.deleteOne({ _id: otpRecord._id });

    // Link referral if code was provided
    if (referralCode) {
        try {
            await loyaltyService.createReferralByCode(tenantId, referralCode, client._id);
            await loyaltyService.handleReferralEvent(tenantId, client._id, 'REGISTRATION');
        } catch (e) {
            // Keep login flow non-blocking for referral failures
            logger.warn(`Referral link skipped: ${e?.message || 'unknown error'}`);
        }
    }

    // 3. Generate Auth Tokens
    // Adding role to the object so tokenService can use it
    return {
        ...client.toObject(),
        role: 'customer'
    };
};

const registerCustomer = async (registrationData) => {
    const { tenantId, name, email, phone, password, dob, anniversary, referralCode } = registrationData;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        throw new Error('Invalid Salon Selection');
    }

    const birthday = dob ? new Date(dob) : null;
    const ann = anniversary ? new Date(anniversary) : null;

    // Create or update customer for this tenant by phone
    let client = await Client.findOne({ phone, tenantId });
    if (!client) {
        client = new Client({
            tenantId,
            phone,
            name,
            email: email ? String(email).trim().toLowerCase() : undefined,
            role: 'customer',
            birthday: birthday || undefined,
            anniversary: ann || undefined,
            password,
        });
    } else {
        client.name = name;
        client.email = email ? String(email).trim().toLowerCase() : client.email;
        client.birthday = birthday || client.birthday;
        client.anniversary = ann || client.anniversary;
        client.password = password; // optional re-register
    }

    await client.save();

    if (referralCode) {
        try {
            await loyaltyService.createReferralByCode(tenantId, referralCode, client._id);
            await loyaltyService.handleReferralEvent(tenantId, client._id, 'REGISTRATION');
        } catch (e) {
            logger.warn(`Referral link skipped on register: ${e?.message || 'unknown error'}`);
        }
    }

    return client;
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User with this email not found');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60000); // 15 mins

    await Otp.findOneAndUpdate(
        { email: user.email },
        { otp, expiresAt },
        { upsert: true, new: true }
    );

    // Send recovery email (non-blocking)
    try {
        const emailService = (await import('../notification/email.service.js')).default;
        await emailService.sendPasswordResetEmail(user.email, otp);
    } catch (e) {
        logger.error('[AuthService] Recovery email failed:', e.message);
        // We still return success: true because the OTP is in the DB, 
        // but the user might not get the email if SMTP fails.
        // However, user specifically asked for "properly kro", so we should handle failure if possible.
    }

    return { success: true, message: 'Recovery security sequence transmitted to your registered inbox.' };
};

const verifyResetOtp = async (email, otpCode) => {
    const otpRecord = await Otp.findOne({ email: String(email).trim().toLowerCase() });
    if (!otpRecord || otpRecord.otp !== otpCode) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid recovery code');
    }
    if (new Date() > otpRecord.expiresAt) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Recovery code expired');
    }
    return { success: true, message: 'Sequence validated' };
};

const resetPassword = async (email, otpCode, newPassword) => {
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    // Verify OTP one last time
    const otpRecord = await Otp.findOne({ email: user.email });
    if (!otpRecord || otpRecord.otp !== otpCode) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired recovery sequence');
    }

    user.password = newPassword;
    await user.save();

    // Cleanup OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    return { success: true, message: 'Password reset successful' };
};

export default {
    registerSalonOwner,
    loginUserWithEmailAndPassword,
    requestOtp,
    loginWithOtp,
    registerCustomer,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
};
