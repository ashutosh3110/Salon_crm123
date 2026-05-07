const mongoose = require('mongoose');
const Customer = require('../Models/Customer');
const Order = require('../Models/Order');
const Booking = require('../Models/Booking');
require('dotenv').config();

async function syncTotalSpend() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const customers = await Customer.find({});
        console.log(`Analyzing spend for ${customers.length} customers...`);

        for (const customer of customers) {
            // Get all paid product orders
            const orders = await Order.find({ 
                customerId: customer._id, 
                paymentStatus: 'paid' 
            });
            const orderTotal = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

            // Get all paid service bookings
            const bookings = await Booking.find({ 
                clientId: customer._id, 
                paymentStatus: 'paid' 
            });
            const bookingTotal = bookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

            const totalSpend = orderTotal + bookingTotal;
            const totalVisits = bookings.length;

            // Update customer record
            await Customer.findByIdAndUpdate(customer._id, { 
                $set: { 
                    totalSpend: totalSpend,
                    totalVisits: totalVisits
                } 
            });

            if (totalSpend > 0) {
                console.log(`Updated ${customer.name}: ₹${totalSpend.toFixed(2)} (${totalVisits} visits)`);
            }
        }

        console.log('Sync Complete!');
        mongoose.connection.close();
    } catch (err) {
        console.error('Sync failed:', err);
    }
}

syncTotalSpend();
