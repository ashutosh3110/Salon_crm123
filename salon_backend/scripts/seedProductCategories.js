require('dotenv').config();
const mongoose = require('mongoose');
const ProductCategory = require('../Models/ProductCategory');
const Salon = require('../Models/Salon');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected to seed categories');
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    try {
        // Find first salon to assign categories
        const salon = await Salon.findOne();
        if (!salon) {
            console.error('No salon found in database. Create a salon first.');
            process.exit(1);
        }

        const categories = [
            {
                name: 'Hair Care Rituals',
                image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1000',
                salonId: salon._id,
                status: 'active'
            },
            {
                name: 'Premium Skin Serums',
                image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000',
                salonId: salon._id,
                status: 'active'
            },
            {
                name: 'Organic Grooming Kits',
                image: 'https://images.unsplash.com/photo-1621605815841-28b940bc7ef5?q=80&w=1000',
                salonId: salon._id,
                status: 'active'
            },
            {
                name: 'Luxury Fragrances',
                image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000',
                salonId: salon._id,
                status: 'active'
            },
            {
                name: 'Professional Styling',
                image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1000',
                salonId: salon._id,
                status: 'active'
            }
        ];

        // Clear existing (optional) or just add
        // await ProductCategory.deleteMany({ salonId: salon._id });
        
        const created = await ProductCategory.insertMany(categories);
        console.log(`Successfully added ${created.length} product categories for Salon: ${salon.name}`);
        
    } catch (err) {
        console.error('Seeding failed:', err.message);
    } finally {
        mongoose.connection.close();
    }
};

seed();
