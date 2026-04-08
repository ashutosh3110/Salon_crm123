import mongoose from 'mongoose';
import { config } from './src/config/index.js';

const checkCollections = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        const tenantColl = mongoose.connection.db.collection('tenants');
        const count = await tenantColl.countDocuments();
        console.log('Documents in "tenants" collection:', count);
        
        const sample = await tenantColl.findOne();
        console.log('Sample Doc:', JSON.stringify(sample, null, 2));
        
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

checkCollections();
