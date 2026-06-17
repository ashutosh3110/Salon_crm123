const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ticket = require('./Models/Ticket');
const Customer = require('./Models/Customer');

dotenv.config();

const fixTickets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const tickets = await Ticket.find({ tenantId: { $exists: false } });
        console.log(`Found ${tickets.length} tickets missing tenantId`);

        for (let ticket of tickets) {
            if (ticket.customerId) {
                const customer = await Customer.findById(ticket.customerId);
                if (customer && customer.salonId) {
                    ticket.tenantId = customer.salonId;
                    await ticket.save();
                    console.log(`Updated ticket ${ticket._id} with tenantId ${customer.salonId}`);
                } else {
                    console.log(`Customer not found or missing salonId for ticket ${ticket._id}`);
                }
            } else {
                console.log(`No customerId for ticket ${ticket._id}`);
            }
        }

        console.log('Done fixing tickets');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixTickets();
