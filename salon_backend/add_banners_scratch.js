const mongoose = require('mongoose');
const Cms = require('./Models/Cms');
require('dotenv').config();

async function addBanners() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm');
        console.log('Connected to MongoDB');

        const section = 'banners';
        const tenantId = null; // Global

        let cmsEntry = await Cms.findOne({ tenantId, section });

        const newBanners = [
            {
                id: Date.now(),
                title: 'Summer Glow Special - 20% OFF',
                gender: 'women',
                image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop',
                status: 'Active',
                btnText: 'Claim Now'
            },
            {
                id: Date.now() + 1,
                title: 'Premium Men\'s Grooming',
                gender: 'men',
                image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
                status: 'Active',
                btnText: 'Explore'
            }
        ];

        if (cmsEntry) {
            console.log('Found existing banners, removing links and appending...');
            let existingBanners = Array.isArray(cmsEntry.content) ? cmsEntry.content : [];
            // Remove 'link' from all existing banners
            existingBanners = existingBanners.map(b => {
                const { link, ...rest } = b;
                return rest;
            });
            cmsEntry.content = [...newBanners, ...existingBanners];
            await cmsEntry.save();
        } else {
            console.log('Creating global banners section...');
            await Cms.create({
                tenantId,
                section,
                content: newBanners
            });
        }

        console.log('Successfully added 2 sample banners!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

addBanners();
