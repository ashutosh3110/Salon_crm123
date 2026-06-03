const mongoose = require('mongoose');
const Invoice = require('./Models/Invoice');
const Order = require('./Models/Order');

const MONGO_URI = 'mongodb://mohammadrehan00121_db_user:4QlKqb1h5rM05lSZ@ac-al5duhf-shard-00-00.rnxrxmk.mongodb.net:27017,ac-al5duhf-shard-00-01.rnxrxmk.mongodb.net:27017,ac-al5duhf-shard-00-02.rnxrxmk.mongodb.net:27017/Saloon_Test?ssl=true&replicaSet=atlas-xosmfq-shard-0&authSource=admin&appName=Cluster0';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const totalInvoices = await Invoice.countDocuments();
        console.log('Total Invoices in DB:', totalInvoices);

        const invoicesWithService = await Invoice.countDocuments({
            'items.type': 'service'
        });
        console.log('Invoices with service:', invoicesWithService);

        const invoicesWithProduct = await Invoice.countDocuments({
            'items.type': 'product'
        });
        console.log('Invoices with product:', invoicesWithProduct);

        const invoicesWithOnlyProduct = await Invoice.countDocuments({
            'items.type': 'product',
            'items.type': { $ne: 'service' }
        });
        console.log('Invoices with ONLY product:', invoicesWithOnlyProduct);

        const totalOrders = await Order.countDocuments();
        console.log('Total Orders in DB:', totalOrders);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
