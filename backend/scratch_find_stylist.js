const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';

async function run() {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB!");

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const Staff = mongoose.model('Staff', new mongoose.Schema({}, { strict: false }), 'staffs');
    
    const users = await User.find({ role: { $ne: 'superadmin' } });
    console.log("\n=== NON-SUPERADMIN USERS ===");
    for (const u of users) {
        console.log(`User: ${u.username}, Role: ${u.role}, StaffId: ${u.staffId || u.staff}`);
        if (u.staffId || u.staff) {
            const s = await Staff.findById(u.staffId || u.staff);
            if (s) {
                console.log(`  Linked Staff: ${s.name}, Role: ${s.role}, OutletId: ${s.outletId}`);
            } else {
                console.log(`  Linked Staff: NOT FOUND in DB`);
            }
        }
    }

    await mongoose.disconnect();
}

run().catch(console.error);
