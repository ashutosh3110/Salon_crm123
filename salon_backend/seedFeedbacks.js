const mongoose = require('mongoose');
const Feedback = require('./Models/Feedback');
const dotenv = require('dotenv');

dotenv.config();

const feedbacks = [
    {
        customerName: "Rahul Verma",
        rating: 5,
        comment: "Excellent service! The staff is very professional and the hygiene standards are top-notch.",
        targetType: "service",
        targetName: "Signature Ritual",
        status: "Approved"
    },
    {
        customerName: "Sneha Kapoor",
        rating: 5,
        comment: "Highly recommend the Gold Glow Facial. My skin feels amazing!",
        targetType: "service",
        targetName: "Gold Glow Facial",
        status: "Approved"
    },
    {
        customerName: "Anil Deshmukh",
        rating: 4,
        comment: "Good experience with the Executive Grooming. Value for money.",
        targetType: "service",
        targetName: "Executive Grooming",
        status: "Approved"
    },
    {
        customerName: "Meera Nair",
        rating: 5,
        comment: "The Aromatherapy Spa is so relaxing. Perfect getaway from busy life.",
        targetType: "service",
        targetName: "Aromatherapy Spa",
        status: "Approved"
    }
];

async function seedFeedbacks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get the first salon ID
        const Salon = require('./Models/Salon');
        const salon = await Salon.findOne();
        
        if (!salon) {
            console.log('No salon found to link feedbacks');
            process.exit(1);
        }

        const salonId = salon._id;

        // Clear existing feedbacks for this salon if any (optional, but keep it clean)
        // await Feedback.deleteMany({ salonId });

        const feedbacksToCreate = feedbacks.map(f => ({ ...f, salonId }));
        
        await Feedback.insertMany(feedbacksToCreate);
        console.log(`${feedbacksToCreate.length} feedbacks seeded for salon ${salon.name}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedFeedbacks();
