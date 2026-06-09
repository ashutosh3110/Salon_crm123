const mongoose = require('mongoose');
const mongoURI = 'mongodb://mohammadrehan00121_db_user:4QlKqb1h5rM05lSZ@ac-al5duhf-shard-00-00.rnxrxmk.mongodb.net:27017,ac-al5duhf-shard-00-01.rnxrxmk.mongodb.net:27017,ac-al5duhf-shard-00-02.rnxrxmk.mongodb.net:27017/Saloon_Test?ssl=true&replicaSet=atlas-xosmfq-shard-0&authSource=admin&appName=Cluster0';

async function run() {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB!");
    
    const Staff = mongoose.model('Staff', new mongoose.Schema({}, { strict: false }));
    const Break = mongoose.model('Break', new mongoose.Schema({}, { strict: false }));
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    const Outlet = mongoose.model('Outlet', new mongoose.Schema({}, { strict: false }));

    const staff = await Staff.findOne({ name: /Aditya/i });
    console.log("Staff ID:", staff._id, "Name:", staff.name);
    console.log("Staff availability breaks:", JSON.stringify(staff.availability?.breaks || []));
    
    const outlet = await Outlet.findById(staff.outletId);
    console.log("Outlet:", outlet.name, "Opening:", outlet.openingTime, "Closing:", outlet.closingTime);

    const date = '2026-06-12';
    const breakDoc = await Break.findOne({ staffId: staff._id, date });
    console.log("Breaks for date:", JSON.stringify(breakDoc));

    const bookings = await Booking.find({ staffId: staff._id, appointmentDate: { $gte: new Date(date + 'T00:00:00.000Z'), $lte: new Date(date + 'T23:59:59.999Z') } });
    console.log("Bookings count:", bookings.length);
    bookings.forEach(b => {
        console.log(`Booking ID: ${b._id}, Time: ${b.time}, Date: ${b.appointmentDate}, Duration: ${b.duration}`);
    });

    await mongoose.disconnect();
}

run().catch(console.error);
