
const axios = require('axios');

const API_BASE = 'http://localhost:5000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZTFkMGQxZTcxOGNjODAwODU3MGE2NiIsInJvbGUiOiJhZG1pbiIsInNhbG9uSWQiOiI2OWUxZDBkMWU3MThjYzgwMDg1NzBhNjQiLCJpYXQiOjE3NzY0MjI3MjYsImV4cCI6MTc3NjUwOTEyNn0.my7cAOyvFYpnG1dx4H0C-q8-Nlemm8dwfa5BAXfmVFw';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function main() {
    try {
        console.log('Creating Outlets...');
        const o1 = await api.post('/outlets', {
            name: 'Wapixo Premium - Mumbai',
            phone: '9876543210',
            address: {
                street: 'Bandra West',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400050'
            }
        });
        console.log('Outlet 1 created:', o1.data.data._id);

        const o2 = await api.post('/outlets', {
            name: 'Wapixo Select - Pune',
            phone: '9876543211',
            address: {
                street: 'Koregaon Park',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411001'
            }
        });
        console.log('Outlet 2 created:', o2.data.data._id);

        const outletIds = [o1.data.data._id, o2.data.data._id];

        console.log('Creating Services...');
        const servicesData = [
            {
                name: 'Signature Haircut',
                category: 'Hair Services',
                duration: 45,
                price: 800,
                description: 'Expert haircut by our master stylists.',
                gender: 'both',
                outletIds: [o1.data.data._id]
            },
            {
                name: 'Bridal Makeup',
                category: 'Makeup',
                duration: 180,
                price: 15000,
                description: 'Complete premium bridal transformation.',
                gender: 'women',
                outletIds: outletIds
            },
            {
                name: 'Hydra Facial',
                category: 'Skin Care',
                duration: 60,
                price: 3500,
                description: 'Deep cleansing and skin rejuvenation.',
                gender: 'both',
                outletIds: [o2.data.data._id]
            },
            {
                name: 'Global Hair Coloring',
                category: 'Hair Services',
                duration: 120,
                price: 4500,
                description: 'Full head premium hair coloring.',
                gender: 'women',
                outletIds: outletIds
            },
            {
                name: 'Party Makeup',
                category: 'Makeup',
                duration: 90,
                price: 3500,
                description: 'Elegant makeup for special occasions.',
                gender: 'women',
                outletIds: [o1.data.data._id]
            }
        ];

        for (const s of servicesData) {
            const res = await api.post('/services', s);
            console.log(`Service created: ${s.name} (${res.data.data._id})`);
        }

        console.log('All tasks completed successfully.');

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

main();
