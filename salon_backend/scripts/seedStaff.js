const mongoose = require('mongoose');
require('dotenv').config();
const Staff = require('../Models/Staff');

const MONGODB_URI = process.env.MONGODB_URI;

async function seedStaff() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Dynamically get Salon and Outlet
        const Salon = mongoose.model('Salon', new mongoose.Schema({}));
        const Outlet = mongoose.model('Outlet', new mongoose.Schema({ salonId: mongoose.Schema.Types.ObjectId }));
        
        const salon = await Salon.findOne();
        if (!salon) {
            console.error('No salon found. Please create a salon first.');
            process.exit(1);
        }

        const outlet = await Outlet.findOne({ salonId: salon._id });
        if (!outlet) {
            console.error('No outlet found for the salon. Please create an outlet first.');
            process.exit(1);
        }

        const staffData = [
            { name: 'John Doe', email: 'john@example.com', phone: '9876543210', role: 'stylist', specialization: ['Haircut', 'Coloring'] },
            { name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', role: 'stylist', specialization: ['Facial', 'Makeup'] },
            { name: 'Robert Brown', email: 'robert@example.com', phone: '9876543212', role: 'manager', specialization: [] },
            { name: 'Emily Davis', email: 'emily@example.com', phone: '9876543213', role: 'receptionist', specialization: [] },
            { name: 'Michael Wilson', email: 'michael@example.com', phone: '9876543214', role: 'stylist', specialization: ['Hair Spa', 'Massage'] },
            { name: 'Sarah Miller', email: 'sarah@example.com', phone: '9876543215', role: 'stylist', specialization: ['Nail Art', 'Manicure'] },
            { name: 'David Taylor', email: 'david@example.com', phone: '9876543216', role: 'stylist', specialization: ['Beard Trim', 'Shaving'] },
            { name: 'Jessica Moore', email: 'jessica@example.com', phone: '9876543217', role: 'stylist', specialization: ['threading', 'Waxing'] },
            { name: 'William Anderson', email: 'william@example.com', phone: '9876543218', role: 'accountant', specialization: [] },
            { name: 'Linda Thomas', email: 'linda@example.com', phone: '9876543219', role: 'inventory_manager', specialization: [] }
        ];

        const staffToCreate = staffData.map(s => ({
            ...s,
            salonId: salon._id,
            outletId: outlet._id,
            password: 'password123',
            gender: Math.random() > 0.5 ? 'male' : 'female',
            status: 'active',
            specializations: s.specialization || [],
            bio: `Experienced ${s.role} with a focus on customer satisfaction.`,
            experience: `${Math.floor(Math.random() * 10) + 1} years`,
            isActive: true
        }));

        // Clear existing staff for this test (Optional)
        // await Staff.deleteMany({ salonId: salon._id });

        for (const staff of staffToCreate) {
            try {
                await Staff.create(staff);
                console.log(`Created staff: ${staff.name}`);
            } catch (err) {
                if (err.code === 11000) {
                    console.log(`Staff ${staff.name} already exists (skipping duplicate)`);
                } else {
                    console.error(`Error creating staff ${staff.name}:`, err.message);
                }
            }
        }

        console.log('Seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedStaff();
