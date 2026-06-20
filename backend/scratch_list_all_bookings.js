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

    const stylistIds = ["6a3100643cea8dd0c579710c", "6a3288126889558554491fe6"];
    console.log("\n=== BOOKINGS FOR CHIRAG & ASLAM ===");
    for (const id of stylistIds) {
        const bookingsForStylist = await Booking.find({
            staffId: { $in: [id, new mongoose.Types.ObjectId(id)] }
        });
        console.log(`Stylist ID: ${id} has ${bookingsForStylist.length} bookings:`);
        bookingsForStylist.forEach(b => {
            console.log(`- Booking ID: ${b._id}, Date: ${b.appointmentDate}, Time: ${b.time}, Status: ${b.status}`);
        });
    }

    await mongoose.disconnect();
}

run().catch(console.error);
