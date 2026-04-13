const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const MembershipPlan = mongoose.model('MembershipPlan', new mongoose.Schema({}, { strict: false }));
        const Salon = mongoose.model('Salon', new mongoose.Schema({}, { strict: false }));
        
        const plans = await MembershipPlan.find({});
        console.log(`TOTAL PLANS: ${plans.length}`);
        if (plans.length > 0) {
            console.log(`FIRST PLAN SALON ID: ${plans[0].salonId}`);
        }
        
        const salons = await Salon.find({});
        salons.forEach(s => {
            console.log(`SALON: ${s.name} ID: ${s._id}`);
            console.log(`LOYALTY: ${JSON.stringify(s.loyaltySetting)}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
