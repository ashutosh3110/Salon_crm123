const mongoose = require('mongoose');
const path = require('path');
const FinanceTransaction = require('../Models/FinanceTransaction');
const Outlet = require('../Models/Outlet');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        const txns = await FinanceTransaction.find({});
        console.log(`Total transactions in DB: ${txns.length}`);

        const outlets = await Outlet.find({});
        console.log(`Total outlets in DB: ${outlets.length}`);

        const outletMap = {};
        outlets.forEach(o => {
            outletMap[o._id.toString()] = { name: o.name, salonId: o.salonId };
        });

        console.log('Transactions analysis:');
        txns.forEach(t => {
            const oId = t.outletId ? t.outletId.toString() : null;
            const outletInfo = oId ? outletMap[oId] : null;
            console.log(`Txn ID: ${t._id}, Type: ${t.type}, Category: ${t.category}, OutletID: ${t.outletId}, Matches Outlet in DB: ${outletInfo ? 'YES (' + outletInfo.name + ')' : 'NO'}, SalonID: ${t.salonId}`);
        });

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
        mongoose.connection.close();
    }
}

run();
