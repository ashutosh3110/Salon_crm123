import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const membershipPlanSchema = new mongoose.Schema({
    name: String,
    price: Number,
    benefits: [String],
    isActive: Boolean,
    tenantId: mongoose.Schema.Types.ObjectId
});

const customerMembershipSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    planId: mongoose.Schema.Types.ObjectId,
    tenantId: mongoose.Schema.Types.ObjectId,
    status: String,
    expiryDate: Date,
    amount: Number
});

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
const CustomerMembership = mongoose.model('CustomerMembership', customerMembershipSchema);

async function seed() {
    await mongoose.connect(MONGODB_URI);
    
    const tenantId = '69943f096cc9fc8e3a8f5ea7';
    const customerId = '69943f096cc9fc8e3a8f5ea7'; 

    // 1. Create a plan if not exists
    let plan = await MembershipPlan.findOne({ tenantId });
    if (!plan) {
        plan = await MembershipPlan.create({
            name: 'Gold Elite',
            price: 1999,
            benefits: ['15% Off on all services', 'Priority Booking'],
            isActive: true,
            tenantId
        });
        console.log('Created new plan for test tenant');
    }

    // 2. Create active membership
    await CustomerMembership.deleteMany({ customerId, tenantId });
    await CustomerMembership.create({
        customerId,
        tenantId,
        planId: plan._id,
        status: 'active',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: plan.price
    });

    console.log('Active membership seeded for test user');
    process.exit(0);
}

seed();
