import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';

const generateToken = (userId, tenantId, role, expires, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        userId,
        tenantId,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: expires,
    };
    return jwt.sign(payload, secret);
};

const generateAuthTokens = async (user) => {
    const accessTokenExpires = Math.floor(Date.now() / 1000) + config.jwt.accessExpirationMinutes * 60;
    const accessToken = generateToken(user._id, user.tenantId, user.role, accessTokenExpires);

    const refreshTokenExpires = Math.floor(Date.now() / 1000) + config.jwt.refreshExpirationDays * 24 * 60 * 60;
    const refreshToken = generateToken(user._id, user.tenantId, user.role, refreshTokenExpires);

    return {
        access: {
            token: accessToken,
            expires: new Date(accessTokenExpires * 1000),
        },
        refresh: {
            token: refreshToken,
            expires: new Date(refreshTokenExpires * 1000),
        },
    };
};

export default {
    generateToken,
    generateAuthTokens,
};
