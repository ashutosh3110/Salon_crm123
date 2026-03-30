import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Users/Hp/Desktop/Salon_crm123/salon_backend/.env' });

const userSchema = new mongoose.Schema({
    name: String,
    role: String,
    salary: Number,
    status: String
});

const User = mongoose.model('User', userSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ 
            role: { $ne: 'superadmin' },
            status: 'active'
        }, 'name role salary');

        console.log('--- Staff Salary Report ---');
        if (users.length === 0) {
            console.log('No active staff found.');
        } else {
            users.forEach(u => {
                console.log(`Name: ${u.name.padEnd(20)} | Role: ${u.role.padEnd(12)} | Salary: ₹${u.salary || 0}`);
            });
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
