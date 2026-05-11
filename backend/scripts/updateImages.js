const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const Product = require('../models/Product');
const Service = require('../models/Service');
const Outlet = require('../models/Outlet');
const Salon = require('../models/Salon');
const Cms = require('../models/Cms');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const updateImages = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Update Products
        const productRes = await Product.updateMany({}, {
            $set: {
                image: 'uploads/general/product_1.webp',
                appImage: 'uploads/general/product_1.webp'
            }
        });
        console.log(`Updated ${productRes.modifiedCount} products`);

        // 2. Update Services
        const serviceRes = await Service.updateMany({}, {
            $set: {
                image: 'uploads/services/service_1.webp'
            }
        });
        console.log(`Updated ${serviceRes.modifiedCount} services`);

        // 3. Update Outlets
        const outletRes = await Outlet.updateMany({}, {
            $set: {
                images: ['uploads/outlets/outlet_1.webp']
            }
        });
        console.log(`Updated ${outletRes.modifiedCount} outlets`);

        // 4. Update Salons
        const salonRes = await Salon.updateMany({}, {
            $set: {
                avatar: 'uploads/general/product_1.webp'
            }
        });
        console.log(`Updated ${salonRes.modifiedCount} salons`);

        // 5. Update Banners (CMS)
        const bannerRes = await Cms.findOne({ section: 'banners' });
        if (bannerRes && bannerRes.content) {
            const updatedContent = bannerRes.content.map(item => ({
                ...item,
                image: 'uploads/general/banner_1.webp'
            }));
            bannerRes.content = updatedContent;
            await bannerRes.save();
            console.log('Updated CMS banners');
        }

        console.log('Database image update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating images:', error);
        process.exit(1);
    }
};

updateImages();
