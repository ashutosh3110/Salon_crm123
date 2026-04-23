const mongoose = require('mongoose');
const Staff = require('../Models/Staff');
require('dotenv').config();

const fixDatabase = async () => {
    try {
        // Connect to DB (adjusting to your local connection or env)
        const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/Saloon'; 
        await mongoose.connect(dbUrl);
        console.log('Connected to database for cleanup...');

        const allStaff = await Staff.find({});
        let fixedCount = 0;

        for (const staff of allStaff) {
            let needsUpdate = false;

            // Fix availability if it's a string
            if (typeof staff.availability === 'string') {
                try {
                    staff.availability = JSON.parse(staff.availability);
                    needsUpdate = true;
                    console.log(`Fixed availability for staff: ${staff.name}`);
                } catch (e) {
                    console.error(`Failed to parse availability for ${staff.name}:`, e.message);
                }
            }

            // Fix hrProfile if it's a string or corrupt
            if (typeof staff.hrProfile === 'string') {
                try {
                    staff.hrProfile = JSON.parse(staff.hrProfile);
                    needsUpdate = true;
                    console.log(`Fixed hrProfile for staff: ${staff.name}`);
                } catch (e) {
                    console.error(`Failed to parse hrProfile for ${staff.name}:`, e.message);
                }
            }

            // Fix corrupt hrProfile objects (the {"0": "{", ...} issue)
            if (staff.hrProfile && staff.hrProfile['0'] === '{') {
                try {
                    // Reconstruct from characters
                    const chars = [];
                    for (let i = 0; staff.hrProfile[i.toString()]; i++) {
                        chars.push(staff.hrProfile[i.toString()]);
                    }
                    const jsonStr = chars.join('');
                    staff.hrProfile = JSON.parse(jsonStr);
                    needsUpdate = true;
                    console.log(`Reconstructed corrupt hrProfile for staff: ${staff.name}`);
                } catch (e) {
                    console.error(`Failed to reconstruct hrProfile for ${staff.name}:`, e.message);
                    // Fallback: Reset if it's completely unreadable
                    staff.hrProfile = { panNumber: staff.hrProfile.panNumber || '' };
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                // Use updateOne to bypass schema validation if needed, 
                // but since we fixed the data, save() should work.
                await Staff.updateOne({ _id: staff._id }, { 
                    $set: { 
                        availability: staff.availability,
                        hrProfile: staff.hrProfile
                    } 
                });
                fixedCount++;
            }
        }

        console.log(`Cleanup complete! Fixed ${fixedCount} staff records.`);
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
};

fixDatabase();
