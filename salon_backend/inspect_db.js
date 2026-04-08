import mongoose from 'mongoose';
import { config } from './src/config/index.js';
import Tenant from './src/modules/tenant/tenant.model.js';
import User from './src/modules/user/user.model.js';

const inspectDB = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log('--- RECENT TENANTS ---');
        const tenants = await Tenant.find({}).sort({createdAt: -1}).limit(5);
        tenants.forEach(t => {
            console.log(`Tenant: ID=${t._id}, Name=${t.name}, Email=${t.email}, Status=${t.status}`);
        });

        console.log('\n--- RECENT USERS ---');
        const users = await User.find({}).sort({createdAt: -1}).limit(5);
        users.forEach(u => {
            console.log(`User: ID=${u._id}, Name=${u.name}, Email=${u.email}, Role=${u.role}, TenantID=${u.tenantId}`);
        });

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

inspectDB();
