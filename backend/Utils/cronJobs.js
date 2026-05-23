const cron = require('node-cron');
const Salon = require('../Models/Salon');
const User = require('../Models/User');
const Booking = require('../Models/Booking');
const Customer = require('../Models/Customer');
const { sendWapixoTemplate, checkAndDeductWhatsAppCredit, sendWhatsAppMessage } = require('./whatsapp');
const { addLoyaltyPoints } = require('./loyalty');
const { sendNotification } = require('./notification');

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

                    const canSendTomorrow = await checkAndDeductWhatsAppCredit(b.outletId?._id);
                    if (canSendTomorrow) {
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

                    // Send Push Notification
                    await sendNotification({
                        customerId: b.clientId._id,
                        salonId: b.salonId._id,
                        title: 'Service Reminder! 📅',
                        message: `Hi ${b.clientId.name}, your service for ${serviceName} at ${salonName} is scheduled for tomorrow (${dateStr}) at ${b.time || 'Scheduled Time'}.`,
                        type: 'booking',
                        actionUrl: `/app/bookings/${b._id}`
                    });
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

                    const canSendToday = await checkAndDeductWhatsAppCredit(b.outletId?._id);
                    if (canSendToday) {
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

                    // Send Push Notification
                    await sendNotification({
                        customerId: b.clientId._id,
                        salonId: b.salonId._id,
                        title: 'Service Today! ✨',
                        message: `Hi ${b.clientId.name}, your service for ${serviceName} at ${salonName} is scheduled for today at ${b.time || 'Scheduled Time'}. We look forward to seeing you!`,
                        type: 'booking',
                        actionUrl: `/app/bookings/${b._id}`
                    });
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

                const canSendBday = await checkAndDeductWhatsAppCredit(c.lastOutletId);
                if (canSendBday) {
                    await sendWapixoTemplate(c.phone, celebrationTemplate, [
                        c.name,
                        "Happy Birthday! We wish you a fantastic year ahead filled with joy and beauty.",
                        String(points),
                        salonName
                    ]);
                }

                // Send Push Notification
                await sendNotification({
                    customerId: c._id,
                    salonId: c.salonId,
                    title: 'Happy Birthday! 🎂',
                    message: `Hi ${c.name}, Happy Birthday! We've added ${points} loyalty points to your account. Have a beautiful day!`,
                    type: 'system'
                });

                await addLoyaltyPoints(c._id, c.salonId, 'BIRTHDAY', 'Birthday Celebration Award');
            }

            // Anniversaries
            const anniversaryUsers = await Customer.find({ anniversary: { $regex: matchPattern } }).populate('salonId');
            for (let c of anniversaryUsers) {
                const salon = await Salon.findById(c.salonId);
                const salonName = salon?.businessName || salon?.name || 'Wapixo';
                const points = salon?.loyaltySetting?.anniversaryPoints || 100;

                const canSendAniv = await checkAndDeductWhatsAppCredit(c.lastOutletId);
                if (canSendAniv) {
                    await sendWapixoTemplate(c.phone, celebrationTemplate, [
                        c.name,
                        "Happy Anniversary! Celebrating your beautiful journey together.",
                        String(points),
                        salonName
                    ]);
                }

                // Send Push Notification
                await sendNotification({
                    customerId: c._id,
                    salonId: c.salonId,
                    title: 'Happy Anniversary! 🎉',
                    message: `Hi ${c.name}, Happy Anniversary! We've added ${points} loyalty points to your account to celebrate your special day.`,
                    type: 'system'
                });

                await addLoyaltyPoints(c._id, c.salonId, 'ANNIVERSARY', 'Anniversary Celebration Award');
            }
        } catch (err) {
            console.error('Error in celebration cron:', err);
        }
    });

    // 4. Automated Payment Reminders (Daily at 10:00 AM)
    cron.schedule('0 10 * * *', async () => {
        console.log('Running daily automated payment reminders...');
        try {
            // Find all active salons with auto reminder enabled
            const activeSalons = await Salon.find({
                'whatsappSettings.autoPaymentReminder': true,
                isActive: true
            });

            console.log(`[Auto-Reminder] Found ${activeSalons.length} salons with auto payment reminders enabled.`);

            for (const salon of activeSalons) {
                const intervalDays = salon.whatsappSettings.paymentReminderIntervalDays || 7;
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - intervalDays);

                // Find customers of this salon with dueAmount > 0 who haven't been reminded recently
                const customers = await Customer.find({
                    salonId: salon._id,
                    dueAmount: { $gt: 0 },
                    $or: [
                        { lastPaymentReminderSentAt: { $exists: false } },
                        { lastPaymentReminderSentAt: null },
                        { lastPaymentReminderSentAt: { $lte: cutoffDate } }
                    ]
                });

                console.log(`[Auto-Reminder] Salon: ${salon.name} (${salon._id}) - Found ${customers.length} due customers to remind.`);

                for (const customer of customers) {
                    if (!customer.phone) continue;

                    // Deduct credit first (payment reminder is a WhatsApp notification)
                    const canSend = await checkAndDeductWhatsAppCredit(salon._id);
                    if (!canSend) {
                        console.log(`[Auto-Reminder] Skipping customer ${customer.name} - Insufficient credits or notifications disabled for salon ${salon.name}`);
                        continue;
                    }

                    // Prepare reminder template or message
                    const templateName = process.env.WHATSAPP_TEMPLATE_PAYMENT_REMINDER || 'payment_reminder';
                    const salonName = salon.businessName || salon.name || 'Wapixo';
                    
                    // Send using Wapixo template if WHATSAPP_TEMPLATE_PAYMENT_REMINDER is defined in process.env, otherwise fallback to plain message
                    let sendResult;
                    if (process.env.WHATSAPP_TEMPLATE_PAYMENT_REMINDER) {
                        // Template parameters: [Customer Name, Dues Amount, Salon Name]
                        sendResult = await sendWapixoTemplate(customer.phone, templateName, [
                            customer.name,
                            String(customer.dueAmount),
                            salonName
                        ]);
                    } else {
                        // Fallback to sending plain text message
                        const msg = `Dear ${customer.name}, this is a friendly reminder that you have a pending payment of ₹${customer.dueAmount} outstanding at ${salonName}. Please settle this at your earliest convenience. Thank you!`;
                        sendResult = await sendWhatsAppMessage(customer.phone, msg);
                    }

                    console.log(`[Auto-Reminder] Dispatched to ${customer.name} (${customer.phone}). Result:`, sendResult);

                    if (sendResult.success) {
                        customer.paymentReminderCount = (customer.paymentReminderCount || 0) + 1;
                        customer.lastPaymentReminderSentAt = new Date();
                        await customer.save();
                    }
                }
            }
        } catch (err) {
            console.error('Error in auto payment reminder cron:', err);
        }
    });

    console.log('Cron Jobs Initialized: Subscription (00:00), Reminders (09:00), Celebrations (08:00), Payment Reminders (10:00)');
};

module.exports = initCronJobs;
