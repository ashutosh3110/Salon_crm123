const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MembershipPlan = require('./Models/MembershipPlan');
const Salon = require('./Models/Salon');

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const salon = await Salon.findOne();
        if (!salon) {
            console.error('No salon found. Please create a salon first.');
            process.exit(1);
        }

        console.log(`Seeding plans for salon: ${salon.name} (${salon._id})`);

        // Clear existing plans for this salon (optional, but good for clean seeding)
        await MembershipPlan.deleteMany({ salonId: salon._id });

        const plans = [
            {
                salonId: salon._id,
                name: 'Silver Ritual',
                price: 999,
                duration: 30,
                benefits: ['Priority Booking', 'Free Hair Wash', 'Coffee on Arrival'],
                serviceDiscountValue: 10,
                serviceDiscountType: 'percentage',
                productDiscountValue: 5,
                productDiscountType: 'percentage',
                color: '#C0C0C0',
                gradient: 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
                icon: 'star',
                isPopular: false
            },
            {
                salonId: salon._id,
                name: 'Gold Elite',
                price: 2499,
                duration: 90,
                benefits: ['1 Dedicated Stylist', 'Private Suite Access', 'Unlimited Drinks'],
                serviceDiscountValue: 20,
                serviceDiscountType: 'percentage',
                productDiscountValue: 10,
                productDiscountType: 'percentage',
                color: '#D4AF37',
                gradient: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
                icon: 'crown',
                isPopular: true
            },
            {
                salonId: salon._id,
                name: 'Platinum Royale',
                price: 4999,
                duration: 180,
                benefits: ['Home Service Available', 'Free Spa Session', 'Partner Discounts'],
                serviceDiscountValue: 30,
                serviceDiscountType: 'percentage',
                productDiscountValue: 15,
                productDiscountType: 'percentage',
                color: '#E5E4E2',
                gradient: 'linear-gradient(135deg, #1A1A1A 0%, #434343 100%)',
                icon: 'gem',
                isPopular: false
            },
            {
                salonId: salon._id,
                name: 'Festive Flat',
                price: 1500,
                duration: 60,
                benefits: ['Fixed Service Savings', 'Complimentary Facial', 'Gift Vouchers'],
                serviceDiscountValue: 200,
                serviceDiscountType: 'flat',
                productDiscountValue: 50,
                productDiscountType: 'flat',
                color: '#C8956C',
                gradient: 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)',
                icon: 'star',
                isPopular: false
            },
            {
                salonId: salon._id,
                name: 'Infinite Wellness',
                price: 9999,
                duration: 365,
                benefits: ['365 Days Access', 'Full Body Rituals', 'VIP Membership Card'],
                serviceDiscountValue: 50,
                serviceDiscountType: 'percentage',
                productDiscountValue: 25,
                productDiscountType: 'percentage',
                color: '#000000',
                gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                icon: 'crown',
                isPopular: false
            }
        ];

        await MembershipPlan.insertMany(plans);
        console.log('5 Membership plans seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding plans:', err);
        process.exit(1);
    }
};

seedPlans();
