import mongoose from 'mongoose';
import { config } from './src/config/index.js';

async function check() {
    await mongoose.connect(config.mongoose.url);
    console.log('Connected to DB');
    
    const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String, tenantId: mongoose.Schema.Types.ObjectId }));
    const users = await User.find({ email: 'mrmmultani@gmail.com' });
    console.log('Users found with email mrmmultani@gmail.com:', JSON.stringify(users, null, 2));

    const Tenant = mongoose.model('Tenant', new mongoose.Schema({ email: String, role: String }));
    const tenants = await Tenant.find({ email: 'mrmmultani@gmail.com' });
    console.log('Tenants found with email mrmmultani@gmail.com:', JSON.stringify(tenants, null, 2));

    process.exit();
}

check();
