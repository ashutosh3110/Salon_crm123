import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './salon_backend/src/modules/user/user.model.js';
import Notification from './salon_backend/src/modules/notification/notification.model.js';

dotenv.config({ path: './salon_backend/.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to DB');

        const superAdmin = await User.findOne({ role: 'superadmin' });
        if (!superAdmin) {
            console.log('No Superadmin found');
        } else {
            console.log('Superadmin:', superAdmin.email);
            console.log('FCM Tokens:', superAdmin.fcmTokens);
        }

        const latestNotif = await Notification.findOne({ type: 'general' }).sort({ createdAt: -1 });
        if (latestNotif) {
            console.log('Latest Test Notification:', latestNotif.title, 'PushSent:', latestNotif.pushSent);
        } else {
            console.log('No test notification found in DB');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
