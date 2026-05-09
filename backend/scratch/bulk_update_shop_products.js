const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Fix paths to point to correct directories from scratch folder
const Product = require('../Models/Product');

const updateProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Product.updateMany(
            {}, 
            { $set: { isShopProduct: true } }
        );

        console.log(`Successfully updated ${result.modifiedCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating products:', error);
        process.exit(1);
    }
};

updateProducts();
