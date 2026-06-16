const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Staff = require('../Models/Staff');
const { updateDetails } = require('../Controllers/authController');

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Find a stylist/stylish user
        const staffList = await Staff.find({
            role: { $in: ['stylish', 'stylist', 'Stylish', 'Stylist'] }
        });

        if (staffList.length === 0) {
            console.log('No staff member with role stylist/stylish found in DB.');
            mongoose.connection.close();
            return;
        }

        const staff = staffList[0];
        console.log(`Testing with stylist: ${staff.name} (ID: ${staff._id}, Role: ${staff.role})`);

        const originalBio = staff.bio;
        const originalExperience = staff.experience;

        // Test: updateDetails
        console.log('\n--- Test: updateDetails ---');
        const req = {
            user: {
                _id: staff._id,
                salonId: staff.salonId,
                role: staff.role
            },
            body: {
                bio: 'Updated bio by sandbox test',
                experience: '12 years of luxury styling'
            }
        };

        const res = {
            statusCode: 200,
            jsonData: null,
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.jsonData = data;
                return this;
            }
        };

        await updateDetails(req, res);
        console.log(`updateDetails Status: ${res.statusCode}`);
        console.log('updateDetails Response JSON:', JSON.stringify(res.jsonData, null, 2));

        // Verify in DB
        const updatedStaff = await Staff.findById(staff._id);
        console.log('\nVerified database fields:');
        console.log('Bio:', updatedStaff.bio);
        console.log('Experience:', updatedStaff.experience);

        // Cleanup: restore original details
        console.log('\nCleaning up and restoring original values...');
        await Staff.findByIdAndUpdate(staff._id, {
            bio: originalBio,
            experience: originalExperience
        });
        console.log('Cleanup completed.');

        mongoose.connection.close();
        console.log('DB Connection closed.');
    } catch (err) {
        console.error('Error occurred in test runner:', err);
        mongoose.connection.close();
    }
}

run();
