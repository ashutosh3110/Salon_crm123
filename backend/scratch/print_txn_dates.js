const mongoose = require('mongoose');
const path = require('path');
const FinanceTransaction = require('../Models/FinanceTransaction');
const Outlet = require('../Models/Outlet');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const txns = await FinanceTransaction.find({}).sort({ date: -1 });
        const outlets = await Outlet.find({});
        const outletMap = {};
        outlets.forEach(o => {
            outletMap[o._id.toString()] = o.name;
        });

        console.log('Transactions:');
        txns.forEach(t => {
            console.log({
                id: t._id,
                date: t.date,
                category: t.category,
                type: t.type,
                outletId: t.outletId,
                outletNameInDb: t.outletId ? outletMap[t.outletId.toString()] : 'none'
            });
        });

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
}

run();
