const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Product = require('../backend/Models/Product');

async function migrate() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/salon_crm';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const result = await Product.updateMany(
            { isInclusiveTax: { $exists: false } },
            { $set: { isInclusiveTax: false } }
        );

        console.log(`Migration complete. Updated ${result.modifiedCount} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
