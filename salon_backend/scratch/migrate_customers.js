const mongoose = require('mongoose');
const Customer = require('../Models/Customer');
require('dotenv').config();

async function migrateCustomers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const targetSalonId = '69e1d0d1e718cc8008570a64'; // Current Salon "dfg"
        
        console.log(`Migrating all customers to Salon ID: ${targetSalonId} (Handling duplicates)...`);

        const allCustomers = await Customer.find({ salonId: { $ne: targetSalonId } });
        let updatedCount = 0;
        let deletedCount = 0;

        for (const customer of allCustomers) {
            // Check if this phone already exists in target salon
            const exists = await Customer.findOne({ 
                phone: customer.phone, 
                salonId: targetSalonId 
            });

            if (exists) {
                // If it exists, delete this duplicate orphaned record
                await Customer.findByIdAndDelete(customer._id);
                deletedCount++;
            } else {
                // Otherwise update it
                customer.salonId = targetSalonId;
                await customer.save();
                updatedCount++;
            }
        }

        console.log(`Migration Complete:`);
        console.log(`- Updated: ${updatedCount}`);
        console.log(`- Deleted Duplicates: ${deletedCount}`);
        console.log(`Total customers now in Salon 'dfg': ${await Customer.countDocuments({ salonId: targetSalonId })}`);

        mongoose.connection.close();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrateCustomers();
