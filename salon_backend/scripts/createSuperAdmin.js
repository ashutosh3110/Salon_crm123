const mongoose = require('mongoose');
const User = require('../Models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'superadmin@salon.com';
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log('SuperAdmin already exists with email:', email);
            process.exit(0);
        }

        const superAdmin = new User({
            name: 'System SuperAdmin',
            email: email,
            password: 'superadmin123',
            role: 'superadmin'
        });

        await superAdmin.save();
        console.log('SuperAdmin created successfully!');
        console.log('Email:', email);
        console.log('Password: superadmin123');

        process.exit(0);
    } catch (err) {
        console.error('Error creating SuperAdmin:', err);
        process.exit(1);
    }
};

createSuperAdmin();
