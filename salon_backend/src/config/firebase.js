import admin from 'firebase-admin';
import { config } from './index.js';

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
export function initFirebase() {
    if (firebaseApp) return firebaseApp;

    try {
        const serviceAccount = {
            type: 'service_account',
            project_id: config.firebase.projectId,
            private_key_id: config.firebase.privateKeyId || '',
            private_key: config.firebase.privateKey,
            client_email: config.firebase.clientEmail,
            client_id: config.firebase.clientId || '',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
        };

        // Validate minimum required fields
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            console.warn('[Firebase] Missing credentials — push notifications disabled. Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL in .env');
            return null;
        }

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('[Firebase] Admin SDK initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('[Firebase] Init error:', error.message);
        return null;
    }
}

/**
 * Get Firebase messaging instance
 */
export function getMessaging() {
    if (!firebaseApp) {
        initFirebase();
    }
    if (!firebaseApp) return null;
    return admin.messaging();
}

export default { initFirebase, getMessaging };
