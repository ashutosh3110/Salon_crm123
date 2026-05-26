const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Customer = require('../Models/Customer');
const Booking = require('../Models/Booking');
const Invoice = require('../Models/Invoice');
const clientController = require('../Controllers/clientController');

async function test() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        const salonId = new mongoose.Types.ObjectId('69fdc9e21a21bf41d0747f8e');

        // Create a mock dormant customer (created 120 days ago, no login, no booking, no invoice)
        const date120DaysAgo = new Date();
        date120DaysAgo.setDate(date120DaysAgo.getDate() - 120);

        console.log('Inserting mock dormant customer created 120 days ago...');
        const tempCustomer = await Customer.create({
            salonId,
            name: 'Dormant Test Client',
            phone: '9999999999',
            createdAt: date120DaysAgo,
            updatedAt: date120DaysAgo
        });

        // Set the timestamps explicitly with timestamps: false to prevent Mongoose overriding it
        await Customer.updateOne(
            { _id: tempCustomer._id },
            { $set: { createdAt: date120DaysAgo, updatedAt: date120DaysAgo } },
            { timestamps: false }
        );

        const checkDoc = await Customer.findById(tempCustomer._id);
        console.log('Created customer timestamps (fetched back):', {
            createdAt: checkDoc.createdAt,
            updatedAt: checkDoc.updatedAt,
            salonId: checkDoc.salonId
        });

        // Mock req and res
        const req = {
            user: { salonId }
        };

        let inactiveList = [];
        const res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                inactiveList = data.data || [];
                console.log('Response JSON success:', data.success);
                console.log('Inactive customers count:', data.count);
                return this;
            }
        };

        console.log('Executing getInactiveClients...');
        await clientController.getInactiveClients(req, res);

        const found = inactiveList.find(c => String(c._id) === String(tempCustomer._id));
        if (found) {
            console.log('SUCCESS! Found mock dormant customer:', {
                name: found.name,
                phone: found.phone,
                lastActivityDate: found.lastActivityDate,
                lastActivityType: found.lastActivityType,
                inactiveDays: found.inactiveDays,
                status: found.status
            });
        } else {
            console.log('FAILURE! Mock dormant customer not found in inactive list.');
        }

        // Clean up
        console.log('Cleaning up mock dormant customer...');
        await Customer.deleteOne({ _id: tempCustomer._id });
        console.log('Cleanup done.');

    } catch (err) {
        console.error('Test script error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from DB.');
    }
}

test();
