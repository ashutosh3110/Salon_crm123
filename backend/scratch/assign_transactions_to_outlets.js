const mongoose = require('mongoose');
const path = require('path');
const FinanceTransaction = require('../Models/FinanceTransaction');
const Outlet = require('../Models/Outlet');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Get all transactions
        const txns = await FinanceTransaction.find({});
        console.log(`Total transactions in DB: ${txns.length}`);

        // Get only ACTIVE outlets
        const activeOutlets = await Outlet.find({ isActive: true });
        console.log(`Total active outlets in DB: ${activeOutlets.length}`);
        activeOutlets.forEach(o => console.log(` - ${o.name} (${o._id}) [Salon: ${o.salonId}]`));

        if (activeOutlets.length === 0) {
            console.error('No active outlets found!');
            mongoose.connection.close();
            return;
        }

        // Group active outlets by salonId
        const activeOutletsBySalon = {};
        activeOutlets.forEach(o => {
            const sId = o.salonId.toString();
            if (!activeOutletsBySalon[sId]) {
                activeOutletsBySalon[sId] = [];
            }
            activeOutletsBySalon[sId].push(o);
        });

        // Track distribution index per salon
        const distributionIndex = {};

        let count = 0;
        for (const txn of txns) {
            const sId = txn.salonId.toString();
            const salonActiveOutlets = activeOutletsBySalon[sId] || [];

            if (salonActiveOutlets.length === 0) {
                console.warn(`Warning: Salon ${sId} has no active outlets. Skipping transaction ${txn._id}`);
                continue;
            }

            if (!distributionIndex[sId]) {
                distributionIndex[sId] = 0;
            }

            const assignedOutlet = salonActiveOutlets[distributionIndex[sId] % salonActiveOutlets.length];
            txn.outletId = assignedOutlet._id;
            await txn.save();
            
            console.log(`Assigned txn ${txn._id} (Salon: ${sId}) to ACTIVE outlet: ${assignedOutlet.name} (${assignedOutlet._id})`);
            distributionIndex[sId]++;
            count++;
        }

        console.log(`Successfully updated/redistributed ${count} transactions.`);
        mongoose.connection.close();
        console.log('DB connection closed.');
    } catch (err) {
        console.error('Error occurred:', err);
        mongoose.connection.close();
    }
}

run();
