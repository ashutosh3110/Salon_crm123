const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Invoice = require('../Models/Invoice');
const Staff = require('../Models/Staff');

async function run() {
    try {
        console.log('Connecting to', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const invoiceCount = await Invoice.countDocuments();
        console.log('Total Invoices:', invoiceCount);

        const invoices = await Invoice.find().limit(5).lean();
        console.log('Sample Invoices:', JSON.stringify(invoices, null, 2));

        const staffCount = await Staff.countDocuments();
        console.log('Total Staff:', staffCount);

        const staff = await Staff.find().limit(5).select('name role status isActive').lean();
        console.log('Sample Staff:', JSON.stringify(staff, null, 2));

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
