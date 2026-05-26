const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Register all schemas
require('../Models/Customer');
require('../Models/Outlet');
require('../Models/Staff');
const Invoice = require('../Models/Invoice');

async function check() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        const invoices = await Invoice.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customerId', 'name phone')
            .populate('outletId', 'name');

        console.log('Last 5 invoices:');
        invoices.forEach(inv => {
            console.log({
                id: inv._id,
                invoiceNumber: inv.invoiceNumber,
                client: inv.customerId?.name || 'Unknown',
                outlet: inv.outletId?.name || 'Unknown',
                total: inv.total,
                dueAmount: inv.dueAmount,
                createdAt: inv.createdAt
            });
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

check();
