const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Salon = require('../Models/Salon');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Fix "Enterprice" -> "Enterprise"
        const result = await Salon.updateMany(
            { subscriptionPlan: { $regex: /Enterprice/i } },
            { $set: { subscriptionPlan: 'Enterprise' } }
        );
        console.log(`Updated ${result.modifiedCount} salons.`);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

fix();
