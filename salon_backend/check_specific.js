import mongoose from 'mongoose';
import { config } from './src/config/index.js';
import Tenant from './src/modules/tenant/tenant.model.js';

const checkSpecificId = async (id) => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log(`Checking for ID: ${id}`);
        const t = await Tenant.findById(id);
        if (t) {
            console.log('FOUND:', JSON.stringify(t, null, 2));
        } else {
            console.log('NOT FOUND');
            const total = await Tenant.countDocuments();
            console.log(`Total Tenants in DB: ${total}`);
            const sample = await Tenant.findOne();
            console.log(`Sample Tenant ID: ${sample?._id}`);
        }
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

const idToTest = process.argv[2] || '69d667e43597fe29bda53272';
checkSpecificId(idToTest);
