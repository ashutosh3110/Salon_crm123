const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function findCorruptedStrings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const cols = await db.listCollections().toArray();
        
        let totalFixed = 0;

        for (const colInfo of cols) {
            const colName = colInfo.name;
            const collection = db.collection(colName);
            const docs = await collection.find({}).toArray();
            
            for (const doc of docs) {
                let needsUpdate = false;
                const updateObj = {};

                // Check every field in the document
                for (const [key, value] of Object.entries(doc)) {
                    if (typeof value === 'string' && value.includes('{"days":') && value.includes('"monday"')) {
                        try {
                            const parsed = JSON.parse(value);
                            updateObj[key] = parsed;
                            needsUpdate = true;
                            console.log(`Found corrupted JSON string in collection [${colName}], field [${key}], doc [${doc._id}]`);
                        } catch (e) {
                            // Not valid JSON, skip
                        }
                    }
                }

                if (needsUpdate) {
                    await collection.updateOne({ _id: doc._id }, { $set: updateObj });
                    totalFixed++;
                }
            }
        }

        console.log(`\nGlobal Cleanup Complete. Fixed ${totalFixed} fields.`);
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

findCorruptedStrings();
