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

    return { message: 'OTP sent successfully [AUTH_SERVICE_DEBUG]' };
};

const loginWithOtp = async (phone, tenantId, otpCode, referralCode = '') => {
    // 1. Verify OTP
    const otpRecord = await Otp.findOne({ phone, tenantId });
    if (!otpRecord || otpRecord.otp !== otpCode) {
        throw new Error('Invalid OTP');
    }

    if (new Date() > otpRecord.expiresAt) {
        throw new Error('OTP expired');
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

export default {
    registerSalonOwner,
    loginUserWithEmailAndPassword,
    requestOtp,
    loginWithOtp,
    registerCustomer,
};
