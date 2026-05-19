const mongoose = require('mongoose');

const mongoUri = "mongodb://mohammadrehan00121_db_user:4QlKqb1h5rM05lSZ@ac-al5duhf-shard-00-00.rnxrxmk.mongodb.net:27017,ac-al5duhf-shard-00-01.rnxrxmk.mongodb.net:27017,ac-al5duhf-shard-00-02.rnxrxmk.mongodb.net:27017/Saloon_Test?ssl=true&replicaSet=atlas-xosmfq-shard-0&authSource=admin&appName=Cluster0";

async function main() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected!");

    // Define temporary schemas to read invoice & customer
    const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
    const Invoice = mongoose.model('Invoice', new mongoose.Schema({}, { strict: false }));

    const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    if (!latestInvoice) {
        console.log("No invoices found.");
        return;
    }

    console.log("\n--- LATEST INVOICE ---");
    console.log("Invoice Number:", latestInvoice.invoiceNumber);
    console.log("Created At:", latestInvoice.createdAt);
    console.log("Subtotal:", latestInvoice.subtotal);
    console.log("Tax:", latestInvoice.tax);
    console.log("Discount:", latestInvoice.discount);
    console.log("Total:", latestInvoice.total);
    console.log("Payments:", JSON.stringify(latestInvoice.payments, null, 2));
    console.log("Items:", JSON.stringify(latestInvoice.items, null, 2));
    console.log("Customer ID:", latestInvoice.customerId);

    if (latestInvoice.customerId) {
        const customer = await Customer.findById(latestInvoice.customerId);
        if (customer) {
            console.log("\n--- CUSTOMER ---");
            console.log("Name:", customer.name);
            console.log("Phone:", customer.phone);
            console.log("Due Amount:", customer.dueAmount);
            console.log("Wallet Balance:", customer.walletBalance);
        }
    }

    await mongoose.disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
