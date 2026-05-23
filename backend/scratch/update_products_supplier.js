const mongoose = require('mongoose');
const Product = require('../Models/Product');
const Supplier = require('../Models/Supplier');
require('dotenv').config();

async function updateProductsSupplier() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB successfully!');

        // 1. Fetch all suppliers
        const suppliers = await Supplier.find({});
        console.log(`Found ${suppliers.length} active supplier(s) in the database.`);

        if (suppliers.length === 0) {
            console.log('Error: No suppliers found in the database. Please onboard a supplier first!');
            mongoose.connection.close();
            return;
        }

        // 2. Fetch all products
        const products = await Product.find({});
        console.log(`Found ${products.length} product(s) in the database.`);

        if (products.length === 0) {
            console.log('No products found to update.');
            mongoose.connection.close();
            return;
        }

        // 3. Map or assign products to their salon's suppliers
        let updatedCount = 0;
        for (const product of products) {
            // Find a supplier from the same salon, or fallback to the first available supplier in the DB
            let chosenSupplier = suppliers.find(s => String(s.salonId) === String(product.salonId));
            if (!chosenSupplier) {
                chosenSupplier = suppliers[0]; // fallback
            }

            if (chosenSupplier) {
                product.supplier = chosenSupplier.name;
                await product.save();
                updatedCount++;
                console.log(`Updated Product: "${product.name}" [SKU: ${product.sku || 'N/A'}] assigned to Supplier: "${chosenSupplier.name}"`);
            }
        }

        console.log(`\nSuccessfully updated ${updatedCount} products with active suppliers!`);
        mongoose.connection.close();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

updateProductsSupplier();
