const mongoose = require('mongoose');
const Promotion = require('../Models/Promotion');
require('dotenv').config({ path: '../.env' });

async function run() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI is not set in env');
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log('Connected to Database');

        const allPromos = await Promotion.find({});
        console.log('Total promotions in database:', allPromos.length);
        allPromos.forEach(p => {
            console.log(JSON.stringify({
                id: p._id,
                name: p.name,
                couponCode: p.couponCode,
                activationMode: p.activationMode,
                isActive: p.isActive,
                type: p.type,
                value: p.value,
                startDate: p.startDate,
                endDate: p.endDate,
                salonId: p.salonId
            }, null, 2));
        });

    } catch (err) {
        console.error('Error running script:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

run();
