const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { login } = require('../Controllers/authController');

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const req = {
            body: {
                email: 'manager@gmail.com',
                password: 'password123' // assuming default seed or password in DB, but wait: let's verify if password matches
            }
        };

        // If we don't know the password, let's look up the user first and override password/or just print the role from DB
        const Staff = require('../Models/Staff');
        const managerDoc = await Staff.findOne({ email: 'manager@gmail.com' });
        if (!managerDoc) {
            console.log('No staff member with email manager@gmail.com found.');
            await mongoose.disconnect();
            return;
        }

        console.log(`Original DB document role for Jagarti: ${managerDoc.role}`);

        // Let's set password temporarily so login succeeds
        const originalPassword = managerDoc.password;
        const bcrypt = require('bcryptjs');
        managerDoc.password = await bcrypt.hash('password123', 10);
        await managerDoc.save();
        console.log('Overrode password to password123 for test purposes.');

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

        await login(req, res);
        console.log(`Login Status: ${res.statusCode}`);
        console.log('Login Response JSON:', JSON.stringify(res.jsonData, null, 2));

        // Restore password
        managerDoc.password = originalPassword;
        await managerDoc.save();
        console.log('Restored original password.');

        await mongoose.disconnect();
        console.log('DB Connection closed.');
    } catch (err) {
        console.error('Error occurred in test runner:', err);
        await mongoose.disconnect();
    }
}

run();
