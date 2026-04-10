const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const OTHER_SALON_ID = '69d8a705831ad5a5c6c3c47f';

const IMG_PATHS = [
    'C:/Users/Administrator/.gemini/antigravity/brain/75ca2da1-7f4f-4121-b37b-96860b28ccbd/salon_interior_1_1775823405275.png',
    'C:/Users/Administrator/.gemini/antigravity/brain/75ca2da1-7f4f-4121-b37b-96860b28ccbd/salon_interior_2_1775823426213.png',
    'C:/Users/Administrator/.gemini/antigravity/brain/75ca2da1-7f4f-4121-b37b-96860b28ccbd/salon_interior_3_1775823444196.png',
    'C:/Users/Administrator/.gemini/antigravity/brain/75ca2da1-7f4f-4121-b37b-96860b28ccbd/salon_interior_4_1775823463223.png',
    'C:/Users/Administrator/.gemini/antigravity/brain/75ca2da1-7f4f-4121-b37b-96860b28ccbd/salon_interior_5_1775823481046.png'
];

const toBase64 = (filePath) => {
    try {
        const file = fs.readFileSync(filePath);
        const extensionName = path.extname(filePath);
        const base64String = Buffer.from(file).toString('base64');
        return `data:image/${extensionName.split('.').pop()};base64,${base64String}`;
    } catch (e) {
        return '';
    }
};

const seedOutlets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Outlet = require('./Models/Outlet');

        const branches = [
            {
                name: "LUXE BRANCH - BANDRA",
                phone: "+91 9876543210",
                address: { street: "12th Road, Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050" },
                location: { type: "Point", coordinates: [72.8258, 19.0596] },
                images: [toBase64(IMG_PATHS[0])],
                chairs: [{ id: 1, name: "Station 1" }]
            },
            {
                name: "GLASS BRANCH - KOREGAON",
                phone: "+91 9876543211",
                address: { street: "Main Road, Koregaon Park", city: "Pune", state: "Maharashtra", pincode: "411001" },
                location: { type: "Point", coordinates: [73.8890, 18.5362] },
                images: [toBase64(IMG_PATHS[1])],
                chairs: [{ id: 1, name: "Station 1" }]
            },
            {
                name: "URBAN BRANCH - INDIRANAGAR",
                phone: "+91 9876543212",
                address: { street: "100 Ft Road, Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038" },
                location: { type: "Point", coordinates: [77.6412, 12.9716] },
                images: [toBase64(IMG_PATHS[2])],
                chairs: [{ id: 1, name: "Station 1" }]
            },
            {
                name: "FUTURE BRANCH - JUBILEE HILLS",
                phone: "+91 9876543213",
                address: { street: "Road No. 36, Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: "500033" },
                location: { type: "Point", coordinates: [78.4011, 17.4326] },
                images: [toBase64(IMG_PATHS[3])],
                chairs: [{ id: 1, name: "Station 1" }]
            },
            {
                name: "ROYAL BRANCH - CONN PLACE",
                phone: "+91 9876543214",
                address: { street: "Inner Circle, Connaught Place", city: "New Delhi", state: "Delhi", pincode: "110001" },
                location: { type: "Point", coordinates: [77.2167, 28.6315] },
                images: [toBase64(IMG_PATHS[4])],
                chairs: [{ id: 1, name: "Station 1" }]
            }
        ];

        for (const branch of branches) {
            branch.salonId = OTHER_SALON_ID;
            await Outlet.create(branch);
            console.log(`Created: ${branch.name}`);
        }

        console.log('Seeding complete for other Salon ID!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedOutlets();
