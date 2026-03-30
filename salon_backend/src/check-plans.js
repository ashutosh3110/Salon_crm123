import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const membershipPlanSchema = new mongoose.Schema({
    name: String,
    price: Number,
    tenantId: mongoose.Schema.Types.ObjectId
});

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);

async function check() {
    await mongoose.connect(MONGODB_URI);
    const plans = await MembershipPlan.find({});
    console.log('Total plans found:', plans.length);
    plans.forEach(p => console.log(`Plan: ${p.name}, Price: ${p.price}, Tenant: ${p.tenantId}`));
    process.exit(0);
}

check();
