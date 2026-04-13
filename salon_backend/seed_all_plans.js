const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MembershipPlanSchema = new mongoose.Schema({
    salonId: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    duration: Number,
    benefits: [String],
    isActive: { type: Boolean, default: true },
    isPopular: Boolean,
    serviceDiscountValue: Number,
    serviceDiscountType: String,
    productDiscountValue: Number,
    productDiscountType: String,
    color: String,
    gradient: String
}, { timestamps: true });

async function seedAll() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const MembershipPlan = mongoose.model('MembershipPlan', MembershipPlanSchema);
        const Salon = mongoose.model('Salon', new mongoose.Schema({}, { strict: false }));
        
        await MembershipPlan.deleteMany({}); // Clear all
        const salons = await Salon.find({});
        
        for (const salon of salons) {
            console.log(`Seeding for salon: ${salon.name}`);
            const plans = [
                {
                    salonId: salon._id,
                    name: 'Silver Ritual',
                    price: 999,
                    duration: 30,
                    benefits: ['Priority Booking', 'Free Hair Wash'],
                    serviceDiscountValue: 10,
                    serviceDiscountType: 'percentage',
                    productDiscountValue: 5,
                    productDiscountType: 'percentage',
                    color: '#C0C0C0',
                    gradient: 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
                    isPopular: false
                },
                {
                    salonId: salon._id,
                    name: 'Gold Elite',
                    price: 2499,
                    duration: 90,
                    benefits: ['Private Suite Access', 'Unlimited Drinks'],
                    serviceDiscountValue: 20,
                    serviceDiscountType: 'percentage',
                    productDiscountValue: 10,
                    productDiscountType: 'percentage',
                    color: '#D4AF37',
                    gradient: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
                    isPopular: true
                }
            ];
            await MembershipPlan.insertMany(plans);
        }
        
        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAll();
