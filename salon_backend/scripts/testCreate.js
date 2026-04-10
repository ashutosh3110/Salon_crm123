const mongoose = require('mongoose');
const Salon = require('../Models/Salon');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testCreate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'test_create_password@example.com';
        const password = '123456';

        // 1. Manually hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Create Salon
        const salon = await Salon.create({
            name: "Test Password Salon",
            ownerName: "Tester",
            email: email,
            password: hashedPassword,
            address: { street: "123 Test St", city: "Test City" }
        });

        console.log('Salon created with password:', salon.password);
        
        // 3. Create User
        const user = await User.create({
            name: "Tester",
            email: email,
            password: hashedPassword,
            role: 'admin',
            salonId: salon._id
        });

        console.log('User created with password (should be hashed):', user.password);

        process.exit(0);
    } catch (err) {
        console.error('Error in test:', err);
        process.exit(1);
    }
};

testCreate();
