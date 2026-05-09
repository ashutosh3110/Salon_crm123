const mongoose = require('mongoose');
const User = require('../Models/User');
const Staff = require('../Models/Staff');
const Salon = require('../Models/Salon');
const Customer = require('../Models/Customer');
require('dotenv').config({ path: '../.env' });

const checkId = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const id = '69fecefc8ee5e631ce248d3a';
        
        console.log('Checking ID:', id);
        
        const [user, staff, salon, customer] = await Promise.all([
            User.findById(id),
            Staff.findById(id),
            Salon.findById(id),
            Customer.findById(id)
        ]);
        
        if (user) console.log('Found in User collection');
        if (staff) console.log('Found in Staff collection');
        if (salon) console.log('Found in Salon collection');
        if (customer) console.log('Found in Customer collection');
        
        if (!user && !staff && !salon && !customer) console.log('ID not found in any major collection');
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkId();
