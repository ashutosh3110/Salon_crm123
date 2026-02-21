import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import userService from '../user/user.service.js';
import tokenService from './token.service.js';
import User from '../user/user.model.js';
import Tenant from '../tenant/tenant.model.js';
import Otp from './otp.model.js';
import Client from '../client/client.model.js';
import ApiError from '../../utils/ApiError.js';

const registerSalonOwner = async (registrationData) => {
    const { salonName, fullName, email, phone, password, subscriptionPlan = 'free' } = registrationData;

    // Check if user already exists
    if (await User.isEmailTaken(email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Create Tenant
        const slug = salonName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const tenant = new Tenant({
            name: salonName,
            slug,
            subscriptionPlan
        });
        await tenant.save({ session });

        // 2. Create Admin User linked to Tenant
        const user = new User({
            name: fullName,
            email,
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

    // LOG TO CONSOLE (since no SMS API)
    console.log(`\n-----------------------------------------`);
    console.log(`[AUTH] OTP for mobile login: ${otp}`);
    console.log(`[AUTH] Phone: ${phone} | Tenant: ${tenantId}`);
    console.log(`-----------------------------------------\n`);

    return { message: 'OTP sent successfully' };
};

const loginWithOtp = async (phone, tenantId, otpCode) => {
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

    // 3. Generate Auth Tokens
    // Adding role to the object so tokenService can use it
    return {
        ...client.toObject(),
        role: 'customer'
    };
};

export default {
    registerSalonOwner,
    loginUserWithEmailAndPassword,
    requestOtp,
    loginWithOtp,
};
