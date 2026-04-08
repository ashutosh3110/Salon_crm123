import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status-codes';
import { config } from '../config/index.js';
import userService from '../modules/user/user.service.js';
import clientService from '../modules/client/client.service.js';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth failed: No or invalid header');
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Please authenticate' });
        }

        const token = authHeader.split(' ')[1];
        let payload;
        try {
            payload = jwt.verify(token, config.jwt.secret);
        } catch (err) {
            console.log('Auth failed: JWT verify error:', err.message);
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Invalid token' });
        }

        // 1. Try finding in Users (Staff/SuperAdmin)
        let identity = await userService.getUserById(payload.userId);

        // 2. If not found, try finding in Tenants (Salon Owners)
        if (!identity) {
            const Tenant = mongoose.model('Tenant');
            const tenant = await Tenant.findById(payload.userId);
            if (tenant) {
                identity = tenant.toObject();
                identity.role = 'admin';
                identity.tenantId = tenant._id;
            }
        }

        // 2. If not found, try finding in Clients (Customers)
        if (!identity && payload.tenantId) {
            try {
                identity = await clientService.getClientById(payload.tenantId, payload.userId);
                if (identity) {
                    identity.role = 'customer'; // Assign a virtual role for customers
                }
            } catch (error) {
                // Client not found in this tenant, identity remains null
            }
        }

        if (!identity) {
            console.log(`[Auth] Identity NOT FOUND for userId: ${payload.userId}, tenantId: ${payload.tenantId}`);
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found' });
        }

        // Ensure critical fields are present for downstream middleware (role, tenant)
        if (!identity.role && payload.role) {
            console.log(`[Auth_DEBUG] Setting role from payload: ${payload.role}`);
            identity.role = payload.role;
        }
        if (!identity.tenantId && payload.tenantId) {
            console.log(`[Auth_DEBUG] Setting tenantId from payload: ${payload.tenantId}`);
            identity.tenantId = payload.tenantId;
        }

        console.log(`[Auth_DEBUG] Final Identity: ID=${identity._id || identity.id}, Role=${identity.role}, TenantID=${identity.tenantId}`);
        req.user = identity;
        next();
    } catch (error) {
        console.log('Auth failed: Unexpected error:', error.message);
        return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Invalid token' });
    }
};

export default auth;
