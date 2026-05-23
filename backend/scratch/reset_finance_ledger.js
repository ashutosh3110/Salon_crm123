const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const FinanceTransaction = require('../Models/FinanceTransaction');
const EndOfDay = require('../Models/EndOfDay');
const Expense = require('../Models/Expense');
const Invoice = require('../Models/Invoice');

const reset = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';
        console.log('Connecting to database:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Database connected successfully.');

        console.log('Clearing FinanceTransaction collection...');
        await FinanceTransaction.deleteMany({});
        
        console.log('Clearing EndOfDay collection...');
        await EndOfDay.deleteMany({});
        
        console.log('Clearing Expense collection...');
        await Expense.deleteMany({});
        
        console.log('Clearing Invoice collection...');
        await Invoice.deleteMany({});

        console.log('All financial ledger and closing data has been successfully set to 0!');
    } catch (err) {
        console.error('Error resetting database:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

reset();
