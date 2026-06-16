const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Staff = require('../Models/Staff');
const { getMyCommissions } = require('../Controllers/hrController');

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

        // Mock request and response
        const req = {
            user: {
                _id: staff._id,
                salonId: staff.salonId,
                role: staff.role
            },
            query: {
                period: 'CURRENT_CYCLE'
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

        // Call the controller method
        await getMyCommissions(req, res);

        console.log(`Response Status: ${res.statusCode}`);
        console.log('Response JSON data:');
        console.log(JSON.stringify(res.jsonData, null, 2));

        mongoose.connection.close();
        console.log('DB Connection closed.');
    } catch (err) {
        console.error('Error occurred in test runner:', err);
        mongoose.connection.close();
    }
}

run();
