const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/Github/Salon_crm123/backend/.env' });

const mongoUri = process.env.MONGODB_URI;

async function run() {
    try {
        await mongoose.connect(mongoUri);
        
        const staffs = await mongoose.connection.db.collection('staffs').find({}).toArray();
        console.log('Staff members:');
        staffs.forEach(s => {
            console.log({
                _id: s._id,
                name: s.name,
                email: s.email,
                role: s.role,
                status: s.status,
                isActive: s.isActive
            });
        });

        // Let's also check if they have password hash
        staffs.forEach(s => {
            console.log(`${s.name} has password field:`, !!s.password);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
