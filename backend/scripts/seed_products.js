const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Salon = require('../models/Salon');
const Outlet = require('../models/Outlet');
const ProductCategory = require('../models/ProductCategory');

async function seedProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Find a salon
        const salon = await Salon.findOne();
        if (!salon) {
            console.error('No salon found in database. Cannot seed products.');
            process.exit(1);
        }
        const salonId = salon._id;
        console.log(`Using Salon ID: ${salonId} (${salon.name})`);

        // Find outlets for this salon
        const outlets = await Outlet.find({ salonId });
        const outletIds = outlets.map(o => o._id);
        console.log(`Found ${outletIds.length} outlets.`);

        // Find or create a category
        let category = await ProductCategory.findOne({ salonId });
        if (!category) {
            category = await ProductCategory.create({
                name: 'General Haircare',
                salonId,
                status: 'active'
            });
            console.log('Created new category: General Haircare');
        } else {
            console.log(`Using Category: ${category.name}`);
        }

        // Clean existing dummy products to avoid SKU conflicts
        await Product.deleteMany({ sku: { $in: ['LCS-001', 'KRC-002', 'OAO-003', 'VBM-004', 'PSG-005'] } });
        console.log('Cleared existing dummy products.');

        const dummyProducts = [
            {
                name: 'Premium Silk Shampoo',
                brand: 'LuxeCare',
                sku: 'LCS-001',
                categoryId: category._id,
                description: 'Professional grade silk shampoo for smooth and shiny hair.',
                sellingPrice: 1200,
                stock: 25,
                threshold: 5,
                unit: 'pcs',
                isShopProduct: true,
                images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=1000'],
                salonId,
                outletIds: outletIds,
                stockByOutlet: outletIds.length > 0 ? { [outletIds[0]]: 25 } : { main: 25 }
            },
            {
                name: 'Keratin Repair Conditioner',
                brand: 'SalonPro',
                sku: 'KRC-002',
                categoryId: category._id,
                description: 'Intense keratin repair for damaged and colored hair.',
                sellingPrice: 1450,
                stock: 15,
                threshold: 3,
                unit: 'pcs',
                isShopProduct: true,
                images: ['https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=1000'],
                salonId,
                outletIds: outletIds,
                stockByOutlet: outletIds.length > 0 ? { [outletIds[0]]: 15 } : { main: 15 }
            },
            {
                name: 'Organic Argan Oil',
                brand: 'NaturePure',
                sku: 'OAO-003',
                categoryId: category._id,
                description: '100% pure organic argan oil for hair and scalp nourishment.',
                sellingPrice: 850,
                stock: 40,
                threshold: 10,
                unit: 'pcs',
                isShopProduct: true,
                images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1000'],
                salonId,
                outletIds: outletIds,
                stockByOutlet: outletIds.length > 0 ? { [outletIds[0]]: 40 } : { main: 40 }
            },
            {
                name: 'Volume Boost Mousse',
                brand: 'StylistChoice',
                sku: 'VBM-004',
                categoryId: category._id,
                description: 'Lightweight mousse for maximum volume and long-lasting hold.',
                sellingPrice: 650,
                stock: 10,
                threshold: 2,
                unit: 'pcs',
                isShopProduct: true,
                images: ['https://images.unsplash.com/photo-1594434151375-7be08200f682?q=80&w=1000'],
                salonId,
                outletIds: outletIds,
                stockByOutlet: outletIds.length > 0 ? { [outletIds[0]]: 10 } : { main: 10 }
            },
            {
                name: 'Professional Styling Gel',
                brand: 'SalonPro',
                sku: 'PSG-005',
                categoryId: category._id,
                description: 'Strong hold styling gel with UV protection and moisture control.',
                sellingPrice: 450,
                stock: 30,
                threshold: 5,
                unit: 'pcs',
                isShopProduct: true,
                images: ['https://images.unsplash.com/photo-1585232004423-244e0e6904e3?q=80&w=1000'],
                salonId,
                outletIds: outletIds,
                stockByOutlet: outletIds.length > 0 ? { [outletIds[0]]: 30 } : { main: 30 }
            }
        ];

        console.log('Inserting products...');
        await Product.insertMany(dummyProducts);
        console.log('Successfully re-seeded 5 products with outlet data.');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
}

seedProducts();
