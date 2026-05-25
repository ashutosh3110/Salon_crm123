const mongoose = require('mongoose');
require('dotenv').config();

const Outlet = require('../Models/Outlet');
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

        const outlets = await Outlet.find({});
        console.log(`\n=========================================`);
        console.log(`TOTAL OUTLETS FOUND: ${outlets.length}`);
        console.log(`=========================================\n`);

        for (let i = 0; i < outlets.length; i++) {
            const outlet = outlets[i];
            
            // Count approved feedbacks/reviews for this outlet
            const approvedReviewsCount = await Feedback.countDocuments({
                outletId: outlet._id,
                status: 'Approved'
            });

            // Calculate dynamic average rating from approved reviews
            const approvedReviews = await Feedback.find({
                outletId: outlet._id,
                status: 'Approved'
            });

            let avgRating = 'N/A';
            if (approvedReviews.length > 0) {
                const totalRating = approvedReviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
                avgRating = (totalRating / approvedReviews.length).toFixed(1);
            }

            console.log(`${i + 1}. OUTLET NAME       : ${outlet.name}`);
            console.log(`   OUTLET ID         : ${outlet._id}`);
            console.log(`   ACTIVE STATUS     : ${outlet.isActive ? 'Active ✅' : 'Inactive ❌'}`);
            console.log(`   APPROVED REVIEWS  : ${approvedReviewsCount}`);
            console.log(`   DYNAMIC AVG RATING: ${avgRating} ⭐`);
            console.log(`-----------------------------------------`);
        }

        console.log('\nClosing DB connection...');
        await mongoose.connection.close();
        console.log('Connection closed. Exiting.');
        process.exit(0);
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

run();
