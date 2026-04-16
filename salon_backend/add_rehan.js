const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Staff = require('./Models/Staff');

async function addRehanStylist() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a salon and outlet to link to
        const Salon = mongoose.model('Salon', new mongoose.Schema({ name: String }));
        const Outlet = mongoose.model('Outlet', new mongoose.Schema({ name: String, salonId: mongoose.Schema.Types.ObjectId }));

        const salon = await Salon.findOne();
        if (!salon) {
            console.error('No salon found in database. Create a salon first.');
            process.exit(1);
        }

        const outlet = await Outlet.findOne({ salonId: salon._id });
        if (!outlet) {
            console.error('No outlet found for the salon.');
            process.exit(1);
        }

        console.log(`Adding stylist to Salon: ${salon.name} (${salon._id}), Outlet: ${outlet.name} (${outlet._id})`);

        const rehanData = {
            salonId: salon._id,
            outletId: outlet._id,
            name: 'Rehan',
            email: 'rehan.stylist@example.com',
            phone: '9876543210',
            password: 'password123',
            role: 'stylist',
            gender: 'male',
            dob: '1995-05-15',
            experience: '5 Years',
            specializations: ['Haircut', 'Hair Styling', 'Beard Trim'],
            bio: 'Expert stylist specialized in modern haircuts and beard styling.',
            status: 'active',
            profileStatus: 'Approved',
            availability: {
                mode: 'same',
                days: {
                    monday: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
                    tuesday: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
                    wednesday: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
                    thursday: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
                    friday: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
                    saturday: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
                    sunday: [{ start: '11:00', end: '16:00' }]
                }
            }
        };

        // Check if Rehan already exists
        const existing = await Staff.findOne({ email: rehanData.email });
        if (existing) {
            console.log('Rehan already exists, updating details...');
            Object.assign(existing, rehanData);
            await existing.save();
        } else {
            const rehan = new Staff(rehanData);
            await rehan.save();
        }

        console.log('Successfully added/updated Stylist: Rehan');
        process.exit(0);
    } catch (error) {
        console.error('Error adding stylist:', error);
        process.exit(1);
    }
}

addRehanStylist();
