const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Outlet = require('../Models/Outlet');

const MONGODB_URI = process.env.MONGODB_URI;
const salonId = '69e9f1c900e0db8ab43e1761';

const outletsData = [
    {
        name: 'Wapixo Signature - Hauz Khas',
        description: 'Our flagship luxury outlet in the heart of Hauz Khas Village.',
        phone: '9876543210',
        email: 'hauzkhas@wapixo.com',
        address: { street: 'HKV Main Road', city: 'New Delhi', state: 'Delhi', pincode: '110016' },
        images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Urban - Cyber Hub',
        description: 'Modern grooming for the corporate elite at Gurgaon Cyber Hub.',
        phone: '9876543211',
        email: 'cyberhub@wapixo.com',
        address: { street: 'DLF Cyber City', city: 'Gurgaon', state: 'Haryana', pincode: '122002' },
        images: ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Elite - South Ex',
        description: 'Premium hair and skin services at South Extension Part 2.',
        phone: '9876543212',
        email: 'southex@wapixo.com',
        address: { street: 'South Ex Market', city: 'New Delhi', state: 'Delhi', pincode: '110049' },
        images: ['https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Luxe - Khan Market',
        description: 'Exclusive boutique salon experience in Khan Market.',
        phone: '9876543213',
        email: 'khanmarket@wapixo.com',
        address: { street: 'Front Lane, Khan Market', city: 'New Delhi', state: 'Delhi', pincode: '110003' },
        images: ['https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Studio - Saket',
        description: 'Trendy salon and nail studio located at Select City Walk.',
        phone: '9876543214',
        email: 'saket@wapixo.com',
        address: { street: 'Press Enclave Road', city: 'New Delhi', state: 'Delhi', pincode: '110017' },
        images: ['https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Prime - Greater Kailash',
        description: 'Luxury grooming services for men and women in GK-1.',
        phone: '9876543215',
        email: 'gk@wapixo.com',
        address: { street: 'M Block Market', city: 'New Delhi', state: 'Delhi', pincode: '110048' },
        images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Boutique - Vasant Kunj',
        description: 'A serene salon experience near DLF Promenade.',
        phone: '9876543216',
        email: 'vasantkunj@wapixo.com',
        address: { street: 'Nelson Mandela Road', city: 'New Delhi', state: 'Delhi', pincode: '110070' },
        images: ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Grand - Noida Sec-18',
        description: 'The largest salon facility in Noida Sector 18.',
        phone: '9876543217',
        email: 'noida@wapixo.com',
        address: { street: 'Atta Market', city: 'Noida', state: 'UP', pincode: '201301' },
        images: ['https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Aura - Indirapuram',
        description: 'Premium family salon at Habitat Centre.',
        phone: '9876543218',
        email: 'indirapuram@wapixo.com',
        address: { street: 'Habitat Centre', city: 'Ghaziabad', state: 'UP', pincode: '201014' },
        images: ['https://images.unsplash.com/photo-1595475207225-428b4d4bd0a2?q=80&w=1000'],
        isActive: true
    },
    {
        name: 'Wapixo Essence - Gurgaon Sec-56',
        description: 'Quick and professional services for the suburban community.',
        phone: '9876543219',
        email: 'sec56@wapixo.com',
        address: { street: 'Spaze iTech Park', city: 'Gurgaon', state: 'Haryana', pincode: '122011' },
        images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000'],
        isActive: true
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Add salonId to all
        const dataWithSalon = outletsData.map(o => ({ ...o, salonId }));

        // Check if any exist with these names to avoid too many duplicates if run twice
        const names = dataWithSalon.map(o => o.name);
        await Outlet.deleteMany({ salonId, name: { $in: names } });
        
        await Outlet.insertMany(dataWithSalon);
        console.log('Successfully inserted 10 outlets');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
