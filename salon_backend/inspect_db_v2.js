import mongoose from 'mongoose';
import { config } from './src/config/index.js';
import Tenant from './src/modules/tenant/tenant.model.js';
import User from './src/modules/user/user.model.js';

const inspectDB = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        const tenants = await Tenant.find({}).sort({createdAt: -1}).limit(5);
        const users = await User.find({}).sort({createdAt: -1}).limit(5);
        
        const data = {
            tenants: tenants.map(t => ({ id: t._id.toString(), name: t.name, email: t.email, status: t.status })),
            users: users.map(u => ({ id: u._id.toString(), email: u.email, role: u.role, tenantId: u.tenantId?.toString() }))
        };
        
        console.log('JSON_DATA_START');
        console.log(JSON.stringify(data, null, 2));
        console.log('JSON_DATA_END');

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

inspectDB();
