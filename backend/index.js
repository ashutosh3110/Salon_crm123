const dotenv = require('dotenv');
// Load env vars
dotenv.config();

const connectDB = require('./Config/db');
const app = require('./app');
const { init } = require('./Utils/socket');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (privateKey && clientEmail && projectId) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin initialized successfully ✅');
    } else {
        console.warn('⚠️  Firebase Credentials not found in .env. Push notifications will be skipped but saved to DB.');
    }
} catch (error) {
    console.error('❌ Firebase Initialization Error:', error.message);
}

// Connect to database
connectDB().then(() => {
    const { seedSuperAdmin } = require('./Utils/seed');
    seedSuperAdmin();
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Initialize Socket.io
init(server);

// Start Cron Jobs
const { startWalletExpiryCron } = require('./Utils/cron');
startWalletExpiryCron();

// Handle unhandled romi rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
