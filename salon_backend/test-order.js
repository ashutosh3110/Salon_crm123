import loyaltyController from './src/modules/loyalty/loyalty.controller.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const req = {
        body: { planId: '69be24c5e5dab57' }, // Use a likely ID or just dummy
        tenantId: '69943f096cc9fc8e3a8f5ea7',
        user: { _id: '69943f096cc9fc8e3a8f5ea7', role: 'customer' }
    };
    const res = {
        status: (code) => {
            console.log('Status set to:', code);
            return res;
        },
        send: (data) => {
            console.log('Data sent:', data);
        }
    };
    const next = (err) => {
        console.error('Next called with error:', err);
    };

    console.log('Starting test...');
    try {
        await loyaltyController.createMembershipOrder(req, res, next);
    } catch (e) {
        console.error('Caught error in test:', e);
    }
}

test();
