const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('../Models/Service');
const Category = require('../Models/Category');
const Salon = require('../Models/Salon');
const Outlet = require('../Models/Outlet');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohammadrehan00121_db_user:xqFnRRwX607Kkxd4@cluster0.rnxrxmk.mongodb.net/Saloon';

const categoriesToSeed = [
    { name: 'Hair Services', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800', gender: 'both' },
    { name: 'Facial & Skincare', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800', gender: 'both' },
    { name: 'Body Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800', gender: 'both' },
    { name: 'Nail Lounge', image: 'https://images.unsplash.com/photo-1604654894611-6973b376cbde?q=80&w=800', gender: 'women' }
];

const servicesToSeed = [
    { name: 'Designer Haircut', category: 'Hair Services', price: 999, duration: 45, image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600' },
    { name: 'Global Hair Color', category: 'Hair Services', price: 2499, duration: 120, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600' },
    { name: 'Hydrating Glow Facial', category: 'Facial & Skincare', price: 1899, duration: 60, image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?q=80&w=600' },
    { name: 'Anti-Aging Treatment', category: 'Facial & Skincare', price: 2999, duration: 75, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600' },
    { name: 'Deep Tissue Massage', category: 'Body Massage', price: 2199, duration: 60, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600' },
    { name: 'Swedish Aromatherapy', category: 'Body Massage', price: 2599, duration: 90, image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600' },
    { name: 'Gel Nail Extensions', category: 'Nail Lounge', price: 1499, duration: 90, image: 'https://images.unsplash.com/photo-1604654894611-6973b376cbde?q=80&w=600' },
    { name: 'Luxury Manicure', category: 'Nail Lounge', price: 799, duration: 40, image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=600' },
    { name: 'Keratin Smoothing', category: 'Hair Services', price: 4999, duration: 180, image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=600' },
    { name: 'Beard Grooming Royal', category: 'Hair Services', price: 499, duration: 30, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600' }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const salon = await Salon.findOne();
        if (!salon) {
            console.log('No salon found');
            process.exit(0);
        }
        const SALON_ID = salon._id;

        const outlet = await Outlet.findOne({ salonId: SALON_ID });
        const OUTLET_IDS = outlet ? [outlet._id] : [];

        console.log(`Using Salon: ${salon.name} (${SALON_ID})`);

        // 1. Create Categories
        for (const catData of categoriesToSeed) {
            let cat = await Category.findOne({ salonId: SALON_ID, name: catData.name });
            if (!cat) {
                cat = await Category.create({
                    salonId: SALON_ID,
                    name: catData.name,
                    gender: catData.gender,
                    image: catData.image,
                    status: 'active'
                });
                console.log(`Created category: ${cat.name}`);
            }
        }

        // 2. Create Services
        for (const sData of servicesToSeed) {
            const existing = await Service.findOne({ salonId: SALON_ID, name: sData.name });
            if (existing) {
                console.log(`Service already exists: ${sData.name}`);
                continue;
            }

            const service = await Service.create({
                salonId: SALON_ID,
                outletIds: OUTLET_IDS,
                name: sData.name,
                category: sData.category,
                price: sData.price,
                duration: sData.duration,
                image: sData.image,
                status: 'active',
                gender: sData.category === 'Nail Lounge' ? 'female' : 'both',
                resourceType: 'chair'
            });
            console.log(`Created service: ${service.name}`);
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
