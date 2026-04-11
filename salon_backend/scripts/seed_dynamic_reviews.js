const mongoose = require('mongoose');
const Feedback = require('../Models/Feedback');
const Salon = require('../Models/Salon');
const Service = require('../Models/Service');
const Product = require('../Models/Product');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const salon = await Salon.findOne();
        if (!salon) {
            console.log('No Salon found.');
            process.exit();
        }

        const services = await Service.find({ salonId: salon._id }).limit(5);
        const products = await Product.find({ salonId: salon._id }).limit(5);

        const reviewData = [
            { customerName: 'Amit Sharma', rating: 5, comment: 'The Haircut & Styling was exceptional. The stylist really understood what I wanted!', targetType: 'service', targetId: services[0]?._id, targetName: services[0]?.name || 'Haircut' },
            { customerName: 'Priya Singh', rating: 5, comment: 'Best Facial & Skin Care experience ever. My skin feels so rejuvenated!', targetType: 'service', targetId: services[1]?._id, targetName: services[1]?.name || 'Facial' },
            { customerName: 'Suresh Raina', rating: 4, comment: 'Great Men\'s Grooming session. Highly professional staff.', targetType: 'service', targetId: services[2]?._id, targetName: services[2]?.name || 'Grooming' },
            { customerName: 'Anjali Gupta', rating: 5, comment: 'Loved the Nail Art! The detailing is perfect.', targetType: 'service', targetId: services[3]?._id, targetName: services[3]?.name || 'Nail Art' },
            { customerName: 'Vikram Seth', rating: 5, comment: 'Very relaxing Massage Therapy. Worth every penny.', targetType: 'service', targetId: services[4]?._id, targetName: services[4]?.name || 'Massage' },
            { customerName: 'Neha Kapoor', rating: 5, comment: 'The premium shampoo I bought is working wonders for my hair!', targetType: 'product', targetId: products[0]?._id, targetName: products[0]?.name || 'Shampoo' },
            { customerName: 'Rajesh Khanna', rating: 4, comment: 'Excellent service and friendly environment. Will definitely visit again.', targetType: 'general', targetName: 'General Service' },
            { customerName: 'Meena Kumari', rating: 5, comment: 'Bridal makeup was exactly how I imagined it. Thank you!', targetType: 'service', targetName: 'Bridal Makeup' },
            { customerName: 'Kunal Kohli', rating: 4, comment: 'Good value for money. The staff is skilled and polite.', targetType: 'general', targetName: 'Overall Experience' },
            { customerName: 'Pooja Bhatt', rating: 5, comment: 'Highly recommend this salon for anyone looking for premium care.', targetType: 'general', targetName: 'Luxury Care' }
        ];

        // Delete existing Approved reviews to avoid duplicates
        await Feedback.deleteMany({ salonId: salon._id });

        const finalReviews = reviewData.map(r => ({
            ...r,
            salonId: salon._id,
            status: 'Approved'
        }));

        await Feedback.insertMany(finalReviews);
        console.log('Successfully seeded 10 dynamic reviews with customerName and targetName!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding reviews:', err);
        process.exit(1);
    }
};

seedReviews();
