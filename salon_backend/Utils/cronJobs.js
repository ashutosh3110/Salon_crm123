const cron = require('node-cron');
const Salon = require('../Models/Salon');
const User = require('../Models/User');
const Booking = require('../Models/Booking');
const Customer = require('../Models/Customer');
const { sendWapixoTemplate } = require('./whatsapp');
const { addLoyaltyPoints } = require('./loyalty');

const initCronJobs = () => {
    // 1. Subscription Expiration Check (Daily at 00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily subscription expiration check...');
        try {
            const today = new Date();
            const expiredSalons = await Salon.find({
                subscriptionExpiry: { $lt: today },
                status: { $in: ['active', 'trial'] }
            });

            for (const salon of expiredSalons) {
                salon.status = 'expired';
                salon.isActive = false;
                await salon.save();
                await User.findOneAndUpdate({ email: salon.email }, { isActive: false });
                console.log(`Salon ${salon.name} has expired.`);
            }
        } catch (err) {
            console.error('Error in subscription cron:', err);
        }
    });

    // 2. Service Booking Reminders (Daily at 09:00 AM)
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily service reminders...');
        try {
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            const startOfToday = new Date(today.setHours(0, 0, 0, 0));
            const endOfToday = new Date(today.setHours(23, 59, 59, 999));

            const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
            const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

            const reminderTemplate = process.env.WHATSAPP_TEMPLATE_SERVICE_REMINDER || 'booking_service_remainder';

            // Tomorrow reminders (1 day before)
            const tomorrowBookings = await Booking.find({
                appointmentDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
                status: { $nin: ['cancelled', 'completed'] }
            }).populate('clientId serviceId outletId salonId');

            for (let b of tomorrowBookings) {
                if (b.clientId?.phone) {
                    const salonName = b.salonId?.businessName || b.salonId?.name || 'Wapixo';
                    const outletName = b.outletId?.name || 'Our Outlet';
                    const serviceName = b.serviceId?.name || 'Service';
                    const contact = b.outletId?.phone || b.salonId?.contactPhone || 'Contact Us';
                    const dateStr = b.appointmentDate.toLocaleDateString();

                    await sendWapixoTemplate(b.clientId.phone, reminderTemplate, [
                        b.clientId.name,
                        "Your service is scheduled for tomorrow. We look forward to seeing you!",
                        serviceName,
                        outletName,
                        dateStr,
                        b.time || "Scheduled Time",
                        contact,
                        salonName
                    ]);
                }
            }

            // Same day reminders
            const todayBookings = await Booking.find({
                appointmentDate: { $gte: startOfToday, $lte: endOfToday },
                status: { $nin: ['cancelled', 'completed'] }
            }).populate('clientId serviceId outletId salonId');

            for (let b of todayBookings) {
                if (b.clientId?.phone) {
                    const salonName = b.salonId?.businessName || b.salonId?.name || 'Wapixo';
                    const outletName = b.outletId?.name || 'Our Outlet';
                    const serviceName = b.serviceId?.name || 'Service';
                    const contact = b.outletId?.phone || b.salonId?.contactPhone || 'Contact Us';
                    const dateStr = b.appointmentDate.toLocaleDateString();

                    await sendWapixoTemplate(b.clientId.phone, reminderTemplate, [
                        b.clientId.name,
                        "Your service is today! We are excited to serve you.",
                        serviceName,
                        outletName,
                        dateStr,
                        b.time || "Scheduled Time",
                        contact,
                        salonName
                    ]);
                }
            }
        } catch (err) {
            console.error('Error in reminder cron:', err);
        }
    });

    // 3. Birthday & Anniversary Celebrations (Daily at 08:00 AM)
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily celebration checks...');
        try {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const matchPattern = new RegExp(`(${month}[-/]${day})|(${day}[-/]${month})`);

            const celebrationTemplate = process.env.WHATSAPP_TEMPLATE_SPECIAL_DAYS || 'special_days';

            // Birthdays
            const birthdayUsers = await Customer.find({ dob: { $regex: matchPattern } }).populate('salonId');
            for (let c of birthdayUsers) {
                const salon = await Salon.findById(c.salonId);
                const salonName = salon?.businessName || salon?.name || 'Wapixo';
                const points = salon?.loyaltySetting?.birthdayPoints || 50;

                await sendWapixoTemplate(c.phone, celebrationTemplate, [
                    c.name,
                    "Happy Birthday! We wish you a fantastic year ahead filled with joy and beauty.",
                    String(points),
                    salonName
                ]);
                await addLoyaltyPoints(c._id, c.salonId, 'BIRTHDAY', 'Birthday Celebration Award');
            }

            // Anniversaries
            const anniversaryUsers = await Customer.find({ anniversary: { $regex: matchPattern } }).populate('salonId');
            for (let c of anniversaryUsers) {
                const salon = await Salon.findById(c.salonId);
                const salonName = salon?.businessName || salon?.name || 'Wapixo';
                const points = salon?.loyaltySetting?.anniversaryPoints || 100;

                await sendWapixoTemplate(c.phone, celebrationTemplate, [
                    c.name,
                    "Happy Anniversary! Celebrating your beautiful journey together.",
                    String(points),
                    salonName
                ]);
                await addLoyaltyPoints(c._id, c.salonId, 'ANNIVERSARY', 'Anniversary Celebration Award');
            }
        } catch (err) {
            console.error('Error in celebration cron:', err);
        }
    });

    console.log('Cron Jobs Initialized: Subscription (00:00), Reminders (09:00), Celebrations (08:00)');
};

module.exports = initCronJobs;
