const User = require('../Models/User');

const seedSuperAdmin = async () => {
    try {
        const superadminEmail = 'superadmin@gmail.com';
        const exists = await User.findOne({ email: superadminEmail });

        if (!exists) {
            console.log('Seeding default superadmin...');
            await User.create({
                name: 'Super Admin',
                email: superadminEmail,
                password: '123', // Will be hashed by pre-save hook
                role: 'superadmin',
                status: 'active'
            });
            console.log('Superadmin created successfully.');
        } else {
            // console.log('Superadmin already exists.');
        }
    } catch (err) {
        console.error('Error seeding superadmin:', err.message);
    }
};

const seedPlans = async () => {
    try {
        const Plan = require('../Models/Plan');
        const count = await Plan.countDocuments();
        
        if (count === 0) {
            console.log('Seeding default plans...');
            const defaultPlans = [
                {
                    name: 'Free',
                    description: 'Perfect for getting started with your first salon.',
                    monthlyPrice: 0,
                    yearlyPrice: 0,
                    billingCycle: 'forever',
                    features: { pos: true, appointments: true, inventory: true },
                    limits: { staffLimit: 2, outletLimit: 1, whatsappLimit: 10 },
                    popular: false
                },
                {
                    name: 'Basic',
                    description: 'Essential tools for growing salons.',
                    monthlyPrice: 999,
                    yearlyPrice: 9999,
                    billingCycle: 'monthly',
                    features: { pos: true, appointments: true, inventory: true, crm: true, marketing: true },
                    limits: { staffLimit: 5, outletLimit: 1, whatsappLimit: 100 },
                    popular: false
                },
                {
                    name: 'Pro',
                    description: 'Advanced features for established businesses.',
                    monthlyPrice: 2499,
                    yearlyPrice: 24999,
                    billingCycle: 'monthly',
                    features: { pos: true, appointments: true, inventory: true, crm: true, marketing: true, loyalty: true, finance: true, reports: true },
                    limits: { staffLimit: 15, outletLimit: 3, whatsappLimit: 500 },
                    popular: true
                },
                {
                    name: 'Premium',
                    description: 'The ultimate toolkit for multi-outlet chains.',
                    monthlyPrice: 4999,
                    yearlyPrice: 49999,
                    billingCycle: 'monthly',
                    features: { pos: true, appointments: true, inventory: true, crm: true, marketing: true, loyalty: true, finance: true, reports: true, whatsapp: true, mobileApp: true, feedback: true },
                    limits: { staffLimit: 50, outletLimit: 10, whatsappLimit: 2000 },
                    popular: false
                }
            ];
            await Plan.insertMany(defaultPlans);
            console.log('Default plans seeded successfully.');
        }
    } catch (err) {
        console.error('Error seeding plans:', err.message);
    }
};

module.exports = { seedSuperAdmin, seedPlans };
