const mongoose = require('mongoose');
const Promotion = require('../Models/Promotion');
const Booking = require('../Models/Booking');
const Order = require('../Models/Order');
const Invoice = require('../Models/Invoice');
require('dotenv').config({ path: '../.env' });

async function run() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to Database');

        const couponCode = 'CODE10';
        const salonId = '69fdc9e21a21bf41d0747f8e';
        const customerId = '6a01b3c01bf9d831805858b4'; // dummy client id or real one
        
        // Find active coupon
        const now = new Date();
        const query = {
            isActive: true,
            couponCode: couponCode.trim().toUpperCase(),
            activationMode: 'COUPON'
        };
        if (salonId) {
            query.salonId = salonId;
        }

        const promo = await Promotion.findOne(query);
        console.log('Found promo:', promo ? promo.name : 'Not Found');

        if (promo) {
            // Test the Booking/Order/Invoice check
            console.log('Validating customer usage limit...');
            const code = promo.couponCode;
            const [bookingsCount, ordersCount, invoicesCount] = await Promise.all([
                mongoose.model('Booking').countDocuments({ clientId: customerId, couponCode: code, status: { $ne: 'cancelled' } }),
                mongoose.model('Order').countDocuments({ customerId: customerId, couponCode: code, status: { $ne: 'cancelled' } }),
                mongoose.model('Invoice').countDocuments({ customerId: customerId, couponCode: code, status: { $ne: 'cancelled' } })
            ]);
            console.log('Counts:', { bookingsCount, ordersCount, invoicesCount });
        }

    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

run();
