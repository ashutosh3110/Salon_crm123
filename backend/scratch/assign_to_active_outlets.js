const mongoose = require('mongoose');
const path = require('path');
const FinanceTransaction = require('../Models/FinanceTransaction');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const delhiId = '69fdcb811a21bf41d074807f';
        const indoreId = '69fdcb421a21bf41d0748045';

        const txns = await FinanceTransaction.find({ salonId: '69fdc9e21a21bf41d0747f8e' });
        console.log(`Found ${txns.length} transactions for salon.`);

        let count = 0;
        for (let i = 0; i < txns.length; i++) {
            const txn = txns[i];
            const assignedOutlet = (i % 2 === 0) ? delhiId : indoreId;
            txn.outletId = new mongoose.Types.ObjectId(assignedOutlet);
            await txn.save();
            console.log(`Assigned txn ${txn._id} (${txn.category}) to outlet: ${assignedOutlet === delhiId ? 'Rehan hair - delhi' : 'Rehan Hair - Indore'}`);
            count++;
        }

        console.log(`Successfully updated ${count} transactions.`);
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
}

run();
