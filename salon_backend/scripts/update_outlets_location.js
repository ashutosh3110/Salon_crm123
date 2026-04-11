const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Outlet = require('../Models/Outlet');

const MONGODB_URI = process.env.MONGODB_URI;

async function updateLocations() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const outlets = await Outlet.find({ isActive: true }).limit(5);
        if (outlets.length === 0) {
            console.log('No outlets found to update.');
            process.exit(0);
        }

        // User target: Lat: 22.7111, Lng: 75.9000
        // Mongoose Point: [longitude, latitude]
        
        const updates = [
            { name: "LUXE HEIGHTS - BANDRA", coords: [75.905, 22.715], address: "Near Vijay Nagar, Indore" }, // ~1.5km
            { name: "GLASS BOUTIQUE - KOREGAON", coords: [75.930, 22.730], address: "Palasia Area, Indore" }, // ~4km
            { name: "ELITE SALON & SPA", coords: [75.830, 22.711], address: "Rajwada, Indore" }, // ~7km
            { name: "URBAN STYLE STUDIO", coords: [75.980, 22.780], address: "Dewas Naka, Indore" } // ~12km
        ];

        for (let i = 0; i < outlets.length; i++) {
            if (!updates[i]) break;
            
            outlets[i].name = updates[i].name;
            outlets[i].location = {
                type: 'Point',
                coordinates: updates[i].coords
            };
            outlets[i].address = {
                street: updates[i].address,
                city: "Indore",
                state: "Madhya Pradesh",
                pincode: "452010"
            };
            await outlets[i].save();
            console.log(`Updated ${outlets[i].name} to ${updates[i].coords}`);
        }

        console.log('Successfully updated locations.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating locations:', err);
        process.exit(1);
    }
}

updateLocations();
