const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
    try {
        const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/Saloon'; 
        await mongoose.connect(dbUrl);
        console.log('Connected to database for RAW cleanup...');

        // Use raw collection to bypass model initialization errors
        const staffCollection = mongoose.connection.db.collection('staffs');
        
        const allStaff = await staffCollection.find({}).toArray();
        console.log(`Found ${allStaff.length} staff records. Checking for corruption...`);
        
        let fixedCount = 0;

        for (const staff of allStaff) {
            let updates = {};
            let needsUpdate = false;

            // Fix availability if it's a string
            if (typeof staff.availability === 'string') {
                try {
                    updates.availability = JSON.parse(staff.availability);
                    needsUpdate = true;
                    console.log(`Fixing availability for staff: ${staff.name}`);
                } catch (e) {
                    console.error(`Failed to parse availability for ${staff.name}:`, e.message);
                }
            }

            // Fix hrProfile if it's a string
            if (typeof staff.hrProfile === 'string') {
                try {
                    updates.hrProfile = JSON.parse(staff.hrProfile);
                    needsUpdate = true;
                    console.log(`Fixing hrProfile for staff: ${staff.name}`);
                } catch (e) {
                    console.error(`Failed to parse hrProfile for ${staff.name}:`, e.message);
                }
            }

            // Fix corrupt hrProfile objects (the {"0": "{", ...} issue)
            const hr = updates.hrProfile || staff.hrProfile;
            if (hr && hr['0'] === '{') {
                try {
                    const chars = [];
                    for (let i = 0; hr[i.toString()]; i++) {
                        chars.push(hr[i.toString()]);
                    }
                    const jsonStr = chars.join('');
                    updates.hrProfile = JSON.parse(jsonStr);
                    needsUpdate = true;
                    console.log(`Reconstructing corrupt hrProfile for staff: ${staff.name}`);
                } catch (e) {
                    console.error(`Failed to reconstruct hrProfile for ${staff.name}:`, e.message);
                    updates.hrProfile = { panNumber: hr.panNumber || '' };
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await staffCollection.updateOne(
                    { _id: staff._id },
                    { $set: updates }
                );
                fixedCount++;
            }
        }

        console.log(`RAW Cleanup complete! Fixed ${fixedCount} staff records.`);
        process.exit(0);
    } catch (err) {
        console.error('RAW Cleanup failed:', err);
        process.exit(1);
    }
};

fixDatabase();
