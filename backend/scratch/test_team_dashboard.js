const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Staff = require('../Models/Staff');
const { getTeamDashboard } = require('../Controllers/dashboardController');

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Find any staff to get a valid salonId
        const staff = await Staff.findOne({});
        if (!staff) {
            console.log('No staff member found in DB to extract salonId.');
            await mongoose.disconnect();
            return;
        }

        console.log(`Testing with salonId: ${staff.salonId}`);

        const req = {
            user: {
                salonId: staff.salonId,
                role: 'manager'
            },
            query: {}
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

        await getTeamDashboard(req, res);
        console.log(`getTeamDashboard Status: ${res.statusCode}`);
        console.log('getTeamDashboard Response JSON:', JSON.stringify(res.jsonData, null, 2));

        await mongoose.disconnect();
        console.log('DB Connection closed.');
    } catch (err) {
        console.error('Error occurred in test runner:', err);
        await mongoose.disconnect();
    }
}

run();
