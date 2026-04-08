import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Outlet from './src/modules/outlet/outlet.model.js';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const outlets = await Outlet.find();
        console.log(JSON.stringify(outlets.map(o => ({ name: o.name, lat: o.latitude, lng: o.longitude })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
