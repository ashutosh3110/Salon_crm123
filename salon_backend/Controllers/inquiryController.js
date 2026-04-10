const Inquiry = require('../Models/Inquiry');

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
