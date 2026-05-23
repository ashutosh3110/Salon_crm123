const mongoose = require('mongoose');
require('dotenv').config();
const Invoice = require('../Models/Invoice');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const total = await Invoice.countDocuments();
    const active = await Invoice.countDocuments({ status: { $in: ['active', 'refunded'] } });

    const now = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);

    const inRange = await Invoice.countDocuments({
        status: { $in: ['active', 'refunded'] },
        createdAt: { $gte: start, $lte: now }
    });

    console.log('Total invoices in DB:', total);
    console.log('Active/refunded invoices:', active);
    console.log('In last-12-months range:', inRange);
    mongoose.connection.close();
}).catch(e => { console.error(e); process.exit(1); });
