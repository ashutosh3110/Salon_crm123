const mongoose = require('mongoose');
const uri = 'mongodb+srv://ashutoshbankey21306_db_user:TaVAjeQx97LusWIp@cluster0.3t6trpn.mongodb.net/salon_crm?appName=Cluster0';

async function seed() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const tid = new mongoose.Types.ObjectId('69cd28b0a2ab81ffa665d07a');
    const uid = new mongoose.Types.ObjectId('69cd28b0a2ab81ffa665d07c'); 

    console.log('Seeding history for tenant:', tid.toString());

    // Clean up old ones if any (to avoid duplicates for testing)
    await db.collection('supplierinvoicepayments').deleteMany({ tenantId: tid });

    // 1. Add some payments for Modern Beauty Solutions
    const p1 = {
        tenantId: tid,
        invoiceKey: 'INV:INV/2024/001::Modern Beauty Solutions',
        amount: 500,
        paymentMethod: 'online',
        note: 'Partial payment 1',
        performedBy: uid,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
    };
    const p2 = {
        tenantId: tid,
        invoiceKey: 'INV:INV/2024/001::Modern Beauty Solutions',
        amount: 200,
        paymentMethod: 'cash',
        note: 'Partial payment 2',
        performedBy: uid,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) 
    };

    // 2. Add full payment for Salon Care Wholesale
    const p3 = {
        tenantId: tid,
        invoiceKey: 'INV:INV/2024/002::Salon Care Wholesale',
        amount: 3920, 
        paymentMethod: 'online',
        note: 'Full settlement',
        performedBy: uid,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };

    await db.collection('supplierinvoicepayments').insertMany([p1, p2, p3]);

    // 3. Add one more purchase for Modern Beauty to show a history of multiple bills
    await db.collection('inventorytransactions').insertOne({
        tenantId: tid,
        productId: new mongoose.Types.ObjectId('69cd1c77b9b3a6ebece05ef1'),
        outletId: null,
        type: 'STOCK_IN',
        quantity: 20,
        purchasePrice: 800,
        taxRate: 18,
        taxAmount: 2880,
        invoiceRef: 'BILL/990',
        supplierName: 'Modern Beauty Solutions',
        reason: 'Seeding history',
        performedBy: uid,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    });

    console.log('Seeded 3 payments and 1 new purchase successfully');
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
