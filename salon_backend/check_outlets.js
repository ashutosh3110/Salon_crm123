import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    console.log('Connecting to:', process.env.MONGODB_URI);
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        const outlets = await db.collection('outlets').find({ status: 'active' }).toArray();
        console.log('FOUND OUTLETS:', outlets.length);
        console.log(JSON.stringify(outlets.map(o => ({ _id: o._id, name: o.name, city: o.city, lat: o.latitude, lng: o.longitude })), null, 2));
    } catch (e) {
        console.error('CONNECTION ERROR:', e.message);
    } finally {
        await client.close();
    }
}

check();
