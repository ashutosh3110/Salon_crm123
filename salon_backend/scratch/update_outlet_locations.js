const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const outletSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    }
}, { timestamps: true });

const Outlet = mongoose.model('Outlet', outletSchema);

async function updateLocations() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const outlets = await Outlet.find({});
        console.log(`Found ${outlets.length} outlets`);

        // Central coordinates: Indore, MP (User's location)
        const centralLng = 75.9001;
        const centralLat = 22.7111;

        for (let i = 0; i < outlets.length; i++) {
            const outlet = outlets[i];
            
            // Spread them out:
            // Outlets 0-1: Very close (< 3km)
            // Outlets 2-3: Close (3km - 5km)
            // Outlets 4-5: Medium (5km - 15km)
            // Outlets 6-7: Far (> 25km)
            
            let range;
            if (i < 2) range = 0.01;      // ~1km
            else if (i < 4) range = 0.04; // ~4km
            else if (i < 6) range = 0.12; // ~12km
            else range = 0.35;            // ~35km

            const randomLng = centralLng + (Math.random() - 0.5) * range;
            const randomLat = centralLat + (Math.random() - 0.5) * range;

            outlet.location = {
                type: 'Point',
                coordinates: [randomLng, randomLat]
            };
            
            // Update address to reflect Indore location
            outlet.address = {
                street: `Street ${i + 1}, Vijay Nagar`,
                city: 'Indore',
                state: 'Madhya Pradesh',
                pincode: '452010'
            };

            await outlet.save();
            console.log(`Updated outlet: ${outlet._id} to [${randomLng.toFixed(4)}, ${randomLat.toFixed(4)}]`);
        }

        console.log('All outlets updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error updating outlets:', err);
        process.exit(1);
    }
}

updateLocations();
