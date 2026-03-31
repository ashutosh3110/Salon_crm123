import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models using full paths to avoid resolution issues
import Tenant from '../src/modules/tenant/tenant.model.js';
import User from '../src/modules/user/user.model.js';
import Subscription from '../src/modules/subscription/subscription.model.js';

async function sync() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGODB_URI not found in .env');
            process.exit(1);
        }

        console.log('Connecting to database...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const tenants = await Tenant.find({});
        console.log(`Found ${tenants.length} tenants. Syncing...`);

        for (const tenant of tenants) {
            // 1. Recalculate staff count
            const actualStaffCount = await User.countDocuments({ tenantId: tenant._id, role: { $ne: 'superadmin' } });
            
            // 2. Refresh limits from plan template
            const plan = await Subscription.findOne({ 
                name: new RegExp(`^${tenant.subscriptionPlan}$`, 'i') 
            });

            const update = { 
                staffCount: actualStaffCount,
                onboardingStatus: 'COMPLETED',
                onboardingStep: 'STAFF_ADDED'
            };

            if (plan) {
                console.log(`Updating limits for ${tenant.name} based on plan: ${plan.name}`);
                update.limits = plan.limits;
                update.features = plan.features;
                update.subscriptionPlan = plan.name.toLowerCase();
            }

            await Tenant.updateOne({ _id: tenant._id }, { $set: update });
            console.log(`Synced ${tenant.name}: Staff Count = ${actualStaffCount}, Limit = ${plan?.limits?.staffLimit || tenant.limits.staffLimit}`);
        }

        console.log('Sync completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

sync();
