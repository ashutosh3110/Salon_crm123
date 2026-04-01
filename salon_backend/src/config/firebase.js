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
        let rawKey = config.firebase.privateKey || '';
        
        // Step 1: Pre-clean literal characters and common wrapper issues
        rawKey = rawKey
            .replace(/^"|"$/g, '')         // Remove outer quotes if present
            .replace(/\\n/g, '\n')         // Convert literal \n sequence to real newlines
            .trim();

        // Step 2: Extract base64 content
        const pureBase64 = rawKey
            .replace(/-----BEGIN PRIVATE KEY-----/g, '')
            .replace(/-----END PRIVATE KEY-----/g, '')
            .replace(/[^a-zA-Z0-9+/=]/g, '');

        // Step 3: Reconstruct perfect PEM format (64 chars per line)
        const lines = pureBase64.match(/.{1,64}/g) || [];
        const finalKey = 
            '-----BEGIN PRIVATE KEY-----\n' + 
            lines.join('\n') + 
            '\n-----END PRIVATE KEY-----\n';

        const serviceAccount = {
            project_id: config.firebase.projectId,
            private_key: finalKey,
            client_email: config.firebase.clientEmail,
        };

        // Validate minimum required fields
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            console.warn('[Firebase] Missing credentials — push notifications disabled.');
            return null;
        }

        console.log('[Firebase] Attempting initialization for project:', serviceAccount.project_id);

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('[Firebase] Admin SDK initialized successfully for project:', serviceAccount.project_id);
        return firebaseApp;
    } catch (error) {
        console.error('[Firebase] Init error (Check .env formatting):', error.message);
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
