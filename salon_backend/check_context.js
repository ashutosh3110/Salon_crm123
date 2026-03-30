import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/user/user.model.js';
import Invoice from './src/modules/invoice/invoice.model.js';

dotenv.config();

async function checkContext() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const receptionist = await User.findOne({ role: 'receptionist' }).lean();
        if (receptionist) {
            console.log('Receptionist Found:');
            console.log(`  _id:      ${receptionist._id}`);
            console.log(`  tenantId: ${receptionist.tenantId} (${typeof receptionist.tenantId})`);
        } else {
            console.log('No receptionist found.');
        }

        const latestInvoice = await Invoice.findOne({}).sort({ createdAt: -1 }).lean();
        if (latestInvoice) {
            console.log('Latest Invoice Found:');
            console.log(`  _id:      ${latestInvoice._id}`);
            console.log(`  tenantId: ${latestInvoice.tenantId} (${typeof latestInvoice.tenantId})`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkContext();
