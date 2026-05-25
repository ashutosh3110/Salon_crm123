const mongoose = require('mongoose');
const path = require('path');
const FinanceTransaction = require('../Models/FinanceTransaction');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Mimic getTransactions query
        const query = { salonId: new mongoose.Types.ObjectId('69fdc9e21a21bf41d0747f8e') };
        const transactions = await FinanceTransaction.find(query).sort({ date: -1 });

        console.log('JSON returned from DB:');
        console.log(JSON.stringify(transactions.map(t => ({
            id: t._id,
            category: t.category,
            outletId: t.outletId,
            outletIdType: typeof t.outletId,
            outletIdIsObjectId: t.outletId instanceof mongoose.Types.ObjectId
        })), null, 2));

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
}

run();
