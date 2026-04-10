const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Salon = require('../Models/Salon');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const salons = await Salon.find();
    console.log('--- SALONS ---');
    salons.forEach(s => {
        console.log(`|${s.name}| Plan: |${s.subscriptionPlan}|`);
    });
    process.exit();
}
check();
