const mongoose = require('mongoose');
const Product = require('../Models/Product');
const Outlet = require('../Models/Outlet');
const Salon = require('../Models/Salon');
const ProductCategory = require('../Models/ProductCategory');
require('dotenv').config();

const addSampleProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const outlet = await Outlet.findOne({});
        if (!outlet) {
            console.log('No outlet found.');
            return;
        }

        const salonId = outlet.salonId;
        const outletId = outlet._id;

        // Find or create a category
        let category = await ProductCategory.findOne({ salonId });
        if (!category) {
            category = await ProductCategory.create({
                name: 'Hair Care',
                description: 'Hair care products',
                salonId: salonId,
                status: 'active'
            });
            console.log('Created new product category: Hair Care');
        }

        const sampleProduct = {
            name: 'L\'Oreal Professional Shampoo',
            description: 'Deep nourishing shampoo for dry hair',
            categoryId: category._id,
            price: 899,
            sellingPrice: 850,
            costPrice: 600,
            stock: 50,
            minStock: 5,
            salonId: salonId,
            outletIds: [outletId],
            status: 'active',
            unit: 'piece'
        };

        const product = await Product.create(sampleProduct);
        console.log(`Product created successfully: ${product.name}`);
        console.log(`Associated with Outlet: ${outlet.name}`);

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

addSampleProduct();
