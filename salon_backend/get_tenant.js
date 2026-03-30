import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = 'mongodb://localhost:27017/salon';

async function run() {
    await mongoose.connect(MONGO_URI);
    const tenant = await mongoose.connection.db.collection('tenants').findOne({ email: 'ashutoshbankey21306@gmail.com' });
    console.log(JSON.stringify(tenant));
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
