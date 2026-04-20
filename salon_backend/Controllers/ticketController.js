const Ticket = require('../Models/Ticket');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
    try {
        let query = {};
        if (req.user && req.user.role !== 'superadmin') {
            query.tenantId = req.user.salonId;
        }

        const tickets = await Ticket.find(query)
            .populate('tenantId', 'name email status')
            .populate('userId', 'name role email')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('tenantId', 'name email')
            .populate('userId', 'name role email')
            .populate('responses.userId', 'name role');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Add authorization check later if needed
        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        const newTicket = { ...req.body };
        if (req.user) {
            newTicket.userId = req.user._id;
            // Only set tenantId if it's not already provided or if the user is not a superadmin
            if (!newTicket.tenantId && req.user.role !== 'superadmin') {
                newTicket.tenantId = req.user.salonId;
            }
        }

        const ticket = await Ticket.create(newTicket);
        res.status(201).json({
            success: true,
            data: ticket
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add a response to a ticket
// @route   POST /api/tickets/:id/responses
// @access  Private
exports.addResponse = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

        ticket.responses.push({
            message: req.body.message,
            userId: req.user ? req.user._id : null
        });
        await ticket.save();

        const updatedTicket = await Ticket.findById(req.params.id)
            .populate('tenantId', 'name email')
            .populate('userId', 'name role email')
            .populate('responses.userId', 'name role');

        res.status(200).json({ success: true, data: updatedTicket });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id
// @access  Private/SuperAdmin
exports.updateTicketStatus = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true, runValidators: true }
        ).populate('tenantId', 'name email').populate('userId', 'name role email');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.status(200).json({
            success: true,
            data: ticket
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private/SuperAdmin
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        await ticket.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Ticket deleted'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
