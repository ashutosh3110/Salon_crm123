import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const TENANT_ID = new mongoose.Types.ObjectId('69cd28b0a2ab81ffa665d07a');
const OUTLET_ID = new mongoose.Types.ObjectId('69cdfefc01126da55ffc0342');
const CLIENT_ID = new mongoose.Types.ObjectId('69ce037208248ccf160bedda');

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Import models
    const { default: Invoice } = await import('../modules/invoice/invoice.model.js');
    const { default: Transaction } = await import('../modules/finance/transaction.model.js');

    // Get a staff user
    const staff = await mongoose.connection.db.collection('users').findOne({ tenantId: TENANT_ID });
    const STAFF_ID = staff?._id || TENANT_ID;

    // Get a service
    const service = await mongoose.connection.db.collection('services').findOne({ tenantId: TENANT_ID });
    const SERVICE_ID = service?._id || new mongoose.Types.ObjectId();
    const SERVICE_NAME = service?.name || 'Hair Cut';
    const SERVICE_PRICE = service?.price || 500;

    const now = new Date();
    const invoices = [];
    const transactions = [];

    // Create 10 invoices spread over last 7 days
    const methods = ['cash', 'card', 'online', 'cash', 'online'];
    const names = ['Hair Cut', 'Facial', 'Hair Color', 'Manicure', 'Beard Trim', 'Head Massage', 'Pedicure', 'Shampoo Wash', 'Hair Spa', 'Threading'];
    const prices = [500, 1200, 2500, 800, 300, 600, 900, 400, 1500, 200];

    for (let i = 0; i < 10; i++) {
        const daysAgo = Math.floor(i / 2); // 2 per day for last 5 days
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(10 + i, 30, 0, 0);

        const price = prices[i];
        const tax = Math.round(price * 0.18);
        const total = price + tax;
        const method = methods[i % methods.length];

        invoices.push({
            invoiceNumber: `INV-SEED-${Date.now()}-${i}`,
            tenantId: TENANT_ID,
            outletId: OUTLET_ID,
            clientId: CLIENT_ID,
            items: [{
                type: 'service',
                itemId: SERVICE_ID,
                name: names[i],
                price: price,
                quantity: 1,
                total: price,
                stylistId: STAFF_ID,
            }],
            subTotal: price,
            tax: tax,
            discount: 0,
            total: total,
            paymentStatus: 'paid',
            paymentMethod: method,
            staffId: STAFF_ID,
            createdAt: date,
            updatedAt: date,
        });

        // Matching income transaction
        transactions.push({
            tenantId: TENANT_ID,
            outletId: OUTLET_ID,
            type: 'income',
            amount: total,
            category: 'service',
            paymentMethod: method,
            description: `${names[i]} - ${method.toUpperCase()}`,
            date: date,
            createdAt: date,
            updatedAt: date,
        });
    }

    // Create 5 expense transactions
    const expCats = ['rent', 'supplies', 'utilities', 'maintenance', 'marketing'];
    const expDescs = ['Monthly Rent', 'Salon Supplies', 'Electricity Bill', 'AC Service', 'Instagram Ads'];
    const expAmts = [15000, 3500, 2800, 1500, 5000];

    for (let i = 0; i < 5; i++) {
        const daysAgo = Math.floor(i / 2);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(14 + i, 0, 0, 0);

        transactions.push({
            tenantId: TENANT_ID,
            outletId: OUTLET_ID,
            type: 'expense',
            amount: expAmts[i],
            category: expCats[i],
            paymentMethod: i % 2 === 0 ? 'cash' : 'online',
            description: expDescs[i],
            date: date,
            createdAt: date,
            updatedAt: date,
        });
    }

    // Insert
    const invResult = await Invoice.insertMany(invoices);
    console.log(`✅ ${invResult.length} invoices created`);

    const txResult = await Transaction.insertMany(transactions);
    console.log(`✅ ${txResult.length} transactions created (10 income + 5 expense)`);

    console.log('\n📊 Summary:');
    console.log(`  Invoices: ${invResult.length}`);
    console.log(`  Income Transactions: 10`);
    console.log(`  Expense Transactions: 5`);
    console.log(`  Date Range: Last 5 days`);
    console.log(`  Payment Methods: cash, card, online`);

    await mongoose.disconnect();
    console.log('\nDone! Bills seeded successfully.');
}

seed().catch(e => { console.error(e); process.exit(1); });
