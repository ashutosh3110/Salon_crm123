const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../Models/Product');
const ProductCategory = require('../Models/ProductCategory');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohammadrehan00121_db_user:xqFnRRwX607Kkxd4@cluster0.rnxrxmk.mongodb.net/Saloon';
const SALON_ID = '69d8a705831ad5a5c6c3c47f';
const OUTLET_ID = '69d8e85e74687a89922644f6';

const categoriesToSeed = [
    { name: 'Hair Care', image: 'https://images.unsplash.com/photo-1527799822367-a23354e00744?q=80&w=800' },
    { name: 'Skin Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800' },
    { name: 'Styling', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800' },
    { name: 'Fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800' }
];

const productsToSeed = [
    { name: 'Ultra Hydrating Shampoo', category: 'Hair Care', price: 899, brand: 'Wapixo Pro', image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?q=80&w=800' },
    { name: 'Argan Oil Serum', category: 'Hair Care', price: 1249, brand: 'Wapixo Pro', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800' },
    { name: 'Vitamin C Glowing Serum', category: 'Skin Care', price: 1599, brand: 'DermaGlow', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800' },
    { name: 'Hyaluronic Acid Moisturizer', category: 'Skin Care', price: 949, brand: 'DermaGlow', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800' },
    { name: 'Strong Hold Matte Clay', category: 'Styling', price: 649, brand: 'BarberX', image: 'https://images.unsplash.com/photo-1590159446722-67189c9d3000?q=80&w=800' },
    { name: 'Sea Salt Texturizing Spray', category: 'Styling', price: 799, brand: 'BarberX', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=800' },
    { name: 'Midnight Oud Cologne', category: 'Fragrance', price: 2499, brand: 'Essence', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800' },
    { name: 'Summer Breeze EDP', category: 'Fragrance', price: 1899, brand: 'Essence', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800' },
    { name: 'Deep Clean Charcoal Mask', category: 'Skin Care', price: 499, brand: 'DermaGlow', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800' },
    { name: 'Shea Butter Conditioner', category: 'Hair Care', price: 749, brand: 'Wapixo Pro', image: 'https://images.unsplash.com/photo-1500333917452-4546e5011746?q=80&w=800' }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create Categories
        const categoryMap = {};
        for (const catData of categoriesToSeed) {
            let cat = await ProductCategory.findOne({ salonId: SALON_ID, name: catData.name });
            if (!cat) {
                cat = await ProductCategory.create({
                    salonId: SALON_ID,
                    name: catData.name,
                    image: catData.image,
                    status: 'active'
                });
                console.log(`Created category: ${cat.name}`);
            }
            categoryMap[catData.name] = cat._id;
        }

        // 2. Create Products
        for (const pData of productsToSeed) {
            const existing = await Product.findOne({ salonId: SALON_ID, name: pData.name });
            if (existing) {
                console.log(`Product already exists: ${pData.name}`);
                continue;
            }

            const product = await Product.create({
                salonId: SALON_ID,
                outletIds: [OUTLET_ID],
                name: pData.name,
                brand: pData.brand,
                categoryId: categoryMap[pData.category],
                sellingPrice: pData.price,
                costPrice: Math.floor(pData.price * 0.6),
                image: pData.image,
                appImage: pData.image,
                isShopProduct: true,
                appCategory: pData.category,
                shopDescription: `High-quality ${pData.name} by ${pData.brand}. Perfect for your regular use.`,
                stock: 50,
                stockByOutlet: new Map([[OUTLET_ID, 50]]),
                status: 'active',
                rating: 4.5 + Math.random() * 0.5
            });
            console.log(`Created product: ${product.name}`);
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
