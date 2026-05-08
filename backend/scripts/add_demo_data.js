const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Define Schemas inline to avoid path issues
const SalonSchema = new mongoose.Schema({ name: String });
const OutletSchema = new mongoose.Schema({ name: String, salonId: mongoose.Schema.Types.ObjectId });
const ServiceSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    duration: Number,
    category: String,
    salonId: mongoose.Schema.Types.ObjectId,
    outletIds: [mongoose.Schema.Types.ObjectId],
    status: { type: String, default: 'active' },
    image: String
});
const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number,
    category: String,
    salonId: mongoose.Schema.Types.ObjectId,
    outletIds: [mongoose.Schema.Types.ObjectId],
    isShopProduct: { type: Boolean, default: true },
    image: String
});

const Salon = mongoose.models.Salon || mongoose.model('Salon', SalonSchema);
const Outlet = mongoose.models.Outlet || mongoose.model('Outlet', OutletSchema);
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function addData() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';
        console.log('Connecting to MongoDB at:', uri.split('@')[1] || 'localhost');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const salon = await Salon.findOne();
        if (!salon) {
            console.log('No salon found');
            return;
        }

        const outlets = await Outlet.find({ salonId: salon._id });
        const outletIds = outlets.map(o => o._id);

        if (outletIds.length === 0) {
            console.log('No outlets found for salon:', salon._id);
            return;
        }

        console.log('Adding services...');
        const services = [
            { name: 'Classic Haircut', description: 'Expert styling and precision cut', price: 499, duration: 45, category: 'Hair', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400' },
            { name: 'Signature Facial', description: 'Deep cleansing and rejuvenation', price: 1299, duration: 60, category: 'Skin', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1570172619114-d101795cdd51?q=80&w=400' },
            { name: 'Deep Tissue Massage', description: 'Relieve muscle tension and stress', price: 1999, duration: 90, category: 'Spa', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=400' },
            { name: 'Gel Manicure', description: 'Long-lasting high-gloss nails', price: 799, duration: 40, category: 'Nails', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400' },
            { name: 'Global Hair Color', description: 'Rich, even tone from root to tip', price: 2499, duration: 120, category: 'Hair', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1560869713-7d0a29430863?q=80&w=400' },
            { name: 'Beard Grooming', description: 'Precision trim and oil treatment', price: 299, duration: 25, category: 'Grooming', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400' },
            { name: 'Luxe Pedicure', description: 'Relaxing foot soak and treatment', price: 899, duration: 50, category: 'Nails', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1519415510236-855909a04bc6?q=80&w=400' },
            { name: 'Bridal Makeup', description: 'Flawless look for your special day', price: 9999, duration: 180, category: 'Makeup', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400' },
            { name: 'Hair Spa', description: 'Intensive nourishment for healthy hair', price: 1499, duration: 60, category: 'Hair', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=400' },
            { name: 'Keratin Treatment', description: 'Smooth, frizz-free hair for months', price: 4500, duration: 150, category: 'Hair', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=400' }
        ];

        await Service.deleteMany({ salonId: salon._id });
        await Service.insertMany(services);
        console.log('10 Services added!');

        console.log('Adding products...');
        const products = [
            { name: 'Argan Hair Oil', description: 'Pure organic oil for shine', price: 899, stock: 50, category: 'Haircare', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1626015401419-74e92a2a71d1?q=80&w=400' },
            { name: 'Charcoal Face Wash', description: 'Deep detox for all skin types', price: 349, stock: 100, category: 'Skincare', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400' },
            { name: 'Vitamin C Serum', description: 'Brighten and firm your skin', price: 1199, stock: 30, category: 'Skincare', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400' },
            { name: 'Pro Hair Dryer', description: 'Salon-grade 2000W dryer', price: 3499, stock: 15, category: 'Tools', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' },
            { name: 'Matte Lipstick Set', description: 'Set of 5 long-wear shades', price: 1499, stock: 25, category: 'Makeup', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=400' },
            { name: 'Moisturizing Conditioner', description: 'Extra hydration for dry hair', price: 599, stock: 60, category: 'Haircare', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400' },
            { name: 'Sunscreen SPF 50', description: 'High protection matte finish', price: 499, stock: 80, category: 'Skincare', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1556229162-5c63ed9c4ffb?q=80&w=400' },
            { name: 'Sandalwood Beard Oil', description: 'Softens and tames facial hair', price: 399, stock: 40, category: 'Grooming', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?q=80&w=400' },
            { name: 'Organic Aloe Gel', description: 'Multi-purpose soothing gel', price: 249, stock: 120, category: 'Skincare', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1594411132644-886915151528?q=80&w=400' },
            { name: 'Luxe Scented Candle', description: 'Relaxing lavender aroma', price: 699, stock: 20, category: 'Home', salonId: salon._id, outletIds, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400' }
        ];

        await Product.deleteMany({ salonId: salon._id });
        await Product.insertMany(products);
        console.log('10 Products added!');

    } catch (err) {
        console.error('Error adding data:', err);
    } finally {
        await mongoose.disconnect();
    }
}

addData();
