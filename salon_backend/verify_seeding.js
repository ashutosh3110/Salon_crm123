const mongoose = require('mongoose');
require('dotenv').config();

const verifyOutlets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Outlet = require('./Models/Outlet');
        const count = await Outlet.countDocuments();
        const outlets = await Outlet.find().select('name salonId createdAt').limit(10);
        console.log(`TOTAL_OUTLETS_IN_DB: ${count}`);
        outlets.forEach(o => {
            console.log(`- ${o.name} (Salon: ${o.salonId}) [${o.createdAt}]`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyOutlets();
