import mongoose from 'mongoose';
import { config } from './src/config/index.js';
import authorize from './src/middlewares/role.js';
import validateTenant from './src/middlewares/tenant.js';

async function simulate() {
    await mongoose.connect(config.mongoose.url);
    const Tenant = mongoose.model('Tenant');
    const tenant = await Tenant.findOne({ email: 'mrmmultani@gmail.com' });
    
    if (!tenant) {
        console.log('Tenant not found');
        process.exit();
    }

    const identity = tenant.toObject();
    identity.role = 'admin';
    identity.tenantId = tenant._id;

    const req = {
        user: identity,
        headers: {
            'x-tenant-id': tenant._id.toString()
        },
        originalUrl: '/v1/finance/petty-cash/summary'
    };

    const res = {
        status: (code) => ({
            send: (data) => console.log(`Response ${code}:`, data),
            json: (data) => console.log(`Response ${code}:`, data)
        })
    };

    console.log('--- Simulating validateTenant ---');
    validateTenant(req, res, () => {
        console.log('validateTenant PASSED');
        console.log('req.tenantId:', req.tenantId);

        console.log('--- Simulating authorize([\"admin\"]) ---');
        const authMiddleware = authorize(['admin', 'manager', 'accountant', 'receptionist', 'superadmin']);
        authMiddleware(req, res, () => {
            console.log('authorize PASSED');
        });
    });

    process.exit();
}

simulate();
