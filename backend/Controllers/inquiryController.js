const Inquiry = require('../Models/Inquiry');
const Setting = require('../Models/Setting');
const { sendWhatsAppTemplate } = require('../Utils/whatsapp');

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private
exports.getInquiries = async (req, res) => {
    try {
        let filter = {};

        // Scope to user's salon context
        if (req.user && req.user.role !== 'superadmin') {
            filter.salonId = req.user.salonId;
        } else if (req.user && req.user.role === 'superadmin' && req.query.salonId) {
            filter.salonId = req.query.salonId;
        }

        const inquiries = await Inquiry.find(filter)
            .populate('outletId', 'name')
            .populate('interestedService', 'name price')
            .populate('staffAssigned', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: inquiries.length,
            results: inquiries,
            data: inquiries
        });
    } catch (err) {
        console.error('Get inquiries error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create an inquiry
// @route   POST /api/inquiries
// @access  Public/Private
exports.createInquiry = async (req, res) => {
    try {
        const payload = { ...req.body };
        
        // Auto-assign salon context if logged in
        if (req.user && req.user.salonId) {
            payload.salonId = req.user.salonId;
        }

        const inquiry = await Inquiry.create(payload);

        let populatedInquiry = inquiry;
        if (req.user) {
            populatedInquiry = await Inquiry.findById(inquiry._id)
                .populate('outletId', 'name')
                .populate('interestedService', 'name price')
                .populate('staffAssigned', 'name');
        }

        // Send WhatsApp Notification to SuperAdmin (existing logic)
        try {
            const settings = await Setting.findOne();
            const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || settings?.contactPhone;
            
            if (adminPhone) {
                const templateName = process.env.WHATSAPP_TEMPLATE_ENQUIRY || 'enquirytemplate';
                const parameters = [
                    inquiry.name || 'N/A',
                    inquiry.phone || 'N/A',
                    `Email: ${inquiry.email || 'N/A'} | Msg: ${(inquiry.message || 'N/A').replace(/\n/g, ' ')}`
                ];
                
                await sendWhatsAppTemplate(adminPhone, templateName, parameters);
            }
        } catch (waErr) {
            console.error('WhatsApp notification failed:', waErr.message);
        }

        res.status(201).json({
            success: true,
            data: populatedInquiry
        });
    } catch (err) {
        console.error('Create inquiry error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update inquiry
// @route   PATCH /api/inquiries/:id
// @access  Private
exports.updateInquiryStatus = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true, runValidators: true }
        )
        .populate('outletId', 'name')
        .populate('interestedService', 'name price')
        .populate('staffAssigned', 'name');

        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (err) {
        console.error('Update inquiry error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete an inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private
exports.deleteInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        await inquiry.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Inquiry deleted'
        });
    } catch (err) {
        console.error('Delete inquiry error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
