const mongoose = require('mongoose');
const Inquiry = require('../Models/Inquiry');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedLeads = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const leads = [
            {
                name: "Rahul Sharma",
                email: "rahul@glamstudio.com",
                phone: "9876543210",
                salonName: "Glam Studio",
                message: "I am interested in the Professional plan for my chain of 3 salons. Please contact me.",
                status: "new"
            },
            {
                name: "Priya Varma",
                email: "priya@blushnbrush.com",
                phone: "9123456789",
                salonName: "Blush n Brush",
                message: "Looking for an appointment management system. Your platform seems perfect.",
                status: "contacted"
            },
            {
                name: "Amit Patel",
                email: "amit@groomhq.com",
                phone: "8888877777",
                salonName: "Groom HQ",
                message: "Do you offer GST compliant invoicing? Need this for my quarterly filing.",
                status: "new"
            }
        ];

        // Clear existing test inquiries
        await Inquiry.deleteMany({ email: { $in: leads.map(l => l.email) } });

        // Insert new ones
        await Inquiry.insertMany(leads);
        console.log('Inquiries seeded successfully');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding inquiries:', err);
        process.exit(1);
    }
};

seedLeads();
