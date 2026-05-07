const mongoose = require('mongoose');
const Product = require('../Models/Product');
require('dotenv').config();

const updateProductForShop = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const result = await Product.updateMany(
            { name: 'L\'Oreal Professional Shampoo' },
            { 
                $set: { 
                    isShopProduct: true,
                    availability: 'all',
                    appImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000',
                    brand: 'L\'Oreal Professional',
                    rating: 4.8,
                    likes: 12,
                    status: 'active'
                } 
            }
        );

        console.log(`Updated ${result.modifiedCount} products for shop visibility.`);
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

updateProductForShop();
