const mongoose = require('mongoose');
const Category = require('./Models/Category');
const Salon = require('./Models/Salon');
const dotenv = require('dotenv');
dotenv.config();

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const salon = await Salon.findOne();
        if (!salon) {
            console.log('No Salon found. Please seed salons first.');
            process.exit();
        }

        const categories = [
            {
                name: 'Hair Styling',
                gender: 'both',
                salonId: salon._id,
                status: 'active'
            },
            {
                name: 'Skin Care',
                gender: 'women',
                salonId: salon._id,
                status: 'active'
            },
            {
                name: 'Men\'s Grooming',
                gender: 'men',
                salonId: salon._id,
                status: 'active'
            },
            {
                name: 'Bridal Makeup',
                gender: 'women',
                salonId: salon._id,
                status: 'active'
            },
            {
                name: 'Nail Art',
                gender: 'both',
                salonId: salon._id,
                status: 'active'
            }
        ];

        // Clean existing test categories if any
        await Category.deleteMany({ salonId: salon._id });

        // Insert new categories
        await Category.insertMany(categories);
        console.log('5 Categories added successfully!');

        process.exit();
    } catch (err) {
        console.error('Error seeding categories:', err);
        process.exit(1);
    }
};

seedCategories();
