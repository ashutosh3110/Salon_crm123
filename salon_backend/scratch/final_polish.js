const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function finalPolish() {
    try {
        const baseUri = process.env.MONGODB_URI.split('?')[0];
        const uris = [
            process.env.MONGODB_URI,
            baseUri.replace('Saloon_Staging', 'Saloon') + '?' + process.env.MONGODB_URI.split('?')[1]
        ];
        
        for (const uri of uris) {
            console.log('\n--- Final Polish for: ' + uri.split('/')[3].split('?')[0] + ' ---');
            await mongoose.disconnect();
            await mongoose.connect(uri);
            const db = mongoose.connection.db;
            
            const cols = ['staffs', 'users'];
            for (const colName of cols) {
                const collection = db.collection(colName);
                const docs = await collection.find({ availability: { '$exists': true } }).toArray();
                
                let count = 0;
                for (const doc of docs) {
                    let availability = doc.availability;
                    let needsUpdate = false;
                    
                    if (typeof availability === 'string') {
                        try {
                            availability = JSON.parse(availability);
                            needsUpdate = true;
                        } catch(e) {}
                    }
                    
                    if (availability && typeof availability === 'object' && !availability.breaks) {
                        availability.breaks = [{ start: '13:00', end: '14:00', label: 'Lunch' }];
                        needsUpdate = true;
                    }
                    
                    if (needsUpdate) {
                        await collection.updateOne({ _id: doc._id }, { $set: { availability: availability } });
                        count++;
                    }
                }
                console.log(`Updated ${count} documents in [${colName}]`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

finalPolish();
