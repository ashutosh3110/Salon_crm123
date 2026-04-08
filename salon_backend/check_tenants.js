import mongoose from 'mongoose';
import { config } from './src/config/index.js';
import Tenant from './src/modules/tenant/tenant.model.js';

const checkTenant = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log('Connected to DB');
        const count = await Tenant.countDocuments();
        console.log('Total Tenants:', count);
        const tenants = await Tenant.find({}).limit(20);
        console.log('DATA_IDS: ' + JSON.stringify(tenants.map(t => t._id.toString())));
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

checkTenant();
