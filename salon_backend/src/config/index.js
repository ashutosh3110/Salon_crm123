import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
    REDIS_URL: Joi.string().description('Redis connection string'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(15).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(7).description('days after which refresh tokens expire'),
    CORS_ORIGIN: Joi.any()  
      .default('*')
      .description('CORS allowed origin(s), comma-separated. With credentials, * echoes request origin. Example: http://localhost:5173,http://127.0.0.1:5173'),
    CLOUDINARY_CLOUD_NAME: Joi.string().description('Cloudinary cloud name'),
    CLOUDINARY_API_KEY: Joi.string().description('Cloudinary API key'),
    CLOUDINARY_API_SECRET: Joi.string().description('Cloudinary API secret'),
    FIREBASE_PROJECT_ID: Joi.string().allow('').default('').description('Firebase project ID'),
    FIREBASE_PRIVATE_KEY_ID: Joi.string().allow('').default('').description('Firebase private key ID'),
    FIREBASE_PRIVATE_KEY: Joi.string().allow('').default('').description('Firebase private key (with \\n for newlines)'),
    FIREBASE_CLIENT_EMAIL: Joi.string().allow('').default('').description('Firebase client email'),
    FIREBASE_CLIENT_ID: Joi.string().allow('').default('').description('Firebase client ID'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

/** Comma-separated list, e.g. http://localhost:5173,http://127.0.0.1:5173 */
function parseCorsOrigins(raw) {
  if (raw == null || raw === '') return ['http://localhost:5173'];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  const s = String(raw).trim();
  if (s === '*') return ['*'];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  redis: {
    url: envVars.REDIS_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  cors: {
    /** Explicit allowlist from env */
    origins: parseCorsOrigins(envVars.CORS_ORIGIN),
  },
  cloudinary: {
    cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY_API_SECRET,
  },
  firebase: {
    projectId: envVars.FIREBASE_PROJECT_ID,
    privateKeyId: envVars.FIREBASE_PRIVATE_KEY_ID,
    privateKey: envVars.FIREBASE_PRIVATE_KEY ? envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
    clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
    clientId: envVars.FIREBASE_CLIENT_ID,
  },
};
