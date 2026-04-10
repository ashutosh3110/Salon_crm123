const mongoose = require('mongoose');
const User = require('./Models/User');
const Salon = require('./Models/Salon');
const Outlet = require('./Models/Outlet');
const dotenv = require('dotenv');
dotenv.config();

const seedStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        // Find a salon and an outlet
        const salon = await Salon.findOne();
        if (!salon) {
            console.log('No Salon found. Please seed salons first.');
            process.exit();
        }

        const outlet = await Outlet.findOne({ salonId: salon._id });
        
        const staffMembers = [
            {
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                password: 'password123',
                role: 'manager',
                phone: '9876543210',
                salonId: salon._id,
                outletId: outlet?._id || null,
                dob: '1990-05-15',
                address: '123 Style Ave, Mumbai',
                stylistBio: 'Pro Salon Manager with 10 years experience.',
                status: 'active'
            },
            {
                name: 'Anjali Gupta',
                email: 'anjali@example.com',
                password: 'password123',
                role: 'stylist',
                phone: '9876543211',
                salonId: salon._id,
                outletId: outlet?._id || null,
                dob: '1995-08-20',
                address: '45 Fashion St, Delhi',
                stylistBio: 'Expert in Bridal Hair & Makeup.',
                stylistExperience: '7 Years',
                stylistSpecializations: ['Bridal', 'Hair Coloring'],
                status: 'active'
            },
            {
                name: 'Vikram Singh',
                email: 'vikram@example.com',
                password: 'password123',
                role: 'stylist',
                phone: '9876543212',
                salonId: salon._id,
                outletId: outlet?._id || null,
                dob: '1992-03-10',
                address: '78 Model Town, Jaipur',
                stylistBio: 'Specialist in Men\'s Grooming and Beard Styling.',
                stylistExperience: '5 Years',
                stylistSpecializations: ['Men\'s Haircut', 'Beard Trim'],
                status: 'active'
            },
            {
                name: 'Priya Verma',
                email: 'priya@example.com',
                password: 'password123',
                role: 'receptionist',
                phone: '9876543213',
                salonId: salon._id,
                outletId: outlet?._id || null,
                dob: '1998-11-25',
                address: '22 Care Lane, Bangalore',
                status: 'active'
            },
            {
                name: 'Suresh Kumar',
                email: 'suresh@example.com',
                password: 'password123',
                role: 'stylist',
                phone: '9876543214',
                salonId: salon._id,
                outletId: outlet?._id || null,
                dob: '1988-12-05',
                address: '90 Skill Road, Pune',
                stylistBio: 'Senior Colorist and Hair Spa Expert.',
                stylistExperience: '12 Years',
                stylistSpecializations: ['Hair Spa', 'Creative Color'],
                status: 'active'
            }
        ];

        // Clean existing test staff if any
        await User.deleteMany({ email: { $in: staffMembers.map(s => s.email) } });

        // Insert new staff
        await User.insertMany(staffMembers);
        console.log('5 Staff members added successfully!');

        process.exit();
    } catch (err) {
        console.error('Error seeding staff:', err);
        process.exit(1);
    }
};

seedStaff();
