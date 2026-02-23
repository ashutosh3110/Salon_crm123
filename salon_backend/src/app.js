import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import httpStatus from 'http-status-codes';
import { config } from './config/index.js';
import morgan from 'morgan';
import logger from './utils/logger.js';
import routes from './routes.js';
import { globalLimiter } from './middlewares/rateLimiter.js';

const app = express();

if (config.env !== 'test') {
    app.use(morgan('dev'));
}

// enable cors
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

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
