const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Customer = require('../Models/Customer');

async function run() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is missing');
        }
        await mongoose.connect(uri);
        console.log('Connected to DB');
        
        const result = await Customer.updateMany({}, { $set: { walletBalance: 0 } });
        console.log(`Successfully reset global wallet balance to 0 for ${result.modifiedCount} customers.`);
        
        await mongoose.disconnect();
        console.log('Disconnected from DB');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
