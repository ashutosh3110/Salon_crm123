const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Outlet = mongoose.connection.collection('outlets');
    const Staff = mongoose.connection.collection('staffs');
    const User = mongoose.connection.collection('users');
    
    const outlets = await Outlet.find({}).toArray();
    const staff = await Staff.find({}).toArray();
    const users = await User.find({}).toArray();
    
    console.log('--- Outlets ---');
    outlets.forEach(o => console.log(`${o.name} (${o._id})`));
    
    console.log('\n--- Staff Collection ---');
    staff.forEach(s => console.log(`${s.name} - role: ${s.role}, outletId: ${s.outletId}`));
    
    console.log('\n--- Users Collection ---');
    users.forEach(s => console.log(`${s.name} - role: ${s.role}, outletId: ${s.outletId}`));
    
    process.exit();
}

check();
