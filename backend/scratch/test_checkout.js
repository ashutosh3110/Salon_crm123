const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Customer = require('../Models/Customer');
const Outlet = require('../Models/Outlet');
const Salon = require('../Models/Salon');
const Service = require('../Models/Service');
const Staff = require('../Models/Staff');
const posController = require('../Controllers/posController');

async function test() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        // Get actual records
        const customer = await Customer.findOne({});
        if (!customer) throw new Error('No customer found in DB');
        const outlet = await Outlet.findOne({});
        if (!outlet) throw new Error('No outlet found in DB');
        const salon = await Salon.findById(outlet.salonId);
        if (!salon) throw new Error('No salon found in DB');
        const service = await Service.findOne({});
        if (!service) throw new Error('No service found in DB');
        const staff = await Staff.findOne({});
        if (!staff) throw new Error('No staff found in DB');

        console.log('Found actual IDs:', {
            customerId: customer._id,
            outletId: outlet._id,
            salonId: salon._id,
            serviceId: service._id,
            staffId: staff._id
        });

        // Mock req and res
        const req = {
            user: { salonId: salon._id },
            body: {
                clientId: customer._id.toString(),
                outletId: outlet._id.toString(),
                createdAt: new Date().toISOString(),
                items: [
                    {
                        itemId: service._id.toString(),
                        type: 'service',
                        name: service.name,
                        price: service.price || 100,
                        quantity: 1,
                        gstPercent: 5,
                        stylistIds: [staff._id.toString()]
                    }
                ],
                tax: 5,
                gstPercent: 5,
                includingGst: false,
                baseAmount: service.price || 100,
                gstAmount: 5,
                cgst: 2.5,
                sgst: 2.5,
                serviceGstPercent: 5,
                productGstPercent: 10,
                subtotal: service.price || 100,
                payments: [{ method: 'cash', amount: (service.price || 100) + 5 }],
                discount: 0,
                membershipDiscount: 0,
                previousDueCollected: 0,
                discountType: 'fixed',
                useWalletAmount: 0
            }
        };

        const res = {
            status: function(code) {
                console.log('Res Status:', code);
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                console.log('Res Json:', JSON.stringify(data, null, 2));
                return this;
            }
        };

        console.log('Executing checkout...');
        await posController.checkout(req, res);

    } catch (err) {
        console.error('Test script error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Done.');
    }
}

test();
