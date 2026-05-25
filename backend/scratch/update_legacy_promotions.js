require('dotenv').config();
const mongoose = require('mongoose');
const Promotion = require('../Models/Promotion');

async function run() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI is not set in env');
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log('Connected to Database');

        const result = await Promotion.updateMany(
            {},
            {
                $set: {
                    totalUsageLimit: 1,
                    usageLimitPerCustomer: 1
                }
            }
        );
        console.log(`Successfully updated promotions count:`, result.modifiedCount);

        const allPromos = await Promotion.find({});
        console.log('Current promotions state:');
        allPromos.forEach(p => {
            console.log(`- Code: ${p.couponCode || p.name}, totalUsageLimit: ${p.totalUsageLimit}, usageLimitPerCustomer: ${p.usageLimitPerCustomer}`);
        });

    } catch (err) {
        console.error('Error running script:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

run();
