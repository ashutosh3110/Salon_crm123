import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/user/user.model.js';

dotenv.config();

const listManagers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const managers = await User.find({ role: 'manager' }, 'name email role');
        console.log('Managers:');
        console.log(JSON.stringify(managers, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listManagers();
