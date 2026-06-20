const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';

async function run() {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB!");

    const Staff = mongoose.model('Staff', new mongoose.Schema({}, { strict: false }), 'staffs');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }), 'bookings');

    const staffs = await Staff.find({});
    console.log("\n=== ALL STAFF ===");
    staffs.forEach(s => {
        console.log(`Staff ID: ${s._id}, Name: ${s.name || s.username}, Role: ${s.role}`);
    });

    const users = await User.find({});
    console.log("\n=== ALL USERS ===");
    users.forEach(u => {
        console.log(`User ID: ${u._id}, Username: ${u.username || u.name}, Role: ${u.role}, StaffId: ${u.staffId || u.staff?._id || u.staff}`);
    });

    const bookings = await Booking.find({});
    console.log(`\n=== ALL BOOKINGS (Count: ${bookings.length}) ===`);
    bookings.slice(-15).forEach(b => {
        console.log(`Booking ID: ${b._id}, Date: ${b.appointmentDate}, Time: ${b.time}, Status: ${b.status}, StaffId: ${JSON.stringify(b.staffId)}`);
    });

    const targetStaffIds = ["69fdd51189711943d0eca5df", "6a187949e4b295c7c59352f1"];
    console.log("\n=== LOOKUP TARGET STAFF ===");
    for (const id of targetStaffIds) {
        try {
            const s = await Staff.findById(id);
            if (s) {
                console.log(`Staff ID: ${s._id}, Name: ${s.name}, Role: ${s.role}`);
            } else {
                console.log(`Staff ID: ${id} NOT found in staffs collection.`);
            }
        } catch (e) {
            console.error(e);
        }
    }

    await mongoose.disconnect();
}

run().catch(console.error);
