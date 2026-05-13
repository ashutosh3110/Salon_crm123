const mongoose = require('mongoose');
const Customer = require('../Models/Customer');
require('dotenv').config();

async function updateCustomerVisit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a customer (first one)
        const customer = await Customer.findOne();
        
        if (!customer) {
            console.log('No customers found');
            return;
        }

        // Set lastVisit to 45 days ago
        const date = new Date();
        date.setDate(date.getDate() - 45);
        
        customer.lastVisit = date;
        customer.totalVisits = (customer.totalVisits || 0) + 1; // Ensure they have at least one visit
        
        await customer.save();
        
        console.log(`Updated customer: ${customer.name}`);
        console.log(`New lastVisit: ${customer.lastVisit}`);
        console.log('Update successful');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

updateCustomerVisit();
