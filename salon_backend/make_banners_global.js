const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Cms = require('./Models/Cms');

async function makeBannersGlobal() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find the banners section
        const banners = await Cms.findOne({ section: 'banners' });
        if (banners) {
            console.log(`Found banners for tenant: ${banners.tenantId}`);
            if (banners.tenantId !== null) {
                // Check if a global one already exists
                const globalBanners = await Cms.findOne({ section: 'banners', tenantId: null });
                if (globalBanners) {
                   console.log('Global banners already exist. Overwriting with these ones...');
                   globalBanners.content = banners.content;
                   await globalBanners.save();
                   await Cms.deleteOne({ _id: banners._id });
                } else {
                    banners.tenantId = null;
                    await banners.save();
                    console.log('Banners are now global!');
                }
            } else {
                console.log('Banners are already global.');
            }
        } else {
            console.log('No banners found to make global.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

makeBannersGlobal();
