import supportService from './support.service.js';

/**
 * Create a new support ticket
 */
const createTicket = async (req, res) => {
    try {
        const ticket = await supportService.createTicket({
            ...req.body,
            userId: req.user._id,
            tenantId: req.user.tenantId,
        });
        res.status(201).send({ success: true, data: ticket });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

/**
 * Get all tickets for current tenant or all tickets for superadmin
 */
const getTickets = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role !== 'superadmin') {
            filter.tenantId = req.user.tenantId;
        }

        const options = {
            sortBy: req.query.sortBy,
            limit: parseInt(req.query.limit, 10) || 10,
            skip: parseInt(req.query.skip, 10) || 0,
        };

        const tickets = await supportService.queryTickets(filter, options);
        res.status(200).send({ success: true, data: tickets });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

/**
 * Get a single ticket by ID
 */
const getTicket = async (req, res) => {
    try {
        const ticket = await supportService.getTicketById(req.params.id);
        if (!ticket) {
            return res.status(404).send({ success: false, message: 'Ticket not found' });
        }
        
        // Ensure non-superadmins can only see their own tenant's tickets
        if (req.user.role !== 'superadmin' && ticket.tenantId.toString() !== req.user.tenantId.toString()) {
            return res.status(403).send({ success: false, message: 'Unauthorized' });
        }

        res.status(200).send({ success: true, data: ticket });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

/**
 * Update a ticket (status, priority, etc.)
 */
const updateTicket = async (req, res) => {
    try {
        const ticket = await supportService.updateTicketById(req.params.id, req.body);
        res.status(200).send({ success: true, data: ticket });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

/**
 * Add a response/comment to a ticket
 */
const addResponse = async (req, res) => {
    try {
        const responseData = {
            userId: req.user._id,
            message: req.body.message,
            createdAt: new Date(),
        };
        const ticket = await supportService.addResponse(req.params.id, responseData);
        res.status(200).send({ success: true, data: ticket });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

export default {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    addResponse,
};
