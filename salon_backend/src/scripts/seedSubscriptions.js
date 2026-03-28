import mongoose from 'mongoose';
import { config } from '../config/index.js';
import Subscription from '../modules/subscription/subscription.model.js';

const subscriptions = [
    {
        name: 'Free',
        tag: 'free',
        color: 'slate',
        monthlyPrice: 0,
        yearlyPrice: 0,
        trialDays: 14,
        features: {
            pos: true,
            appointments: true,
            inventory: false,
            marketing: false,
            payroll: false,
            crm: false,
            mobileApp: false,
            reports: false,
            whatsapp: false,
            loyalty: false,
            finance: false,
            feedback: false
        },
        limits: {
            staffLimit: 3,
            outletLimit: 1,
            smsCredits: 0,
            whatsappLimit: 50,
            storageGB: 1
        }
    },
    {
        name: 'Basic',
        tag: 'basic',
        color: 'blue',
        monthlyPrice: 999,
        yearlyPrice: 9999,
        trialDays: 14,
        features: {
            pos: true,
            appointments: true,
            inventory: true,
            marketing: false,
            payroll: false,
            crm: true,
            mobileApp: false,
            reports: true,
            whatsapp: false,
            loyalty: false,
            finance: true,
            feedback: false
        },
        limits: {
            staffLimit: 10,
            outletLimit: 2,
            smsCredits: 200,
            whatsappLimit: 500,
            storageGB: 5
        }
    },
    {
        name: 'Premium',
        tag: 'premium',
        color: 'primary',
        popular: true,
        monthlyPrice: 2499,
        yearlyPrice: 24999,
        trialDays: 7,
        features: {
            pos: true,
            appointments: true,
            inventory: true,
            marketing: true,
            payroll: true,
            crm: true,
            mobileApp: true,
            reports: true,
            whatsapp: false,
            loyalty: true,
            finance: true,
            feedback: true
        },
        limits: {
            staffLimit: 25,
            outletLimit: 5,
            smsCredits: 1000,
            whatsappLimit: 2000,
            storageGB: 20
        }
    },
    {
        name: 'Enterprise',
        tag: 'enterprise',
        color: 'amber',
        monthlyPrice: 4999,
        yearlyPrice: 49999,
        trialDays: 0,
        features: {
            pos: true,
            appointments: true,
            inventory: true,
            marketing: true,
            payroll: true,
            crm: true,
            mobileApp: true,
            reports: true,
            whatsapp: true,
            loyalty: true,
            finance: true,
            feedback: true
        },
        limits: {
            staffLimit: 999,
            outletLimit: 999,
            smsCredits: 10000,
            whatsappLimit: 100000,
            storageGB: 100
        }
    }
];

const seed = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log('Connected to MongoDB');

        for (const subData of subscriptions) {
            const existing = await Subscription.findOne({ tag: subData.tag });
            if (!existing) {
                await Subscription.create(subData);
                console.log(`Created subscription: ${subData.name}`);
            } else {
                console.log(`Subscription already exists: ${subData.name}`);
            }
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
