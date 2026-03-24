import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import httpStatus from 'http-status-codes';
import { config } from './config/index.js';
import morgan from 'morgan';
import logger from './utils/logger.js';
import routes from './routes.js';
import { globalLimiter } from './middlewares/rateLimiter.js';

import fs from 'fs';

import { initFirebase } from './config/firebase.js';

const app = express();

// Initialize Firebase Admin
initFirebase();


if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

if (config.env !== 'test') {
    app.use(morgan('dev'));
}

// CORS: `credentials: true` requires a concrete Access-Control-Allow-Origin (not *).
// Many dev setups use 127.0.0.1 vs localhost — both must be allowed or browser blocks login.
const LOCAL_DEV_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i;

function resolveCorsOrigin(requestOrigin) {
    const allowed = config.cors.origins || [];
    // Ensure the new Vercel origin is allowed even if env var is missing/stale on Render
    if (!allowed.includes('https://salon-crm123.vercel.app')) {
        allowed.push('https://salon-crm123.vercel.app');
    }
    
    if (!requestOrigin) return true;
    if (allowed.includes('*')) return requestOrigin;
    if (allowed.includes(requestOrigin)) return requestOrigin;
    
    if (config.env !== 'production' && LOCAL_DEV_ORIGIN_RE.test(requestOrigin)) {
        return requestOrigin;
    }
    return false;
}

// enable cors (must list custom headers — otherwise browser preflight fails → axios "Network Error")
app.use(cors({
    origin: (origin, callback) => {
        const resolved = resolveCorsOrigin(origin);
        if (resolved === false) {
            callback(null, false);
            return;
        }
        callback(null, resolved === true ? true : resolved);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-Tenant-Id',
        'x-tenant-id',
    ],
}));

// set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Apply global rate limiter
app.use('/v1', globalLimiter);

// api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    res.status(httpStatus.NOT_FOUND).send({
        code: httpStatus.NOT_FOUND,
        message: 'Not found',
    });
});

// handle error
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = err.message || httpStatus.getStatusText(statusCode);

    logger.error(err);

    res.status(statusCode).send({
        code: statusCode,
        message,
        ...(config.env === 'development' && { stack: err.stack }),
    });
});

export default app;
