import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './src/modules/invoice/invoice.model.js';

dotenv.config();

async function repair() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Using simple filter to avoid PS escaping issues with $
    const res = await Invoice.updateMany(
        { staffId: null }, 
        { staffId: new mongoose.Types.ObjectId('69c8597bce0b45300401f36b') } // Neha (Receptionist)
    );
    
    console.log(`Updated ${res.modifiedCount} invoices to 'Neha'`);
    await mongoose.disconnect();
}

repair().catch(err => {
    console.error(err);
    process.exit(1);
});
