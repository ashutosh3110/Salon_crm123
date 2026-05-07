const mongoose = require('mongoose');
const Customer = require('../Models/Customer');
const Salon = require('../Models/Salon');
require('dotenv').config();

async function checkCustomers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const salonData = await Salon.find({}, 'name');
        console.log('Available Salons:', JSON.stringify(salonData, null, 2));

        const counts = await Customer.aggregate([
            { $group: { _id: '$salonId', count: { $sum: 1 } } }
        ]);

        const result = counts.map(c => {
            const s = salonData.find(sd => sd._id.toString() === (c._id ? c._id.toString() : ''));
            return {
                salonId: c._id,
                salonName: s ? s.name : 'UNKNOWN',
                customerCount: c.count
            };
        });

        console.log('Customer Distribution:', JSON.stringify(result, null, 2));

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkCustomers();
