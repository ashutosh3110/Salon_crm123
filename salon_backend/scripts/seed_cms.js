const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Cms = require('../Models/Cms');
const Salon = require('../Models/Salon');

async function seedCms() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const salon = await Salon.findOne();
        if (!salon) {
            console.error('No salon found to seed CMS for.');
            process.exit(1);
        }
        const tenantId = salon._id;
        console.log(`Seeding CMS for Salon: ${salon.name} (${tenantId})`);

        const banners = [
            {
                id: 'b1',
                title: '50% OFF on Men\'s Haircut',
                subtitle: 'SUMMER SPECIAL',
                btnText: 'Book Now',
                image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1000&q=80',
                link: '/app/book',
                gender: 'men',
                status: 'Active'
            },
            {
                id: 'b2',
                title: 'Premium Glow Facial',
                subtitle: 'WEDDING SEASON',
                btnText: 'Claim Offer',
                image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1000&q=80',
                link: '/app/book',
                gender: 'women',
                status: 'Active'
            },
            {
                id: 'b3',
                title: 'Buy 1 Get 1 Free',
                subtitle: 'SPA RITUALS',
                btnText: 'Explore',
                image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6fd859?w=1000&q=80',
                link: '/app/services',
                gender: 'all',
                status: 'Active'
            },
            {
                id: 'b4',
                title: 'New Beard Grooming Kit',
                subtitle: 'MENS GROOMING',
                btnText: 'Shop Now',
                image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&q=80',
                link: '/app/shop',
                gender: 'men',
                status: 'Active'
            },
            {
                id: 'b5',
                title: 'Elite Bridal Package',
                subtitle: 'LIMITED TIME',
                btnText: 'Book Consultation',
                image: 'https://images.unsplash.com/photo-1481501940778-28cb6a4c2847?w=1000&q=80',
                link: '/app/book',
                gender: 'women',
                status: 'Active'
            }
        ];

        // Update banners section
        await Cms.findOneAndUpdate(
            { section: 'banners', tenantId },
            { section: 'banners', content: banners, tenantId },
            { upsert: true, new: true }
        );

        console.log('Successfully seeded 5 banners for both genders!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding CMS:', err);
        process.exit(1);
    }
}

seedCms();
