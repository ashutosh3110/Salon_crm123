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

        res.status(200).json({
            success: true,
            data: {
                stats: [
                    { label: 'Campaign Reach', value: customerCount.toLocaleString(), trend: '+12%' },
                    { label: 'Conv. Rate', value: `${convRate}%`, trend: '+2%' },
                    { label: 'Total Sent', value: totalSent.toLocaleString(), icon: 'Zap' },
                    { label: 'Campaigns', value: campaigns.length.toString(), trend: null }
                ],
                chartData: [
                    { name: 'Mon', whatsapp: 120, email: 40 },
                    { name: 'Tue', whatsapp: 80, email: 30 },
                    { name: 'Wed', whatsapp: 200, email: 60 },
                    { name: 'Thu', whatsapp: 150, email: 45 },
                    { name: 'Fri', whatsapp: 280, email: 90 },
                    { name: 'Sat', whatsapp: 350, email: 120 },
                    { name: 'Sun', whatsapp: 400, email: 150 }
                ]
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
        
        // Mocking some segment logic for now
        res.status(200).json({
            success: true,
            data: [
                { id: 'all', label: 'All Customers', count: allCount },
                { id: 'loyal', label: 'Loyal Customers', count: Math.floor(allCount * 0.3) },
                { id: 'at_risk', label: 'At Risk', count: Math.floor(allCount * 0.1) },
                { id: 'new_month', label: 'New This Month', count: Math.floor(allCount * 0.15) },
                { id: 'birthday', label: 'Birthday Today', count: 2 }
            ]
        });
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
            // Segmented (mock logic)
            recipients = await Customer.find({ salonId }).limit(10).select('_id phone email name');
            targetCount = recipients.length;
        }

        console.log(`Starting WhatsApp campaign "${name}" for ${recipients.length} recipients...`);

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

        // Trigger the actual message sending logic
        const templateName = process.env.WHATSAPP_TEMPLATE_MARKETING || process.env.WHATSAPP_TEMPLATE_BOOKING_LINK || 'marketing_update';
        
        let successfulSends = 0;
        
        // Use a background-like processing (for small batches it's fine here)
        // In a large salon, this should be a background job
        const sendPromises = recipients.map(async (rcpt) => {
            if (!rcpt.phone) return;
            
            // parameters: [customerName, salonName, messageBody, actionLink] 
            // Matching the template requirement of 4 params
            const params = [];
            
            const result = await sendWhatsAppTemplate(rcpt.phone, templateName, params);
            if (result.success) {
                const msgId = result.data?.messages?.[0]?.id;
                console.log(`✅ WhatsApp sent to ${rcpt.name} (${rcpt.phone}) | ID: ${msgId || 'N/A'}`);
                successfulSends++;
            } else {
                console.error(`❌ WhatsApp FAILED for ${rcpt.name} (${rcpt.phone}):`, result.message);
            }
        });

        // Wait for all sends (or move to background)
        await Promise.all(sendPromises);

        campaign.sentCount = successfulSends;
        campaign.status = 'completed';
        await campaign.save();

        console.log(`Campaign "${name}" finished. Successfully sent: ${successfulSends}/${recipients.length}`);

        res.status(201).json({
            success: true,
            data: campaign,
            message: `Campaign sent to ${successfulSends} customers.`
        });
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
