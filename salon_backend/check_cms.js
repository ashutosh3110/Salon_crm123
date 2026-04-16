const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const Cms = require('./Models/Cms');

async function checkCms() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const allCms = await Cms.find({});
        console.log(`Found ${allCms.length} CMS items`);
        
        allCms.forEach(item => {
            console.log(`- Section: ${item.section}, TenantId: ${item.tenantId}, Items: ${Array.isArray(item.content) ? item.content.length : 'Mixed'}`);
            if (item.section === 'banners') {
                console.log('  Banners Content:', JSON.stringify(item.content, null, 2));
            }
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCms();
