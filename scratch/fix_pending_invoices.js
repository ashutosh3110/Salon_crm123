const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Invoice = require('./backend/Models/Invoice');

const fixInvoices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Round totals and update paymentStatus for invoices with tiny due amounts
        const invoices = await Invoice.find({ paymentStatus: { $ne: 'paid' } });
        console.log(`Found ${invoices.length} unpaid invoices`);

        let fixedCount = 0;
        for (const inv of invoices) {
            const total = Math.round(inv.total || 0);
            const paidAmount = (inv.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
            const useWalletAmount = inv.useWalletAmount || 0;
            const dueAmount = Math.max(0, total - useWalletAmount - paidAmount);

            if (dueAmount < 1) {
                inv.paymentStatus = 'paid';
                inv.dueAmount = 0;
                inv.total = total; // Round the total too
                await inv.save();
                fixedCount++;
            }
        }

        console.log(`Successfully fixed ${fixedCount} invoices`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixInvoices();
