import jwt from 'jsonwebtoken';
import httpStatus from 'http-status-codes';
import { config } from '../config/index.js';
import userService from '../modules/user/user.service.js';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Please authenticate' });
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, config.jwt.secret);

        const user = await userService.getUserById(payload.userId);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Invalid token' });
    }
};

export default auth;
