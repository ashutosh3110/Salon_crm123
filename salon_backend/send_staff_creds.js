const mongoose = require('mongoose');
const User = require('./Models/User');
const sendEmail = require('./Utils/sendEmail');
const dotenv = require('dotenv');
dotenv.config();

const sendStaffEmails = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const staffEmails = [
            'rahul@example.com',
            'anjali@example.com',
            'vikram@example.com',
            'priya@example.com',
            'suresh@example.com'
        ];

        const password = '123456';

        for (const email of staffEmails) {
            const user = await User.findOne({ email });
            if (user) {
                // Update password
                user.password = password;
                await user.save();

                try {
                    await sendEmail({
                        email: user.email,
                        subject: 'Welcome to Salon CRM - Your Staff Credentials',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #333; text-align: center;">Welcome to the Team!</h2>
                                <p>Hello <strong>${user.name}</strong>,</p>
                                <p>You have been added as a <strong>${user.role}</strong> to our Salon Management System.</p>
                                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #D32F2F; margin: 20px 0;">
                                    <p style="margin: 0; font-size: 14px;"><strong>Login URL:</strong> http://localhost:5173/admin/login</p>
                                    <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Email:</strong> ${user.email}</p>
                                    <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Password:</strong> ${password}</p>
                                </div>
                                <p>Please login and update your profile details.</p>
                                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="font-size: 11px; color: #777; text-align: center;">Team Salon CRM</p>
                            </div>
                        `
                    });
                    console.log(`Email sent to: ${email}`);
                } catch (err) {
                    console.error(`Failed to send email to ${email}:`, err.message);
                }
            } else {
                console.log(`User not found: ${email}`);
            }
        }

        console.log('Finished updating passwords and sending emails.');
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

sendStaffEmails();
