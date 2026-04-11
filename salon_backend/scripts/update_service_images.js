const mongoose = require('mongoose');
const Service = require('../Models/Service');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const imagesMap = {
    'Hydrating Facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    'Global Hair Color': 'https://images.unsplash.com/photo-1620331043323-68d197607739?w=800&q=80',
    'Manicure & Pedicure': 'https://images.unsplash.com/photo-1610991148667-009f4705500c?w=800&q=80',
    'Deep Tissue Massage': 'https://images.unsplash.com/photo-1544161515-4af6b1d8e1c6?w=800&q=80',
    'Signature Haircut': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    'Beard Trim': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    'Bridal Makeup': 'https://images.unsplash.com/photo-1481325545291-943f4eee1ad9?w=800&q=80',
    'Body Polishing': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    'Hair Botox': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    'Keratin Treatment': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80'
};

const updateServiceImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const services = await Service.find();
        console.log(`Found ${services.length} services to check/update.`);

        let updatedCount = 0;
        for (const service of services) {
            let imageUrl = imagesMap[service.name];
            
            // If specific match not found, use category-based fallback
            if (!imageUrl) {
                const cat = service.category?.toLowerCase();
                if (cat?.includes('hair')) imageUrl = 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80';
                else if (cat?.includes('skin') || cat?.includes('facial')) imageUrl = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80';
                else if (cat?.includes('massage') || cat?.includes('wellness')) imageUrl = 'https://images.unsplash.com/photo-1544161515-4af6b1d8e1c6?w=800&q=80';
                else if (cat?.includes('nail')) imageUrl = 'https://images.unsplash.com/photo-1610991148667-009f4705500c?w=800&q=80';
                else imageUrl = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'; // Default premium salon image
            }

            if (service.image !== imageUrl) {
                service.image = imageUrl;
                await service.save();
                updatedCount++;
                console.log(`Updated image for: ${service.name}`);
            }
        }

        console.log(`Successfully updated ${updatedCount} services with premium images!`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error updating service images:', err);
        process.exit(1);
    }
};

updateServiceImages();
