const Campaign = require('../Models/Campaign');
const Customer = require('../Models/Customer');
const Salon = require('../Models/Salon');
const { sendWhatsAppTemplate } = require('../Utils/whatsapp');

// @desc    Get marketing dashboard
// @route   GET /marketing/dashboard
// @access  Private (Salon Admin/Manager)
exports.getDashboard = async (req, res) => {
    try {
        const salonId = req.user.salonId;

        // Get total customers
        const customerCount = await Customer.countDocuments({ salonId });

        // Get campaign stats
        const campaigns = await Campaign.find({ salonId });
        const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
        const totalRead = campaigns.reduce((acc, c) => acc + (c.readCount || 0), 0);
        
        const convRate = totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : 0;

        // Calculate dynamic chart data for the last 7 days
        const chartData = [];
        const today = new Date();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayCampaigns = campaigns.filter(c => 
                c.createdAt >= d && c.createdAt < nextDay
            );

            const whatsappSent = dayCampaigns
                .filter(c => c.channel === 'whatsapp' || !c.channel)
                .reduce((sum, c) => sum + (c.sentCount || 0), 0);

            const pushSent = dayCampaigns
                .filter(c => c.channel === 'push' || c.channel === 'notification')
                .reduce((sum, c) => sum + (c.sentCount || 0), 0);

            chartData.push({
                name: dayNames[d.getDay()],
                whatsapp: whatsappSent,
                email: pushSent // repurposing email for push/notifications in the chart
            });
        }

        res.status(200).json({
            success: true,
            data: {
                stats: [
                    { label: 'Campaign Reach', value: customerCount.toLocaleString(), trend: null },
                    { label: 'Conv. Rate', value: `${convRate}%`, trend: null },
                    { label: 'Total Sent', value: totalSent.toLocaleString(), icon: 'Zap' },
                    { label: 'Campaigns', value: campaigns.length.toString(), trend: null }
                ],
                chartData: chartData
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get audience segments
// @route   GET /marketing/segments
// @access  Private
exports.getSegments = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const allCount = await Customer.countDocuments({ salonId });
        
        // Loyal: 5+ visits
        const loyalCount = await Customer.countDocuments({ salonId, totalVisits: { $gte: 5 } });
        
        // At Risk: No visit in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const atRiskCount = await Customer.countDocuments({ 
            salonId, 
            $or: [
                { lastVisit: { $lt: thirtyDaysAgo } },
                { lastVisit: { $exists: false }, createdAt: { $lt: thirtyDaysAgo } }
            ]
        });

        // New This Month
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0,0,0,0);
        const newCount = await Customer.countDocuments({ salonId, createdAt: { $gte: firstDayOfMonth } });

        res.status(200).json({
            success: true,
            data: [
                { id: 'all', label: 'All Customers', count: allCount },
                { id: 'loyal', label: 'Loyal Customers', count: loyalCount },
                { id: 'at_risk', label: 'At Risk', count: atRiskCount },
                { id: 'new_month', label: 'New This Month', count: newCount }
            ]
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create segment (static — returns the predefined list after noting the name)
// @route   POST /marketing/segments
exports.createSegment = async (req, res) => {
    res.status(201).json({ success: true, data: { id: Date.now().toString(), ...req.body } });
};

// @desc    Delete segment (static — no-op for built-in segments)
// @route   DELETE /marketing/segments/:id
exports.deleteSegment = async (req, res) => {
    res.json({ success: true, data: {} });
};

// @desc    Get customers in a segment
// @route   GET /marketing/segments/:id/customers
exports.getSegmentCustomers = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const segmentId = req.params.id;
        let query = { salonId };

        if (segmentId === 'loyal') {
            query.totalVisits = { $gte: 5 };
        } else if (segmentId === 'at_risk') {
            const d = new Date(); d.setDate(d.getDate() - 30);
            query.$or = [{ lastVisit: { $lt: d } }, { lastVisit: { $exists: false }, createdAt: { $lt: d } }];
        } else if (segmentId === 'new_month') {
            const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: d };
        }

        const customers = await Customer.find(query).select('name phone email totalVisits lastVisit').limit(200);
        res.json({ success: true, data: customers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get campaigns
// @route   GET /marketing/campaigns
// @access  Private
exports.getCampaigns = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const campaigns = await Campaign.find({ salonId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                results: campaigns
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create and send campaign
// @route   POST /marketing/campaigns
// @access  Private
exports.createCampaign = async (req, res) => {
    try {
        const { name, type, segment, selectedCustomers, message, channel } = req.body;
        const salonId = req.user.salonId;

        let targetCount = 0;
        let recipients = [];

        if (type === 'bulk') {
            recipients = await Customer.find({ salonId }).select('_id phone email name');
            targetCount = recipients.length;
        } else if (type === 'selective') {
            recipients = await Customer.find({ _id: { $in: selectedCustomers } }).select('_id phone email name');
            targetCount = recipients.length;
        } else {
            // Segmented dynamic logic
            let query = { salonId };
            if (segment === 'loyal') {
                query.totalVisits = { $gte: 5 };
            } else if (segment === 'at_risk') {
                const d = new Date(); d.setDate(d.getDate() - 30);
                query.$or = [{ lastVisit: { $lt: d } }, { lastVisit: { $exists: false }, createdAt: { $lt: d } }];
            } else if (segment === 'new_month') {
                const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
                query.createdAt = { $gte: d };
            }
            recipients = await Customer.find(query).select('_id phone email name');
            targetCount = recipients.length;
        }

        console.log(`Starting ${channel || 'whatsapp'} campaign "${name}" for ${recipients.length} recipients...`);

        const campaign = await Campaign.create({
            salonId,
            name,
            type,
            segment,
            selectedCustomers: type === 'selective' ? selectedCustomers : [],
            message,
            channel: channel || 'whatsapp',
            sentCount: 0,
            status: 'sending'
        });

        let successfulSends = 0;

        if (channel === 'notification') {
            const { broadcastNotification, sendNotification } = require('../Utils/notification');
            
            const sendPromises = recipients.map(async (rcpt) => {
                try {
                    const res = await sendNotification({
                        customerId: rcpt._id,
                        salonId,
                        title: name,
                        message: message.replace(/{{name}}/g, rcpt.name || 'Customer'),
                        type: 'marketing'
                    });
                    if (res.success) successfulSends++;
                } catch (err) {
                    console.error(`Error sending notification to ${rcpt._id}:`, err.message);
                }
            });
            await Promise.allSettled(sendPromises);
        } else {
            // Use the centralized utilities
            const { sendWhatsAppMessage, sendWhatsAppTemplate } = require('../Utils/whatsapp');
            
            // Sending messages
            const sendPromises = recipients.map(async (rcpt) => {
                if (!rcpt.phone) return;
                
                try {
                    // Use approved 'new_campaign' template: {{1}}=Name, {{2}}=Subject, {{3}}=Message
                    const result = await sendWhatsAppTemplate(rcpt.phone, 'new_campaign', [
                        rcpt.name || 'Customer', 
                        name, 
                        message
                    ]);

                    if (result.success) {
                        successfulSends++;
                    } else {
                        // Fallback to plain text if template fails
                        const personalizedMessage = message.replace(/{{name}}/g, rcpt.name || 'Customer');
                        await sendWhatsAppMessage(rcpt.phone, personalizedMessage);
                        successfulSends++;
                    }
                } catch (err) {
                    console.error(`Error sending to ${rcpt.phone}:`, err.message);
                }
            });

            await Promise.all(sendPromises);
        }

        campaign.sentCount = successfulSends;
        campaign.status = 'completed';
        campaign.sentAt = new Date();
        await campaign.save();

        res.status(201).json({
            success: true,
            data: campaign,
            message: `Campaign "${name}" sent to ${successfulSends} customers.`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a campaign
// @route   DELETE /marketing/campaigns/:id
// @access  Private
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, salonId: req.user.salonId });
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        res.status(200).json({ success: true, message: 'Campaign deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Bulk delete campaigns
// @route   DELETE /marketing/campaigns/bulk
// @access  Private
exports.bulkDeleteCampaigns = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: 'Invalid IDs' });
        }
        await Campaign.deleteMany({ _id: { $in: ids }, salonId: req.user.salonId });
        res.status(200).json({ success: true, message: 'Campaigns deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get automations
// @route   GET /marketing/automations
// @access  Private
exports.getAutomations = async (req, res) => {
    // Return standard automations
    res.status(200).json({
        success: true,
        data: [
            { 
                id: 'birthday', 
                name: 'Birthday Greeting', 
                short: 'Sent automatically on customer birthdays',
                badge: 'Popular',
                enabled: true,
                triggerLabel: 'Day of birthday at 10:00 AM',
                channelLabel: 'WhatsApp & SMS',
                preview: 'Happy Birthday {{name}}! To celebrate, here is a special 15% discount for your next visit at {{salon_name}}.'
            },
            { 
                id: 'follow_up', 
                name: 'Post-Visit Feedback', 
                short: 'Ask for review 2 hours after visit',
                enabled: false,
                triggerLabel: '2 hours after appointment ends',
                channelLabel: 'WhatsApp',
                preview: 'Hi {{name}}, how was your service today? We would love to hear your feedback!'
            }
        ]
    });
};
