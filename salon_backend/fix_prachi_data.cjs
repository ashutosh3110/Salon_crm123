const mongoose = require('mongoose');
const uri = 'mongodb+srv://ashutoshbankey21306_db_user:TaVAjeQx97LusWIp@cluster0.3t6trpn.mongodb.net/salon_crm?appName=Cluster0';

async function fix() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const tid = new mongoose.Types.ObjectId('69cd28b0a2ab81ffa665d07a');
    
    console.log('Targeting Tenant (Prachi):', tid.toString());

    // Fix transactions
    const r1 = await db.collection('inventorytransactions').updateMany(
        { type: 'STOCK_IN' }, 
        { $set: { tenantId: tid } }
    );
    
    // Fix suppliers
    const r2 = await db.collection('suppliers').updateMany(
        {}, 
        { $set: { tenantId: tid } }
    );

    console.log('Update results:', { transactions: r1.modifiedCount, suppliers: r2.modifiedCount });
    process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
