const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const Salon = require('../Models/Salon');
const Plan = require('../Models/Plan');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const salons = await Salon.find();
        console.log('--- SALONS ---');
        salons.forEach(s => {
            console.log(`ID: ${s._id}, Name: ${s.name}, Email: ${s.email}, Plan: ${s.subscriptionPlan}, Active: ${s.isActive}, Status: ${s.status}`);
        });
        const plans = await Plan.find();
        console.log('--- PLANS ---');
        plans.forEach(p => {
            console.log(`ID: ${p._id}, Name: ${p.name}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
