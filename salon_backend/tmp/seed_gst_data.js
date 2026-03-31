import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from '../src/modules/invoice/invoice.model.js';
import Transaction from '../src/modules/finance/transaction.model.js';
import User from '../src/modules/user/user.model.js';

dotenv.config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find a Tenant and Outlet
        const staff = await User.findOne({ role: { $ne: 'superadmin' } });
        if (!staff || !staff.tenantId) {
            console.error('No staff or tenant found. Please create a staff member first.');
            process.exit(1);
        }

        const tid = staff.tenantId;
        const oid = staff.outletId || new mongoose.Types.ObjectId(); // Fallback if no outlet assigned

        console.log(`Seeding for Tenant: ${tid}`);

        // 2. Create Invoices (GST Output)
        // We'll create invoices for last 3 months
        const months = [0, 1, 2]; // Current, prev, prev-prev
        const invoiceData = [];

        for (const m of months) {
            const date = new Date();
            date.setMonth(date.getMonth() - m);
            
            for (let i = 0; i < 5; i++) {
                const subTotal = Math.floor(Math.random() * 5000) + 1000;
                const tax = Math.round(subTotal * 0.18);
                invoiceData.push({
                    invoiceNumber: `INV-${date.getFullYear()}-${date.getMonth()+1}-${Math.random().toString(36).substring(7).toUpperCase()}`,
                    tenantId: tid,
                    outletId: oid,
                    clientId: new mongoose.Types.ObjectId(),
                    items: [{ type: 'service', itemId: new mongoose.Types.ObjectId(), name: 'Global Hair Color', price: subTotal, total: subTotal }],
                    subTotal,
                    tax,
                    total: subTotal + tax,
                    paymentStatus: 'paid',
                    paymentMethod: 'card',
                    createdAt: date
                });
            }
        }

        await Invoice.insertMany(invoiceData);
        console.log(`✅ ${invoiceData.length} Invoices created (GST Output).`);

        // 3. Create Expenses (GST Input)
        const expenseData = [];
        for (const m of months) {
            const date = new Date();
            date.setMonth(date.getMonth() - m);

            // Inventory Purchases (High GST Input)
            expenseData.push({
                type: 'expense',
                amount: 15000 + Math.random() * 5000,
                category: 'inventory',
                paymentMethod: 'online',
                description: 'Monthly Product Stock Purchase',
                tenantId: tid,
                date: date
            });

            // Supplies
            expenseData.push({
                type: 'expense',
                amount: 5000 + Math.random() * 2000,
                category: 'supplies',
                paymentMethod: 'cash',
                description: 'Stationery and Cleaning Supplies',
                tenantId: tid,
                date: date
            });
        }

        await Transaction.insertMany(expenseData);
        console.log(`✅ ${expenseData.length} Expenses created (GST Input).`);

        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seed();
