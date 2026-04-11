const mongoose = require('mongoose');
const Category = require('../Models/Category');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const imagesMap = {
    'Facial & Skin Care': 'https://plus.unsplash.com/premium_photo-1661764393655-1dbffee8c0ce?w=800&q=80',
    'Hair Spa & Styling': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    'Makeup & Bridal': 'https://images.unsplash.com/photo-1481325545291-943f4eee1ad9?w=800&q=80',
    'Nail Art & Care': 'https://images.unsplash.com/photo-1610991148667-009f4705500c?w=800&q=80',
    'Massages & Wellness': 'https://images.unsplash.com/photo-1544161515-4af6b1d8e1c6?w=800&q=80',
    'Body Treatment': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    'Gentlemen\'s Grooming': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    'Hair Coloring': 'https://images.unsplash.com/photo-1620331043323-68d197607739?w=800&q=80',
    'Haircut & Styling': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80',
    'Facial & Skincare': 'https://plus.unsplash.com/premium_photo-1661764393655-1dbffee8c0ce?w=800&q=80'
};

const updateCategoryImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const categories = await Category.find();
        console.log(`Found ${categories.length} categories to update.`);

        let updatedCount = 0;
        for (const cat of categories) {
            let imageUrl = imagesMap[cat.name];
            
            if (!imageUrl) {
                // Try fuzzy match
                const name = cat.name.toLowerCase();
                if (name.includes('hair')) imageUrl = imagesMap['Haircut & Styling'];
                else if (name.includes('skin') || name.includes('facial')) imageUrl = imagesMap['Facial & Skin Care'];
                else if (name.includes('makeup')) imageUrl = imagesMap['Makeup & Bridal'];
                else if (name.includes('nail')) imageUrl = imagesMap['Nail Art & Care'];
                else if (name.includes('massage') || name.includes('wellness')) imageUrl = imagesMap['Massages & Wellness'];
                else imageUrl = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';
            }

            if (cat.image !== imageUrl) {
                cat.image = imageUrl;
                await cat.save();
                updatedCount++;
                console.log(`Updated image for category: ${cat.name}`);
            }
        }

        console.log(`Successfully updated ${updatedCount} categories with premium images!`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error updating category images:', err);
        process.exit(1);
    }
};

updateCategoryImages();
