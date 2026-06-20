const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';

async function run() {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB!");

    const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }), 'customers');
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }), 'bookings');
    const Service = mongoose.model('Service', new mongoose.Schema({}, { strict: false }), 'services');

    const customerMatch = await Customer.find({ name: /allovera|aloe/i });
    console.log("Matching Customers:", customerMatch.length);
    customerMatch.forEach(c => console.log(c));

    const bookingMatch = await Booking.find({ $or: [
        { clientName: /allovera|aloe/i },
        { serviceName: /allovera|aloe/i },
        { service: /allovera|aloe/i },
        { name: /allovera|aloe/i }
    ]});
    console.log("Matching Bookings:", bookingMatch.length);
    bookingMatch.forEach(b => console.log(b));

    const serviceMatch = await Service.find({ name: /allovera|aloe/i });
    console.log("Matching Services:", serviceMatch.length);
    serviceMatch.forEach(s => console.log(s));

    await mongoose.disconnect();
}

run().catch(console.error);
