const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Customer = require('../Models/Customer');
const Outlet = require('../Models/Outlet');
const Salon = require('../Models/Salon');
const Service = require('../Models/Service');
const Staff = require('../Models/Staff');

async function inspect() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        const salons = await Salon.find({});
        console.log('\n--- Salons ---');
        salons.forEach(s => console.log(`ID: ${s._id}, Name: ${s.name || s.businessName}`));

        const outlets = await Outlet.find({});
        console.log('\n--- Outlets ---');
        outlets.forEach(o => console.log(`ID: ${o._id}, Name: ${o.name}, SalonId: ${o.salonId}`));

        const staff = await Staff.find({});
        console.log('\n--- Staff (Stylists) ---');
        staff.forEach(s => console.log(`ID: ${s._id}, Name: ${s.name}, SalonId: ${s.salonId}, Role: ${s.role}`));

        const customers = await Customer.find({});
        console.log('\n--- Customers ---');
        customers.forEach(c => console.log(`ID: ${c._id}, Name: ${c.name}, Phone: ${c.phone}`));

        const services = await Service.find({});
        console.log('\n--- Services ---');
        services.forEach(s => console.log(`ID: ${s._id}, Name: ${s.name}, Price: ${s.price}`));

    } catch (err) {
        console.error('Error during inspection:', err);
    } finally {
        await mongoose.connection.close();
    }
}

inspect();
