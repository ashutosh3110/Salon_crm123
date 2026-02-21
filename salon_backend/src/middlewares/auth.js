import jwt from 'jsonwebtoken';
import httpStatus from 'http-status-codes';
import { config } from '../config/index.js';
import userService from '../modules/user/user.service.js';
import clientService from '../modules/client/client.service.js';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Please authenticate' });
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, config.jwt.secret);

        // 1. Try finding in Users (Staff/Admin)
        let identity = await userService.getUserById(payload.userId);

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
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found' });
        }

        req.user = identity;
        next();
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Invalid token' });
    }
};

export default auth;
