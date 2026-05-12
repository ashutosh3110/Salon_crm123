const Faq = require('../Models/Faq');
const Ticket = require('../Models/Ticket');

// @desc    Get all active FAQs
// @route   GET /api/support/faqs
// @access  Public
exports.getFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find({ isActive: true }).sort({ order: 1 });
        res.json({ success: true, data: faqs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        const { subject, description, category, tenantId, outletId } = req.body;
        const customerId = req.user ? req.user.id : null; 

        const ticket = await Ticket.create({
            subject,
            description,
            category,
            tenantId,
            outletId,
            customerId,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Get customer tickets
// @route   GET /api/support/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
    try {
        const customerId = req.user.id;
        const tickets = await Ticket.find({ customerId }).sort({ createdAt: -1 });
        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add response to a ticket
// @route   POST /api/support/tickets/:id/response
// @access  Private
exports.addTicketResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.responses.push({
            message,
            userId: req.user.id, // Can be customer or admin
            createdAt: new Date()
        });

        await ticket.save();
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get tickets for Salon Admin
// @route   GET /api/support/admin/tickets
// @access  Private/Admin
exports.getAdminTickets = async (req, res) => {
    try {
        const tenantId = req.user.salonId || req.user.tenantId;
        const { outletId } = req.query;

        let query = { tenantId };
        if (outletId) query.outletId = outletId;

        const tickets = await Ticket.find(query)
            .populate('customerId', 'name email phone')
            .populate('tenantId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get tickets for Super Admin
// @route   GET /api/support/superadmin/tickets
// @access  Private/SuperAdmin
exports.getSuperAdminTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ status: 'escalated' })
            .populate('tenantId', 'name')
            .populate('customerId', 'name email')
            .sort({ updatedAt: -1 });
        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update ticket status
// @route   PATCH /api/support/tickets/:id/status
// @access  Private/Admin or SuperAdmin
exports.updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true })
            .populate('tenantId', 'name')
            .populate('customerId', 'name email')
            .populate('responses.userId', 'name role');
            
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Escalate ticket to Super Admin
// @route   PATCH /api/support/tickets/:id/escalate
// @access  Private/Admin
exports.escalateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'escalated' }, { new: true })
            .populate('tenantId', 'name')
            .populate('customerId', 'name email');
            
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new FAQ
// @route   POST /api/support/faqs
// @access  Private/SuperAdmin
exports.createFaq = async (req, res) => {
    try {
        const faq = await Faq.create(req.body);
        res.status(201).json({ success: true, data: faq });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update an FAQ
// @route   PATCH /api/support/faqs/:id
// @access  Private/SuperAdmin
exports.updateFaq = async (req, res) => {
    try {
        const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
        res.json({ success: true, data: faq });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete an FAQ
// @route   DELETE /api/support/faqs/:id
// @access  Private/SuperAdmin
exports.deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findByIdAndDelete(req.params.id);
        if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
        res.json({ success: true, message: 'FAQ deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
