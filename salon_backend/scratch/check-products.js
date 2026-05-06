const mongoose = require('mongoose');
const Product = require('../Models/Product');
const Outlet = require('../Models/Outlet');
require('dotenv').config();

const checkProductsByOutlet = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const products = await Product.find({});
        const outlets = await Outlet.find({});
        console.log(`Found ${products.length} products and ${outlets.length} outlets.`);

        const outletMap = {};
        outlets.forEach(o => {
            outletMap[o._id.toString()] = o.name;
        });

        const stats = {};

        products.forEach(p => {
            if (p.outletIds && Array.isArray(p.outletIds)) {
                p.outletIds.forEach(oid => {
                    const idStr = oid.toString();
                    const name = outletMap[idStr] || 'Unknown Outlet (' + idStr + ')';
                    stats[name] = (stats[name] || 0) + 1;
                });
            } else if (p.outletId) {
                const idStr = p.outletId.toString();
                if (idStr !== 'all') {
                    const name = outletMap[idStr] || 'Unknown Outlet (' + idStr + ')';
                    stats[name] = (stats[name] || 0) + 1;
                } else {
                    stats['All Outlets'] = (stats['All Outlets'] || 0) + 1;
                }
            }
        });

        console.log('\n--- Product Distribution by Outlet ---');
        if (Object.keys(stats).length === 0) {
            console.log('No products found or no outlets associated.');
        } else {
            Object.entries(stats).forEach(([name, count]) => {
                console.log(`${name}: ${count} Products`);
            });
        }
        console.log('--------------------------------------\n');

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkProductsByOutlet();
