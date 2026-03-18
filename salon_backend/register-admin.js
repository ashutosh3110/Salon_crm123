import mongoose from 'mongoose';
import { config } from './src/config/index.js';
import User from './src/modules/user/user.model.js';
import Tenant from './src/modules/tenant/tenant.model.js';
import Outlet from './src/modules/outlet/outlet.model.js';

const registerAdmin = async (adminData, salonData) => {
  try {
    console.log('Connecting to MongoDB using URI from config...');
    await mongoose.connect(config.mongoose.url);
    console.log('Successfully connected to MongoDB.');

    // Check if user email already exists
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.error(`Error: User with email "${adminData.email}" already exists.`);
      process.exit(1);
    }

    // 1. Create Tenant (Salon)
    let slug = salonData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const tenant = await Tenant.create({
      ...salonData,
      slug,
      status: 'active',
      subscriptionPlan: 'pro',
      onboardingStatus: 'COMPLETED',
      onboardingStep: 'STAFF_ADDED',
    });
    console.log(`Tenant Created: "${tenant.name}" (ID: ${tenant._id}, Slug: ${tenant.slug})`);

    // 2. Create Admin User
    // Note: Password will be hashed by the User model's pre-save hook
    const user = await User.create({
      ...adminData,
      role: 'admin',
      tenantId: tenant._id,
      onboardingStatus: 'COMPLETED',
      isEmailVerified: true,
      status: 'active',
    });
    console.log(`Admin User Created: "${user.name}" (ID: ${user._id}, Email: ${user.email})`);

    // 3. Link records: Update Tenant with Owner ID and Name
    tenant.owner = user._id;
    tenant.ownerName = user.name;
    tenant.outletsCount = 1;
    await tenant.save();
    console.log('Tenant updated with Owner reference and outlet count.');

    // 4. Create Initial Outlet
    const initialOutlet = await Outlet.create({
      name: `${salonData.name} - ${salonData.city || 'Main'}`,
      address: salonData.address || `Address for ${salonData.name}, ${salonData.city || ''}`,
      city: salonData.city || 'Ujjain',
      phone: adminData.phone || '9999999999',
      tenantId: tenant._id,
      isMain: true,
      status: 'active',
    });
    console.log(`Initial Outlet Created: "${initialOutlet.name}" (ID: ${initialOutlet._id})`);

    console.log('\n=======================================');
    console.log('     REGISTRATION SUCCESSFUL!          ');
    console.log('=======================================');
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`Salon:    ${tenant.name}`);
    console.log(`City:     ${tenant.city || 'Not specified'}`);
    console.log('=======================================');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('\n!!! Error during registration !!!');
    console.error(error.message);
    process.exit(1);
  }
};

// Simple argument parsing
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log('\nUsage: node register-admin.js <admin_name> <admin_email> <admin_password> <salon_name> [city]');
  console.log('Example: node register-admin.js "John Doe" "john@example.com" "password123" "Luxury Salon" "Indore"\n');
  process.exit(1);
}

const [name, email, password, salonName, city = 'Ujjain'] = args;

registerAdmin(
  { name, email, password },
  { name: salonName, email, city }
);
