const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrateAvailability() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = ['staffs', 'users'];

        for (const colName of collections) {
            const collection = db.collection(colName);
            const list = await collection.find({}).toArray();
            console.log(`Checking ${list.length} documents in ${colName}...`);

            let updatedCount = 0;

            for (const doc of list) {
                let needsUpdate = false;
                let updatedAvailability = doc.availability;

                // Check if availability is a string
                if (typeof doc.availability === 'string' && doc.availability.startsWith('{')) {
                    try {
                        updatedAvailability = JSON.parse(doc.availability);
                        needsUpdate = true;
                        console.log(`[${colName}] Will parse string availability for: ${doc.name || doc.email}`);
                    } catch (e) {
                        // Not a valid JSON or something else
                    }
                }

                // Ensure breaks array exists for staff-like roles
                // Even if it's already an object, it might be missing 'breaks'
                if (updatedAvailability && typeof updatedAvailability === 'object') {
                    if (!updatedAvailability.breaks) {
                        updatedAvailability.breaks = [{ start: '13:00', end: '14:00', label: 'Lunch' }];
                        needsUpdate = true;
                        console.log(`[${colName}] Will add default breaks for: ${doc.name || doc.email}`);
                    }
                }

                if (needsUpdate) {
                    await collection.updateOne(
                        { _id: doc._id },
                        { $set: { availability: updatedAvailability } }
                    );
                    updatedCount++;
                }
            }
            console.log(`[${colName}] Updated ${updatedCount} documents.`);
        }

        console.log(`Migration complete.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateAvailability();
