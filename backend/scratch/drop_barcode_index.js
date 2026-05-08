const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dropIndex = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('products');

        console.log('Attempting to drop barcode_1 index...');
        await collection.dropIndex('barcode_1');
        console.log('Successfully dropped barcode_1 index.');

    } catch (error) {
        console.error('Error dropping index:', error.message);
        if (error.message.includes('index not found')) {
            console.log('Index barcode_1 does not exist, skipping.');
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    }
};

dropIndex();
