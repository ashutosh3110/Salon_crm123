const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Staff = require('../Models/Staff');
const LeaveRequest = require('../Models/LeaveRequest');
const { getMyLeaves, applyLeave } = require('../Controllers/hrController');

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

        // Test 1: Apply for Leave
        console.log('\n--- Test 1: applyLeave ---');
        const applyReq = {
            user: {
                _id: staff._id,
                salonId: staff.salonId,
                role: staff.role
            },
            body: {
                type: 'CASUAL_LEAVE',
                startDate: '2026-06-20',
                endDate: '2026-06-22',
                reason: 'Testing sandbox leave application'
            }
        };

        let appliedResult = null;
        const applyRes = {
            statusCode: 200,
            jsonData: null,
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.jsonData = data;
                appliedResult = data;
                return this;
            }
        };

        await applyLeave(applyReq, applyRes);
        console.log(`applyLeave Status: ${applyRes.statusCode}`);
        console.log('applyLeave Response JSON:', JSON.stringify(applyRes.jsonData, null, 2));

        // Test 2: Get My Leaves
        console.log('\n--- Test 2: getMyLeaves ---');
        const getReq = {
            user: {
                _id: staff._id,
                salonId: staff.salonId,
                role: staff.role
            }
        };

        const getRes = {
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

        await getMyLeaves(getReq, getRes);
        console.log(`getMyLeaves Status: ${getRes.statusCode}`);
        console.log('getMyLeaves Response JSON:', JSON.stringify(getRes.jsonData, null, 2));

        // Cleanup: remove the test leave request we created
        if (appliedResult && appliedResult.success && appliedResult.data && appliedResult.data._id) {
            console.log('\nCleaning up test leave request...');
            await LeaveRequest.findByIdAndDelete(appliedResult.data._id);
            console.log('Cleanup completed.');
        }

        mongoose.connection.close();
        console.log('DB Connection closed.');
    } catch (err) {
        console.error('Error occurred in test runner:', err);
        mongoose.connection.close();
    }
}

run();
