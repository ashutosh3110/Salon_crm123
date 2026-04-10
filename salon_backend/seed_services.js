const mongoose = require('mongoose');
const Service = require('./Models/Service');
const Salon = require('./Models/Salon');
const dotenv = require('dotenv');
dotenv.config();

const seedServices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const salon = await Salon.findOne();
        if (!salon) {
            console.log('No Salon found. Please seed salons first.');
            process.exit();
        }

        const services = [
            {
                name: 'Signature Haircut',
                category: 'Hair Styling',
                description: 'Precision cutting and styling by our top stylists.',
                duration: 45,
                price: 800,
                salonId: salon._id,
                gender: 'both',
                resourceType: 'chair'
            },
            {
                name: 'Hydrating Facial',
                category: 'Skin Care',
                description: 'Deep cleansing and hydration for glowing skin.',
                duration: 60,
                price: 1500,
                salonId: salon._id,
                gender: 'female',
                resourceType: 'cabin'
            },
            {
                name: 'Global Hair Color',
                category: 'Hair Coloring',
                description: 'Full hair color with premium organic products.',
                duration: 120,
                price: 2500,
                salonId: salon._id,
                gender: 'both',
                resourceType: 'chair'
            },
            {
                name: 'Manicure & Pedicure',
                category: 'Nail Care',
                description: 'Complete nail grooming and spa treatment.',
                duration: 90,
                price: 1200,
                salonId: salon._id,
                gender: 'both',
                resourceType: 'chair'
            },
            {
                name: 'Deep Tissue Massage',
                category: 'Wellness',
                description: 'Relieve stress with targeted deep muscle therapy.',
                duration: 60,
                price: 2000,
                salonId: salon._id,
                gender: 'both',
                resourceType: 'cabin'
            }
        ];

        // Clean existing test services if any
        await Service.deleteMany({ salonId: salon._id });

        // Insert new services
        await Service.insertMany(services);
        console.log('5 Services added successfully!');

        process.exit();
    } catch (err) {
        console.error('Error seeding services:', err);
        process.exit(1);
    }
};

seedServices();
