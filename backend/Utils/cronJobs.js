const cron = require('node-cron');
const Salon = require('../Models/Salon');
const User = require('../Models/User');
const Booking = require('../Models/Booking');
const Customer = require('../Models/Customer');
const CustomerMembership = require('../Models/CustomerMembership');
const ReminderHub = require('../Models/ReminderHub');
const Service = require('../Models/Service');
const Inquiry = require('../Models/Inquiry');
const { sendWapixoTemplate, checkAndDeductWhatsAppCredit, sendWhatsAppMessage, sendWhatsAppTemplate } = require('./whatsapp');
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
                c.birthdayWishSent = true;
                c.lastBirthdayWishSentAt = new Date();
                await c.save();
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
                c.anniversaryWishSent = true;
                c.lastAnniversaryWishSentAt = new Date();
                await c.save();
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
                    
                    // Always try to send as a WhatsApp template first to bypass Meta's 24-hour messaging window rule.
                    let sendResult = await sendWapixoTemplate(customer.phone, templateName, [
                        customer.name,
                        String(customer.dueAmount),
                        salonName
                    ]);

                    // Fallback to plain text message ONLY if the template send fails
                    if (!sendResult.success) {
                        console.warn('[WhatsApp-AutoReminder] Template sending failed, trying plain text fallback...', sendResult.message);
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

    // 5. Membership Expiry Reminders (Daily at 11:30 AM)
    cron.schedule('30 11 * * *', async () => {
        console.log('Running daily customer membership expiry reminders...');
        try {
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            const startOfToday = new Date(today.setHours(0, 0, 0, 0));
            const endOfToday = new Date(today.setHours(23, 59, 59, 999));

            const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
            const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

            const templateName = process.env.WHATSAPP_TEMPLATE_MEMBERSHIP_EXPIRY || 'membership_expiry';

            // 1. Remind customers expiring tomorrow (1 day before)
            const tomorrowExpirations = await CustomerMembership.find({
                expiryDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
                status: 'active'
            }).populate('customerId planId');

            console.log(`[Membership-Cron] Found ${tomorrowExpirations.length} memberships expiring tomorrow.`);

            for (const m of tomorrowExpirations) {
                if (m.customerId?.phone) {
                    const salonName = "our salon";
                    const salon = await Salon.findById(m.salonId);
                    const businessName = salon?.businessName || salon?.name || salonName;
                    const planName = m.planId?.name || 'Membership Plan';
                    const dateStr = new Date(m.expiryDate).toLocaleDateString('en-IN');

                    const canSend = await checkAndDeductWhatsAppCredit(m.salonId);
                    if (!canSend) {
                        console.log(`[Membership-Cron] Skipping customer ${m.customerId.name} - Insufficient credits or notifications disabled.`);
                        continue;
                    }

                    let sendResult;
                    if (process.env.WHATSAPP_TEMPLATE_MEMBERSHIP_EXPIRY) {
                        sendResult = await sendWapixoTemplate(m.customerId.phone, templateName, [
                            m.customerId.name,
                            planName,
                            dateStr,
                            "tomorrow",
                            businessName
                        ]);
                    } else {
                        const msg = `Dear ${m.customerId.name}, this is a friendly reminder that your membership *${planName}* at *${businessName}* is expiring tomorrow (${dateStr}). Renew today to keep enjoying your exclusive benefits!`;
                        sendResult = await sendWhatsAppMessage(m.customerId.phone, msg);
                    }
                    console.log(`[Membership-Cron] Expiry reminder (tomorrow) dispatched to ${m.customerId.name}. Result:`, sendResult);
                }
            }

            // 2. Remind customers expiring today (Same day)
            const todayExpirations = await CustomerMembership.find({
                expiryDate: { $gte: startOfToday, $lte: endOfToday },
                status: 'active'
            }).populate('customerId planId');

            console.log(`[Membership-Cron] Found ${todayExpirations.length} memberships expiring today.`);

            for (const m of todayExpirations) {
                if (m.customerId?.phone) {
                    const salon = await Salon.findById(m.salonId);
                    const businessName = salon?.businessName || salon?.name || "our salon";
                    const planName = m.planId?.name || 'Membership Plan';
                    const dateStr = new Date(m.expiryDate).toLocaleDateString('en-IN');

                    const canSend = await checkAndDeductWhatsAppCredit(m.salonId);
                    if (!canSend) {
                        console.log(`[Membership-Cron] Skipping customer ${m.customerId.name} - Insufficient credits.`);
                        continue;
                    }

                    let sendResult;
                    if (process.env.WHATSAPP_TEMPLATE_MEMBERSHIP_EXPIRY) {
                        sendResult = await sendWapixoTemplate(m.customerId.phone, templateName, [
                            m.customerId.name,
                            planName,
                            dateStr,
                            "today",
                            businessName
                        ]);
                    } else {
                        const msg = `Dear ${m.customerId.name}, your membership *${planName}* at *${businessName}* is expiring today (${dateStr}). Renew now to avoid service interruption and continue enjoying your exclusive benefits!`;
                        sendResult = await sendWhatsAppMessage(m.customerId.phone, msg);
                    }
                    console.log(`[Membership-Cron] Expiry reminder (today) dispatched to ${m.customerId.name}. Result:`, sendResult);

                    // Auto mark membership status as expired
                    m.status = 'expired';
                    await m.save();
                    console.log(`[Membership-Cron] Auto-updated status of membership ${m._id} to expired.`);
                }
            }

        } catch (err) {
            console.error('Error in customer membership cron:', err);
        }
    });

    // 5. Bridal Booking Reminders (Daily at 08:30 AM)
    cron.schedule('30 8 * * *', async () => {
        console.log('Running daily bridal booking reminders...');
        try {
            const today = new Date();
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Find all hubs with bridal bookings
            const hubs = await ReminderHub.find({
                'bridalBookings.0': { $exists: true }
            });

            for (const hub of hubs) {
                const salon = await Salon.findById(hub.salonId);
                const salonName = salon?.businessName || salon?.name || 'Our Salon';
                let hubUpdated = false;

                // We need to fetch dbHub to save changes correctly
                const dbHub = await ReminderHub.findById(hub._id);
                if (!dbHub) continue;

                for (const b of dbHub.bridalBookings) {
                    if (!b.eventDate) continue;

                    const eventDate = new Date(b.eventDate);
                    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                    const diffDays = Math.round((eventDateOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));

                    for (const r of b.reminders) {
                        if (r.active && !r.sentAt && r.daysBefore === diffDays) {
                            const canSend = await checkAndDeductWhatsAppCredit(hub.salonId);
                            if (canSend && b.clientPhone) {
                                const phone = b.clientPhone.replace(/\D/g, '');
                                const templateName = process.env.WHATSAPP_TEMPLATE_BRIDAL || 'bridal_reminder';
                                const daysInfo = r.daysBefore === 0 
                                    ? "today" 
                                    : `on ${eventDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;

                                // Try to send as a WhatsApp template first to bypass Meta's 24-hour messaging window rule.
                                let sendResult = await sendWapixoTemplate(phone, templateName, [
                                    b.clientName,
                                    b.service || 'Bridal Special',
                                    daysInfo,
                                    salonName
                                ]);

                                // Fallback to plain text message ONLY if the template send fails
                                if (!sendResult.success) {
                                    console.warn('[WhatsApp-BridalReminder] Template sending failed, trying plain text fallback...', sendResult.message);
                                    let plainMsg = `Hi ${b.clientName}, `;
                                    if (r.daysBefore === 0) {
                                        plainMsg += `Today is your big day! 👰✨ Your Bridal Service Booking (${b.service || 'Bridal Special'}) is scheduled for today. We are excited to make you look stunning for your wedding! - ${salonName}`;
                                    } else {
                                        const formattedDate = eventDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                        plainMsg += `Gentle reminder regarding your upcoming Bridal Service Booking (${b.service || 'Bridal Special'}) scheduled on ${formattedDate}. We look forward to serving you! - ${salonName}`;
                                    }
                                    sendResult = await sendWhatsAppMessage(phone, plainMsg);
                                }

                                console.log(`[Bridal-Cron] Dispatched ${r.label} WhatsApp reminder to ${b.clientName} (${phone}). Result:`, sendResult);

                                r.sentAt = new Date();
                                hubUpdated = true;
                            }
                        }
                    }
                }

                if (hubUpdated) {
                    await dbHub.save();
                }
            }
        } catch (err) {
            console.error('Error in bridal reminder cron:', err);
        }
    });

    // 6. Repeated Services Reminders (Daily at 09:30 AM)
    cron.schedule('30 9 * * *', async () => {
        console.log('Running daily repeated services reminders...');
        try {
            const today = new Date();
            const ServiceReminder = require('../Models/ServiceReminder');
            const reminders = await ServiceReminder.find({
                status: 'pending',
                dueDate: { $lte: today }
            }).populate('customerId', 'name phone').populate('serviceId', 'name').populate('salonId', 'name businessName').populate('outletId');

            for (const r of reminders) {
                if (r.customerId && r.customerId.phone) {
                    const salonName = r.salonId?.businessName || r.salonId?.name || 'Wapixo';
                    const serviceName = r.serviceId?.name || 'Service';
                    const phone = r.customerId.phone;
                    const contact = r.outletId?.phone || 'Contact Us';
                    
                    const canSend = await checkAndDeductWhatsAppCredit(r.outletId?._id || r.salonId?._id);
                    if (canSend) {
                        try {
                            await sendWapixoTemplate(phone, 'booking_service_remainder', [
                                r.customerId.name,
                                "It's time for your next service!",
                                serviceName,
                                r.outletId?.name || salonName,
                                today.toLocaleDateString(),
                                "Any time today",
                                contact,
                                salonName
                            ]);
                            r.status = 'sent';
                            r.sentAt = new Date();
                            console.log(`[RepeatService-Cron] Sent repeat service reminder to ${r.customerId.name} (${phone}) for ${serviceName}`);
                        } catch (sendErr) {
                            r.status = 'failed';
                            r.failureReason = sendErr.message || 'WhatsApp sending failed';
                            console.error(`[RepeatService-Cron] Failed to send to ${phone}:`, sendErr);
                        }
                    } else {
                        r.status = 'failed';
                        r.failureReason = 'Insufficient WhatsApp credits';
                    }
                    await r.save();

                    // Send Push Notification
                    await sendNotification({
                        customerId: r.customerId._id,
                        salonId: r.salonId?._id,
                        title: 'Time for your next service! 💅✨',
                        message: `Hi ${r.customerId.name}, it's time for your repeat ${serviceName}. Book your slot now!`,
                        type: 'booking',
                        actionUrl: '/app/booking'
                    });
                }
            }
        } catch (err) {
            console.error('Error in repeated services cron:', err);
        }
    });

    // 7. Inquiry Follow-up Reminders (Daily at 10:30 AM)
    cron.schedule('30 10 * * *', async () => {
        console.log('Running daily inquiry follow-up reminders...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Fetch inquiries with 'new' or 'follow-up' status
            const activeInquiries = await Inquiry.find({
                status: { $in: ['new', 'follow-up'] }
            });

            console.log(`[Inquiry-FollowUp] Found ${activeInquiries.length} active inquiries to evaluate.`);

            for (const inq of activeInquiries) {
                if (!inq.phone) continue;

                const createdAt = new Date(inq.createdAt);
                createdAt.setHours(0, 0, 0, 0);

                const diffTime = today.getTime() - createdAt.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                // Only send reminders on day 3, 7, 10, and 15
                if ([3, 7, 10, 15].includes(diffDays)) {
                    // Check and deduct credit
                    const targetId = inq.outletId || inq.salonId;
                    if (!targetId) {
                        console.log(`[Inquiry-FollowUp] Skipping inquiry ${inq._id} - No salonId or outletId associated.`);
                        continue;
                    }

                    const canSend = await checkAndDeductWhatsAppCredit(targetId);
                    if (!canSend) {
                        console.log(`[Inquiry-FollowUp] Skipping inquiry ${inq._id} - Insufficient credits or notifications disabled.`);
                        continue;
                    }

                    const salon = await Salon.findById(inq.salonId);
                    const salonName = salon?.businessName || salon?.name || 'Our Salon';
                    const templateName = process.env.WHATSAPP_TEMPLATE_INQUIRY_FOLLOWUP || 'inquiry_follow_up';

                    let sendResult;
                    if (process.env.WHATSAPP_TEMPLATE_INQUIRY_FOLLOWUP) {
                        // Template parameters: [Customer Name, Service Interest, Salon Name, Diff Days]
                        sendResult = await sendWhatsAppTemplate(inq.phone, templateName, [
                            inq.name,
                            inq.serviceInterest || 'our services',
                            salonName,
                            String(diffDays)
                        ]);
                    } else {
                        // Plain text fallback
                        const msg = `Hi ${inq.name}, thank you for inquiring about ${inq.serviceInterest || 'our services'} at ${salonName}. Just checking in to see if you have any questions or would like to book an appointment. We'd love to welcome you!`;
                        sendResult = await sendWhatsAppMessage(inq.phone, msg);
                    }

                    console.log(`[Inquiry-FollowUp] Reminder sent to ${inq.name} (${inq.phone}) for day ${diffDays}. Result:`, sendResult);
                }
            }
        } catch (err) {
            console.error('Error in inquiry follow-up cron:', err);
        }
    });

    // 8. Delete Expired Banners (Daily at 00:30)
    cron.schedule('30 0 * * *', async () => {
        console.log('Running daily expired banners cleanup...');
        try {
            const Cms = require('../Models/Cms');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find all CMS documents for banners
            const bannerDocs = await Cms.find({ section: 'banners' });
            for (const doc of bannerDocs) {
                if (doc.content && Array.isArray(doc.content)) {
                    const originalLength = doc.content.length;
                    doc.content = doc.content.filter(banner => {
                        if (banner.expirationType === 'expire' && banner.expiryDate) {
                            const expiryDate = new Date(banner.expiryDate);
                            return expiryDate >= today; // Keep if not yet expired
                        }
                        return true; // Keep if never expires
                    });

                    if (doc.content.length !== originalLength) {
                        doc.markModified('content');
                        await doc.save();
                        console.log(`[Banners-Cron] Deleted ${originalLength - doc.content.length} expired banners from tenant ${doc.tenantId || 'global'}`);
                    }
                }
            }
        } catch (err) {
            console.error('Error in expired banners cleanup cron:', err);
        }
    });

    console.log('Cron Jobs Initialized: Subscription (00:00), Reminders (09:00), Celebrations (08:00), Payment Reminders (10:00), Membership Expiry (11:30), Bridal (08:30), Repeated Services (09:30), Inquiry Follow-up (10:30), Banner Expiry (00:30)');
};

module.exports = initCronJobs;
