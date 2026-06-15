require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Salon = require('../Models/Salon');

async function run() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(uri);
        const salons = await Salon.find({});
        console.log("Salons:");
        salons.forEach(s => {
            console.log(`ID: ${s._id}, Name: ${s.name}, WhatsApp Settings:`, JSON.stringify(s.whatsappSettings));
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
