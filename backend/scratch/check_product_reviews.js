const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../Models/Product');
const Feedback = require('../Models/Feedback');

async function run() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('Error: MONGODB_URI is not defined in .env file!');
            process.exit(1);
        }

        console.log('Connecting to database...');
        await mongoose.connect(uri);
        console.log('Successfully connected to MongoDB.');

        // Get approved feedbacks/reviews for products
        const productReviews = await Feedback.find({
            targetType: 'product',
            status: 'Approved'
        });

        console.log(`\n=========================================`);
        console.log(`TOTAL APPROVED PRODUCT REVIEWS: ${productReviews.length}`);
        console.log(`=========================================\n`);

        for (let i = 0; i < productReviews.length; i++) {
            const rev = productReviews[i];
            console.log(`${i + 1}. CUSTOMER  : ${rev.customerName}`);
            console.log(`   PRODUCT ID: ${rev.targetId}`);
            console.log(`   PROD NAME : ${rev.targetName}`);
            console.log(`   RATING    : ${rev.rating} ⭐`);
            console.log(`   COMMENT   : "${rev.comment}"`);
            console.log(`-----------------------------------------`);
        }

        // Count how many products have approved reviews
        const products = await Product.find({ isShopProduct: true });
        console.log(`\nShop Products details:`);
        for (const p of products) {
            const count = await Feedback.countDocuments({
                targetId: p._id,
                targetType: 'product',
                status: 'Approved'
            });
            if (count > 0) {
                console.log(`   - Product: "${p.name}" (ID: ${p._id}) has ${count} Approved Reviews!`);
            }
        }

        console.log('\nClosing DB connection...');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

run();
