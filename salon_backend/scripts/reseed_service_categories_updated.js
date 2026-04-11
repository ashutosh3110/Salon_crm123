const mongoose = require('mongoose');
const Category = require('../Models/Category');
const Salon = require('../Models/Salon');
const dotenv = require('dotenv');
const path = require('path');

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const categories = [
    {
        name: 'Haircut & Styling',
        gender: 'both',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Hair Coloring',
        gender: 'both',
        image: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Facial & Skin Care',
        gender: 'women',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Hair Spa & Treatment',
        gender: 'both',
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Makeup & Bridal',
        gender: 'women',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Manicure & Pedicure',
        gender: 'women',
        image: 'https://images.unsplash.com/photo-1610992015732-2449b0cd0a16?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Threading & Waxing',
        gender: 'women',
        image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Men\'s Grooming',
        gender: 'men',
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Nail Art',
        gender: 'women',
        image: 'https://images.unsplash.com/photo-1604654894610-df490682160d?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    },
    {
        name: 'Massage Therapy',
        gender: 'both',
        image: 'https://images.unsplash.com/photo-1544161515-4af6b1d46ad5?q=80&w=1000&auto=format&fit=crop',
        status: 'active'
    }
];

const reseedCategories = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const salon = await Salon.findOne();
        if (!salon) {
            console.log('No Salon found. Please seed salons first.');
            process.exit();
        }

        console.log(`Using Salon: ${salon.name} (${salon._id})`);

        // Delete ALL categories for this salon
        const deleteResult = await Category.deleteMany({ salonId: salon._id });
        console.log(`Deleted ${deleteResult.deletedCount} existing categories.`);

        // Prepare new categories
        const categoriesWithSalonId = categories.map(cat => ({
            ...cat,
            salonId: salon._id
        }));

        // Insert new categories
        const insertResult = await Category.insertMany(categoriesWithSalonId);
        console.log(`Successfully added ${insertResult.length} new service categories.`);

        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error reseeding categories:', err);
        process.exit(1);
    }
};

reseedCategories();
