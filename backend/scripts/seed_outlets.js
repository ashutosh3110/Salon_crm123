const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Salon = require('../Models/Salon');
const Outlet = require('../Models/Outlet');

const seedOutlets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const salon = await Salon.findOne();
        if (!salon) {
            console.error('No salon found in database. Please create a salon first.');
            process.exit(1);
        }

        console.log(`Using Salon: ${salon.name} (${salon._id})`);

        const outletsData = [
            {
                salonId: salon._id,
                name: 'Ritual Hair & Spa - Indiranagar',
                description: 'Our flagship luxury outlet in the heart of Indiranagar, specializing in premium hair styling and therapeutic spa treatments.',
                phone: '9876543210',
                email: 'indiranagar@ritualspa.com',
                address: {
                    street: '12th Main Road, HAL 2nd Stage',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    pincode: '560038'
                },
                location: {
                    type: 'Point',
                    coordinates: [77.6412, 12.9716] // Longitude, Latitude
                },
                isActive: true,
                chairs: [
                    { id: 1, name: 'Styling Chair 1' },
                    { id: 2, name: 'Styling Chair 2' },
                    { id: 3, name: 'Styling Chair 3' }
                ],
                beds: [
                    { id: 1, name: 'Massage Bed 1' }
                ],
                config: {
                    bookingSms: true,
                    whatsappNotifications: true
                }
            },
            {
                salonId: salon._id,
                name: 'Ritual Hair & Spa - Koramangala',
                description: 'Modern and vibrant, our Koramangala branch is perfect for the trendy youth looking for the latest styles.',
                phone: '9876543211',
                email: 'koramangala@ritualspa.com',
                address: {
                    street: '80 Feet Road, 4th Block',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    pincode: '560034'
                },
                location: {
                    type: 'Point',
                    coordinates: [77.6245, 12.9345]
                },
                isActive: true,
                chairs: [
                    { id: 1, name: 'Styling Chair 1' },
                    { id: 2, name: 'Styling Chair 2' }
                ],
                beds: [
                    { id: 1, name: 'Massage Bed 1' },
                    { id: 2, name: 'Facial Bed 1' }
                ],
                config: {
                    bookingSms: true,
                    whatsappNotifications: true
                }
            },
            {
                salonId: salon._id,
                name: 'Ritual Hair & Spa - Whitefield',
                description: 'Conveniently located for the tech professionals of Whitefield, offering quick grooming and relaxing weekend packages.',
                phone: '9876543212',
                email: 'whitefield@ritualspa.com',
                address: {
                    street: 'ITPL Main Road',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    pincode: '560066'
                },
                location: {
                    type: 'Point',
                    coordinates: [77.7500, 12.9698]
                },
                isActive: true,
                chairs: [
                    { id: 1, name: 'Styling Chair 1' },
                    { id: 2, name: 'Styling Chair 2' }
                ],
                beds: [
                    { id: 1, name: 'Massage Bed 1' }
                ],
                config: {
                    bookingSms: true,
                    whatsappNotifications: true
                }
            }
        ];

        // Clear existing outlets if they match names (optional)
        // await Outlet.deleteMany({ salonId: salon._id });

        const createdOutlets = await Outlet.insertMany(outletsData);
        console.log(`Successfully created ${createdOutlets.length} outlets!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding outlets:', error);
        process.exit(1);
    }
};

seedOutlets();
