const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const FeedbackSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    salonId: mongoose.Schema.Types.ObjectId,
    outletId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
    customerName: String,
    status: { type: String, default: 'active' }
}, { timestamps: true });

const OutletSchema = new mongoose.Schema({ name: String, salonId: mongoose.Schema.Types.ObjectId });
const SalonSchema = new mongoose.Schema({ name: String });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
const Outlet = mongoose.models.Outlet || mongoose.model('Outlet', OutletSchema);
const Salon = mongoose.models.Salon || mongoose.model('Salon', SalonSchema);

async function addReviews() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const salon = await Salon.findOne();
        const outlets = await Outlet.find({ salonId: salon._id });

        const reviews = [
            { name: 'Anjali Sharma', comment: 'Amazing haircut! The staff was very professional and the ambiance was great.', rating: 5 },
            { name: 'Rahul Verma', comment: 'Best facial I have ever had. My skin feels so refreshed.', rating: 5 },
            { name: 'Priya Das', comment: 'Highly recommend the gel manicure. It lasted for weeks!', rating: 4 },
            { name: 'Siddharth Malhotra', comment: 'Great beard grooming session. Very precise.', rating: 5 },
            { name: 'Sneha Kapoor', comment: 'Loved the hair spa. Extremely relaxing and nourishing.', rating: 5 },
            { name: 'Amit Jain', comment: 'Quick and efficient classic haircut. Perfect for busy professionals.', rating: 4 },
            { name: 'Megha Singh', comment: 'The bridal makeup was flawless. Thank you for making my day special!', rating: 5 },
            { name: 'Vikram Rao', comment: 'Excellent massage service. Really helped with my back pain.', rating: 5 },
            { name: 'Kavita Reddy', comment: 'Beautiful nail art and friendly service.', rating: 4 },
            { name: 'Arjun Gupta', comment: 'The global hair color looks fantastic. Exactly what I wanted.', rating: 5 }
        ];

        console.log('Adding reviews to outlets...');
        for (const outlet of outlets) {
            const outletReviews = reviews.map(r => ({
                salonId: salon._id,
                outletId: outlet._id,
                rating: r.rating,
                comment: r.comment,
                customerName: r.name,
                status: 'active'
            }));
            await Feedback.insertMany(outletReviews);
            console.log(`Added 10 reviews to outlet: ${outlet.name}`);
        }

        console.log('Done!');
    } catch (err) {
        console.error('Error adding reviews:', err);
    } finally {
        await mongoose.disconnect();
    }
}

addReviews();
