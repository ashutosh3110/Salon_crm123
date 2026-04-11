const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./Models/Service');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Service.countDocuments();
    const samples = await Service.find().limit(5);
    console.log(`TOTAL_SERVICES: ${count}`);
    samples.forEach(s => console.log(`- ${s.name} (Salon: ${s.salonId}) [Status: ${s.status}]`));
    process.exit(0);
}
check();
