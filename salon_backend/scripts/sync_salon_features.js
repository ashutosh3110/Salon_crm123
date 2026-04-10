const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Salon = require('../Models/Salon');
const Plan = require('../Models/Plan');

async function sync() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const salons = await Salon.find();
        const plans = await Plan.find();

        for (const salon of salons) {
            const planName = salon.subscriptionPlan || 'free';
            const plan = plans.find(p => p.name.toLowerCase() === planName.toLowerCase());
            
            if (plan) {
                console.log(`Syncing salon: ${salon.name} with plan: ${plan.name}`);
                salon.features = plan.features;
                salon.limits = plan.limits;
                salon.subscriptionPlanId = plan._id;
                await salon.save();
            } else {
                console.log(`Plan ${planName} not found for salon: ${salon.name}`);
            }
        }
        console.log('Sync complete.');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

sync();
