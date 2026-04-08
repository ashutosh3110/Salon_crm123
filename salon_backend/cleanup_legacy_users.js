import mongoose from 'mongoose';
import { config } from './src/config/index.js';
import User from './src/modules/user/user.model.js';

const cleanupUsers = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log('Connected to DB');
        
        // Count before
        const beforeCount = await User.countDocuments();
        console.log(`Total Users before cleanup: ${beforeCount}`);
        
        // Delete all users with role 'admin' (since owners are now in Tenants collection)
        const result = await User.deleteMany({ role: 'admin' });
        console.log(`Deleted ${result.deletedCount} 'admin' users.`);
        
        // Count after
        const afterCount = await User.countDocuments();
        console.log(`Total Users after cleanup: ${afterCount}`);
        
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

cleanupUsers();
