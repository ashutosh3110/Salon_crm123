const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Role = require('./Models/Role');
const Staff = require('./Models/Staff');

async function checkData() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const roles = await Role.find({});
    console.log('=== ROLES ===');
    roles.forEach(r => {
        console.log(`Role: ${r.name}, Type: ${r.roleType}`);
        console.log(`  AdminAccess:`, r.adminMenuAccess);
        console.log(`  Hidden:`, r.hiddenSidebarItems);
    });

    const staff = await Staff.find({ role: 'stylist' });
    console.log('\n=== STAFF (Stylists) ===');
    staff.forEach(s => {
        console.log(`Staff: ${s.name}, Role: ${s.role}, RoleId: ${s.roleId}`);
    });

    mongoose.disconnect();
}

checkData();
