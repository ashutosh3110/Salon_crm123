import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/user/user.model.js';

dotenv.config();

const SUPERADMIN = {
    name: 'Super Admin',
    email: 'superadmin@saloncrm.com',
    password: 'Admin@123',
    role: 'superadmin',
    isEmailVerified: true,
    status: 'active',
    onboardingStatus: 'COMPLETED',
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email: SUPERADMIN.email });
        if (existing) {
            console.log('Superadmin already exists — skipping.');
        } else {
            await User.create(SUPERADMIN);
            console.log('✅ Superadmin created successfully!');
            console.log(`   Email:    ${SUPERADMIN.email}`);
            console.log(`   Password: ${SUPERADMIN.password}`);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
