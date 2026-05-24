const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../Models/Product');

async function seed() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully.');

        // Get 3 active products
        const products = await Product.find({ status: 'active' }).limit(3);
        
        if (products.length < 3) {
            console.warn(`Only found ${products.length} active products. Please make sure you have at least 3 active products.`);
        }

        const today = new Date();

        // 1. Expired product (e.g., expired 10 days ago)
        if (products[0]) {
            const expiredDate = new Date();
            expiredDate.setDate(today.getDate() - 10);
            const mfgDate = new Date();
            mfgDate.setFullYear(today.getFullYear() - 1);

            products[0].expiryDate = expiredDate;
            products[0].mfgDate = mfgDate;
            await products[0].save();
            console.log(`Updated "${products[0].name}" as EXPIRED (Expiry: ${expiredDate.toISOString().split('T')[0]})`);
        }

        // 2. Near Expiry product (e.g., expiring in 12 days)
        if (products[1]) {
            const nearExpiryDate = new Date();
            nearExpiryDate.setDate(today.getDate() + 12);
            const mfgDate = new Date();
            mfgDate.setMonth(today.getMonth() - 6);

            products[1].expiryDate = nearExpiryDate;
            products[1].mfgDate = mfgDate;
            await products[1].save();
            console.log(`Updated "${products[1].name}" as NEAR EXPIRY (Expiry: ${nearExpiryDate.toISOString().split('T')[0]})`);
        }

        // 3. Good product (e.g., expiring in 180 days)
        if (products[2]) {
            const goodExpiryDate = new Date();
            goodExpiryDate.setDate(today.getDate() + 180);
            const mfgDate = new Date();
            mfgDate.setMonth(today.getMonth() - 2);

            products[2].expiryDate = goodExpiryDate;
            products[2].mfgDate = mfgDate;
            await products[2].save();
            console.log(`Updated "${products[2].name}" as GOOD/FAR EXPIRY (Expiry: ${goodExpiryDate.toISOString().split('T')[0]})`);
        }

        console.log('Test expiry dates seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding test expiry data:', error);
        process.exit(1);
    }
}

seed();
