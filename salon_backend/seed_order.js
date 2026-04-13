const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function seedOrders() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
        const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const Salon = mongoose.model('Salon', new mongoose.Schema({}, { strict: false }));
        
        const customer = await Customer.findOne();
        const salon = await Salon.findOne();
        const product = await Product.findOne();
        
        if (!customer || !salon || !product) {
            console.log('Missing data to seed orders');
            process.exit(0);
        }
        
        console.log(`Seeding order for ${customer.name} at ${salon.name}`);
        
        await Order.create({
            customerId: customer._id,
            salonId: salon._id,
            items: [{
                productId: product._id,
                quantity: 1,
                price: product.price || 500
            }],
            totalAmount: product.price || 500,
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            status: 'processing'
        });
        
        console.log('Order seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedOrders();
