require('dotenv').config();
const mongoose = require('mongoose');
const Testimonial = require('./Models/Testimonial');

const testimonials = [
    {
        name: "Claudia Alves",
        role: "CEO, ARTISTRY STUDIO",
        rating: 5,
        content: "Wapixo has completely transformed how we manage our multi-outlet salon.",
        status: "approved"
    },
    {
        name: "Priya Sharma",
        role: "DIRECTOR, URBAN GLOSS",
        rating: 5,
        content: "The WhatsApp automation and smart scheduling have reduced our no-shows by 40%.",
        status: "approved"
    },
    {
        name: "Rahul Varma",
        role: "FOUNDER, ELITE SCISSORS",
        rating: 5,
        content: "Managing inventory across 10 locations was a nightmare before Wapixo.",
        status: "approved"
    }
];

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB.");
    await Testimonial.deleteMany({});
    await Testimonial.insertMany(testimonials);
    console.log("Seeded testimonials.");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
