/**
 * One-time script to geocode all outlets missing lat/lng
 * Run: node geocode-outlets.js
 */
import mongoose from 'mongoose';
import { config } from './src/config/index.js';
import Outlet from './src/modules/outlet/outlet.model.js';
import { geocodeAddress } from './src/utils/geocode.js';

async function main() {
    await mongoose.connect(config.mongoose.url);
    const outlets = await Outlet.find({ $or: [{ latitude: null }, { longitude: null }, { latitude: { $exists: false } }] });
    console.log(`Found ${outlets.length} outlets without coordinates`);
    for (const o of outlets) {
        const geo = await geocodeAddress(o.address, o.city, o.state, o.pincode);
        if (geo) {
            await Outlet.updateOne({ _id: o._id }, { latitude: geo.latitude, longitude: geo.longitude });
            console.log(`✓ ${o.name} (${o.city}): ${geo.latitude}, ${geo.longitude}`);
        } else {
            console.log(`✗ ${o.name} (${o.city}): geocoding failed`);
        }
        await new Promise(r => setTimeout(r, 1200));
    }
    await mongoose.disconnect();
    console.log('Done');
}

main().catch(console.error);
