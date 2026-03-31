import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testNotify() {
    try {
        console.log('--- Superadmin Notification Diagnostics ---');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Database');

        // Import services dynamically after DB connection
        const notificationService = (await import('../src/modules/notification/notification.service.js')).default;
        const User = (await import('../src/modules/user/user.model.js')).default;

        const superAdmins = await User.find({ role: 'superadmin', status: 'active' });
        console.log(`🔍 Found ${superAdmins.length} active Superadmins`);

        if (superAdmins.length === 0) {
            console.error('❌ Error: No active Superadmin found in database.');
            process.exit(1);
        }

        const target = superAdmins[0];
        console.log(`🎯 Targeting Superadmin: ${target.email}`);
        console.log(`📱 FCM Tokens count: ${target.fcmTokens?.length || 0}`);

        if (!target.fcmTokens || target.fcmTokens.length === 0) {
            console.warn('⚠️ Warning: This user has NO registered FCM tokens. Refresh browser on dashboard.');
        }

        console.log('🚀 Sending Test Notification...');
        const result = await notificationService.sendNotification({
            recipientId: target._id,
            type: 'inquiry_new',
            title: 'Diagnostic Alert 🛠️',
            body: 'Aapka Superadmin notification system check kiya ja raha hai.',
            actionUrl: '/superadmin/inquiries'
        });

        if (result && result.pushSent) {
            console.log('✅ Success: Push sent to FCM servers.');
        } else if (result) {
            console.log('⚠️ Partial Success: Saved to DB, but push failed (Check tokens or FCM config).');
        } else {
            console.error('❌ Failed: notificationService returned null.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Critical Error:', err);
        process.exit(1);
    }
}

testNotify();
