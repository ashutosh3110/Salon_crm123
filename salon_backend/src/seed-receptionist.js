/**
 * Creates / updates demo Receptionist (Front Desk) user for the first tenant in DB.
 * Run: node src/seed-receptionist.js (from salon_backend)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/user/user.model.js';
import Tenant from './modules/tenant/tenant.model.js';

dotenv.config();

const RECEPTIONIST = {
    name: 'Front Desk',
    email: 'reception@salon.com',
    password: 'password',
    role: 'receptionist',
    isEmailVerified: true,
    status: 'active',
    onboardingStatus: 'COMPLETED',
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const tenant = await Tenant.findOne().sort({ createdAt: 1 });
        if (!tenant) {
            console.error('No tenant found. Please create a salon first.');
            process.exit(1);
        }

        const existing = await User.findOne({ email: RECEPTIONIST.email });
        if (existing) {
            existing.name = RECEPTIONIST.name;
            existing.role = 'receptionist';
            existing.tenantId = tenant._id;
            existing.status = 'active';
            existing.password = RECEPTIONIST.password;
            await existing.save();
            console.log('✅ Receptionist user updated.');
        } else {
            await User.create({
                ...RECEPTIONIST,
                tenantId: tenant._id,
            });
            console.log('✅ Receptionist user created.');
        }

        console.log('');
        console.log('--- Front Desk Login (Demo) ---');
        console.log(`   Email:    ${RECEPTIONIST.email}`);
        console.log(`   Password: ${RECEPTIONIST.password}`);
        console.log(`   Tenant:   ${tenant.name}`);
        console.log('');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
