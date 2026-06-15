require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Booking = require('../Models/Booking');
const Salon = require('../Models/Salon');

async function run() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(uri);
        const latestBooking = await Booking.findOne().sort({ createdAt: -1 });
        console.log("Latest Booking ID:", latestBooking._id);
        console.log("Salon ID:", latestBooking.salonId);
        
        const salon = await Salon.findById(latestBooking.salonId);
        console.log("Salon Name:", salon.name);
        console.log("WhatsApp Settings:", JSON.stringify(salon.whatsappSettings));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
