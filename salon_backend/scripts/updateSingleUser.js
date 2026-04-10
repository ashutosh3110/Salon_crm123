const mongoose = require('mongoose');
const User = require('../Models/User');
const Salon = require('../Models/Salon');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'ashutoshbankey21306@gmail.com';
        const newPassword = '123456';

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found with email:', email);
            process.exit(0);
        }

        // Update password (pre-save hook in User model will hash it)
        user.password = newPassword;
        await user.save();

        console.log(`Password updated successfully for ${email}`);
        
        // Also update the Salon record if it exists
        const salon = await Salon.findOne({ email });
        if (salon) {
            salon.password = newPassword;
            await salon.save();
            console.log(`Updated password in Salon record for ${email}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error updating user password:', err);
        process.exit(1);
    }
};

updateUser();
