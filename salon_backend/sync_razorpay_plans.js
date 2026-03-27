import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from './src/modules/subscription/subscription.model.js';
import razorpayService from './src/modules/billing/razorpay.service.js';

dotenv.config();

const sync = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const subscriptions = await Subscription.find({});
        console.log(`Found ${subscriptions.length} plans to sync.`);

        for (const sub of subscriptions) {
            console.log(`\nSyncing plan: ${sub.name}...`);
            let updated = false;

            // Monthly Plan
            if (!sub.razorpayMonthlyPlanId) {
                if (sub.monthlyPrice > 0) {
                    console.log(` - Creating Razorpay Monthly Plan for ${sub.name} (₹${sub.monthlyPrice})...`);
                    try {
                        const rzpMonthly = await razorpayService.createPlan(sub.name, sub.monthlyPrice, 'monthly');
                        sub.razorpayMonthlyPlanId = rzpMonthly.id;
                        updated = true;
                        console.log(`   ✅ Monthly ID: ${rzpMonthly.id}`);
                    } catch (e) {
                        console.error(`   ❌ Failed to create local monthly plan: ${e.message}`);
                    }
                } else {
                    console.log(` - Skipping Monthly Plan (Price is 0)`);
                }
            } else {
                console.log(` - Monthly ID already exists: ${sub.razorpayMonthlyPlanId}`);
            }

            // Yearly Plan
            if (!sub.razorpayYearlyPlanId) {
                if (sub.yearlyPrice > 0) {
                    console.log(` - Creating Razorpay Yearly Plan for ${sub.name} (₹${sub.yearlyPrice})...`);
                    try {
                        const rzpYearly = await razorpayService.createPlan(sub.name, sub.yearlyPrice, 'yearly');
                        sub.razorpayYearlyPlanId = rzpYearly.id;
                        updated = true;
                        console.log(`   ✅ Yearly ID: ${rzpYearly.id}`);
                    } catch (e) {
                        console.error(`   ❌ Failed to create local yearly plan: ${e.message}`);
                    }
                } else {
                    console.log(` - Skipping Yearly Plan (Price is 0)`);
                }
            } else {
                console.log(` - Yearly ID already exists: ${sub.razorpayYearlyPlanId}`);
            }

            if (updated) {
                await sub.save();
                console.log(`✅ Saved ${sub.name} with Razorpay IDs.`);
            } else {
                console.log(`ℹ️ No updates needed for ${sub.name}.`);
            }
        }

        console.log('\n--- Sync Completed ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync Failed:', error);
        process.exit(1);
    }
};

sync();
