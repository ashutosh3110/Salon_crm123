import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'salon_backend/.env' });

const MONGO_URI = "mongodb+srv://ashutoshbankey21306_db_user:TaVAjeQx97LusWIp@cluster0.3t6trpn.mongodb.net/salon_crm?appName=Cluster0";

async function check() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('\n--- Database Stats ---');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`${col.name}: ${count} documents`);
        }
        
        // Specifically check for users/services
        const users = await db.collection('users').find({ role: 'admin' }).toArray();
        console.log(`\nAdmin Users found: ${users.length}`);
        users.forEach(u => console.log(` - ${u.name} (${u.email}) | TenantID: ${u.tenantId}`));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
