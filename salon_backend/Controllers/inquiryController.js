const Inquiry = require('../Models/Inquiry');
const Setting = require('../Models/Setting');
const { sendWhatsAppTemplate } = require('../Utils/whatsapp');

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/SuperAdmin
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create an inquiry
// @route   POST /api/inquiries
// @access  Public
exports.createInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.create(req.body);

        // Send WhatsApp Notification to SuperAdmin
        try {
            const settings = await Setting.findOne();
            // Prioritize .env number for now as requested by user
            const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || settings?.contactPhone;
            
            if (adminPhone) {
                const templateName = process.env.WHATSAPP_TEMPLATE_ENQUIRY || 'enquirytemplate';
                // Parameters: [Name, Phone, Email, Message]
                // Note: Ensure your 'enquirytemplate' in Meta Dashboard has these 4 variables in this order
                const parameters = [
                    inquiry.name || 'N/A',
                    inquiry.phone || 'N/A',
                    `Email: ${inquiry.email || 'N/A'} | Msg: ${(inquiry.message || 'N/A').replace(/\n/g, ' ')}`
                ];
                
                await sendWhatsAppTemplate(adminPhone, templateName, parameters);
            }
        } catch (waErr) {
            console.error('WhatsApp notification failed:', waErr.message);
            // Don't fail the request if notification fails
        }

        res.status(201).json({
            success: true,
            data: inquiry
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update inquiry status
// @route   PATCH /api/inquiries/:id
// @access  Private/SuperAdmin
exports.updateInquiryStatus = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete an inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private/SuperAdmin
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
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
