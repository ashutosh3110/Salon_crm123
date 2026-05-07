const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function findProblematicDoc() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const cols = await db.listCollections().toArray();
        
        const targetId = '69ea061fade093f91f5a5e19';

        for (const col of cols) {
            const collection = db.collection(col.name);
            const docs = await collection.find({}).toArray();
            
            for (const doc of docs) {
                const docString = JSON.stringify(doc);
                if (docString.includes(targetId)) {
                    console.log(`\n!!! FOUND IN COLLECTION: ${col.name}`);
                    console.log(`Document ID: ${doc._id}`);
                    console.log(`Document Name: ${doc.name || doc.email || 'N/A'}`);
                    console.log(`Availability Type: ${typeof doc.availability}`);
                    console.log(`Availability Value: ${doc.availability}`);
                }
            }
        }

        console.log('\nSearch complete.');
        process.exit(0);
    } catch (err) {
        console.error('Search failed:', err);
        process.exit(1);
    }
}

findProblematicDoc();
