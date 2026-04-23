const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkOtherDb() {
    try {
        const baseUri = process.env.MONGODB_URI.split('?')[0];
        // Replace Saloon_Staging with Saloon
        const otherUri = baseUri.replace('Saloon_Staging', 'Saloon') + '?' + process.env.MONGODB_URI.split('?')[1];
        
        console.log('Connecting to: ' + otherUri);
        await mongoose.connect(otherUri);
        console.log('Connected to Saloon DB');

        const db = mongoose.connection.db;
        const collections = ['staffs', 'users'];

        for (const colName of collections) {
            const collection = db.collection(colName);
            const count = await collection.countDocuments({ availability: { '$type': 'string' } });
            console.log(`Collection [${colName}] has ${count} corrupted documents.`);
            
            if (count > 0) {
                const docs = await collection.find({ availability: { '$type': 'string' } }).toArray();
                console.log(`Starting migration for ${count} docs in ${colName}...`);
                
                for (const doc of docs) {
                    try {
                        const parsed = JSON.parse(doc.availability);
                        if (!parsed.breaks) {
                            parsed.breaks = [{ start: '13:00', end: '14:00', label: 'Lunch' }];
                        }
                        await collection.updateOne({ _id: doc._id }, { $set: { availability: parsed } });
                    } catch (e) {
                        console.error(`Failed to parse for ${doc.name}`);
                    }
                }
                console.log(`Finished updating ${colName}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

checkOtherDb();
