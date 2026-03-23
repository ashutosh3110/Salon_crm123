/**
 * Creates / updates demo Manager user for the first tenant in DB.
 * Run: node src/seed-manager.js   (from salon_backend, with MONGODB_URI in .env)
 *
 * Login (demo):
 *   Email:    manager@salon.com
 *   Password: password
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/user/user.model.js';
import Tenant from './modules/tenant/tenant.model.js';

dotenv.config();

const MANAGER = {
    name: 'Salon Manager',
    email: 'manager@salon.com',
    password: 'password',
    role: 'manager',
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
            console.error('No tenant found. Complete salon onboarding first (or create a tenant), then run this script again.');
            process.exit(1);
        }

        const existing = await User.findOne({ email: MANAGER.email });
        if (existing) {
            existing.name = MANAGER.name;
            existing.role = 'manager';
            existing.tenantId = tenant._id;
            existing.status = 'active';
            existing.onboardingStatus = 'COMPLETED';
            existing.password = MANAGER.password;
            await existing.save();
            console.log('✅ Manager user updated.');
        } else {
            await User.create({
                ...MANAGER,
                tenantId: tenant._id,
            });
            console.log('✅ Manager user created.');
        }

        console.log('');
        console.log('--- Manager login (demo) ---');
        console.log(`   Email:    ${MANAGER.email}`);
        console.log(`   Password: ${MANAGER.password}`);
        console.log(`   Tenant:   ${tenant.name} (${tenant._id})`);
        console.log('');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
