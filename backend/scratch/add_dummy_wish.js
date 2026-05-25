const mongoose = require('mongoose');
require('dotenv').config();
const Customer = require('../Models/Customer');
const Salon = require('../Models/Salon');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const { addLoyaltyPoints } = require('../Utils/loyalty');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const targetPhone = '6268204871';
        let customer = await Customer.findOne({ phone: targetPhone });
        
        if (!customer) {
            console.log(`Customer with phone ${targetPhone} not found in DB!`);
            // Attempt to find any salon to create one
            const salon = await Salon.findOne();
            if (!salon) {
                console.error('No salon found in database to link the new customer to.');
                return;
            }
            console.log(`Creating new customer for Salon: ${salon.name}`);
            customer = new Customer({
                _id: new mongoose.Types.ObjectId('6a0c52cc05939ba0eca254fd'),
                salonId: salon._id,
                name: 'Rehan Multani',
                phone: targetPhone,
                gender: 'women',
                status: 'active',
                loyaltyPoints: 159,
                walletBalance: 0,
                dueAmount: 0,
                category: 'Regular',
                isVIP: false,
                totalSpend: 16167,
                totalVisits: 9,
                welcomeSent: true
            });
        }

        // Set DOB to today (May 25th)
        customer.dob = '2026-05-25';
        customer.birthdayWishSent = true;
        customer.lastBirthdayWishSentAt = new Date();

        await customer.save();
        console.log(`Customer "${customer.name}" (${customer.phone}) updated successfully:`);
        console.log(`- DOB set to: ${customer.dob}`);
        console.log(`- birthdayWishSent set to: ${customer.birthdayWishSent}`);
        console.log(`- lastBirthdayWishSentAt set to: ${customer.lastBirthdayWishSentAt}`);

        // Activate loyalty points on their Salon
        const salon = await Salon.findById(customer.salonId);
        if (salon) {
            if (!salon.loyaltySetting) {
                salon.loyaltySetting = {};
            }
            salon.loyaltySetting.active = true;
            salon.loyaltySetting.birthdayPoints = 50;
            await salon.save();
            console.log(`Updated loyalty settings on Salon "${salon.name}": active=true, birthdayPoints=50`);
        }

        // Add birthday loyalty points gift
        console.log('Awarding birthday loyalty points...');
        const result = await addLoyaltyPoints(customer._id, customer.salonId, 'BIRTHDAY', 'Birthday Celebration Award');
        if (result.success) {
            console.log(`Successfully added ${result.points} loyalty points to customer!`);
        } else {
            console.log(`addLoyaltyPoints helper returned: ${result.message}`);
            console.log('Falling back to manual points addition...');
            
            // Manual fallback
            await LoyaltyTransaction.create({
                customerId: customer._id,
                salonId: customer.salonId,
                type: 'CREDIT',
                amount: 50,
                description: 'Birthday Celebration Award (Manual Gift)',
                source: 'BIRTHDAY'
            });

            await Customer.findByIdAndUpdate(customer._id, {
                $inc: { loyaltyPoints: 50 }
            });
            console.log('Successfully credited 50 loyalty points manually.');
        }

        // Print final customer state
        const finalCustomer = await Customer.findById(customer._id);
        console.log('Final Customer DB Document:');
        console.log(JSON.stringify(finalCustomer, null, 2));

    } catch (err) {
        console.error('Error running script:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

run();
