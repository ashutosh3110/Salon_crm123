const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from current directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../Models/Product');

async function migrate() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in .env');
        }
        
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
