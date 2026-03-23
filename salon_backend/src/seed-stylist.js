/**
 * Creates / updates demo Stylist user for the first tenant in DB.
 * Run: node src/seed-stylist.js   (from salon_backend, with MONGODB_URI in .env)
 *
 * Login (demo):
 *   Email:    stylist@salon.com
 *   Password: password
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/user/user.model.js';
import Tenant from './modules/tenant/tenant.model.js';
import Outlet from './modules/outlet/outlet.model.js';

dotenv.config();

const STYLIST = {
    name: 'Anita Verma',
    email: 'stylist@salon.com',
    password: 'password',
    role: 'stylist',
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

        const firstOutlet = await Outlet.findOne({ tenantId: tenant._id, status: 'active' }).sort({ createdAt: 1 });

        const existing = await User.findOne({ email: STYLIST.email });
        if (existing) {
            existing.name = STYLIST.name;
            existing.role = 'stylist';
            existing.tenantId = tenant._id;
            existing.status = 'active';
            existing.onboardingStatus = 'COMPLETED';
            existing.password = STYLIST.password;
            if (firstOutlet) existing.outletId = firstOutlet._id;
            await existing.save();
            console.log('✅ Stylist user updated.');
        } else {
            await User.create({
                ...STYLIST,
                tenantId: tenant._id,
                outletId: firstOutlet?._id,
            });
            console.log('✅ Stylist user created.');
        }

        console.log('');
        console.log('--- Stylist login (demo) ---');
        console.log(`   Email:    ${STYLIST.email}`);
        console.log(`   Password: ${STYLIST.password}`);
        console.log(`   Tenant:   ${tenant.name} (${tenant._id})`);
        if (firstOutlet) {
            console.log(`   Outlet:   ${firstOutlet.name} (${firstOutlet._id}) — set outlet coords in admin for GPS punch.`);
        } else {
            console.log('   Outlet:   (none) — create an outlet and assign stylist for location-based attendance.');
        }
        console.log('');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
