const mongoose = require('mongoose');
const uri = 'mongodb+srv://ashutoshbankey21306_db_user:TaVAjeQx97LusWIp@cluster0.3t6trpn.mongodb.net/salon_crm?appName=Cluster0';

async function sync() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const tid = new mongoose.Types.ObjectId('69cd28b0a2ab81ffa665d07a');

    console.log('Syncing data for tenant:', tid.toString());

    // 1. Clear existing suppliers for this tenant to avoid confusion
    await db.collection('suppliers').deleteMany({ tenantId: tid });

    // 2. Create suppliers that EXACTLY match the transaction names
    const names = [
        'Modern Beauty Solutions',
        'Salon Care Wholesale',
        'Loreal Professional',
        'Dyson Hair Care',
        'Matrix India'
    ];

    const newSuppliers = names.map(name => ({
        tenantId: tid,
        name: name,
        contact: 'Support Team',
        phone: '1800-SUP-TEST',
        email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    await db.collection('suppliers').insertMany(newSuppliers);
    console.log(`Created ${newSuppliers.length} suppliers.`);

    // 3. Fix transactions where name might be undefined or slightly different
    // Update 'L'Oréal Professional' to 'Loreal Professional' for consistency
    await db.collection('inventorytransactions').updateMany(
        { tenantId: tid, supplierName: "L'Oréal Professional" },
        { $set: { supplierName: 'Loreal Professional' } }
    );

    // Assign 'Modern Beauty Solutions' to any undefined ones
    await db.collection('inventorytransactions').updateMany(
        { tenantId: tid, supplierName: { $exists: false } },
        { $set: { supplierName: 'Modern Beauty Solutions' } }
    );
    
    await db.collection('inventorytransactions').updateMany(
        { tenantId: tid, supplierName: null },
        { $set: { supplierName: 'Modern Beauty Solutions' } }
    );

    console.log('Supplier names synced across collections.');
    process.exit(0);
}

sync().catch(err => { console.error(err); process.exit(1); });
