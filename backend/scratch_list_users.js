const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';

async function run() {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB!");

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const users = await User.find({});
    console.log("\n=== ALL USERS ===");
    users.forEach(u => {
        console.log(JSON.stringify(u, null, 2));
    });

    await mongoose.disconnect();
}

run().catch(console.error);
