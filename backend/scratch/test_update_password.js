const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/Github/Salon_crm123/backend/.env' });
const Staff = require('../Models/Staff');

const mongoUri = process.env.MONGODB_URI;

async function run() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected!');

        const staffId = '6a3100643cea8dd0c579710c'; // Chirag Stylish
        const user = await Staff.findById(staffId).select('+password');
        
        console.log('Found user:', user ? user.name : 'null');
        if (user) {
            console.log('Current password hash:', user.password);
            
            // Let's test user.save()
            user.password = 'stylish123';
            console.log('Attempting user.save()...');
            await user.save();
            console.log('Save successful!');
        }

    } catch (err) {
        console.error('Error during update password simulation:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
