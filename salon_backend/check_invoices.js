import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './src/modules/invoice/invoice.model.js';

dotenv.config();

async function checkInvoices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Invoice.countDocuments({});
        console.log(`Total Invoices in DB: ${count}`);
        
        const latest = await Invoice.find({}).sort({ createdAt: -1 }).limit(1).lean();
        console.log('Latest Invoice:', JSON.stringify(latest, null, 2));

        const today = new Date();
        today.setHours(0,0,0,0);
        const todayCount = await Invoice.countDocuments({ createdAt: { $gte: today } });
        console.log(`Invoices created today: ${todayCount}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkInvoices();
