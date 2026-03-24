import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import userService from '../modules/user/user.service.js';

const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        let payload;
        try {
            payload = jwt.verify(token, config.jwt.secret);
        } catch (err) {
            return next();
        }

        const identity = await userService.getUserById(payload.userId);
        if (identity) {
            req.user = identity;
        }
        next();
    } catch (error) {
        next();
    }
};

export default optionalAuth;
