import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const clientSchema = new mongoose.Schema({
    name: String,
    phone: String,
    tenantId: mongoose.Schema.Types.ObjectId
});

const Client = mongoose.model('Client', clientSchema);

async function check() {
    await mongoose.connect(MONGODB_URI);
    const tenantId = '671b5aee97a5bfb9c76d0e21';
    const clients = await Client.find({ tenantId }).limit(5);
    console.log('Total clients found for tenant:', clients.length);
    clients.forEach(c => console.log(`Client: ${c.name}, ID: ${c._id}, Phone: ${c.phone}`));
    process.exit(0);
}

check();
