import supportService from './support.service.js';

/**
 * Create a new support ticket
 */
const createTicket = async (req, res) => {
    try {
        const userRole = req.user.role?.toLowerCase() || 'unknown';
        const ticket = await supportService.createTicket({
            ...req.body,
            userId: req.user._id,
            creatorRole: userRole,
            tenantId: req.user.tenantId?.toString(),
            status: userRole === 'manager' ? 'escalated' : 'open',
        });
        res.status(201).send({ success: true, data: ticket });
    } catch (error) {
        console.error('CREATE_TICKET_ERROR:', error);
        console.error('STACK:', error.stack);
        res.status(400).send({ success: false, message: error.message });
    }
};

/**
 * Get all tickets for current tenant or all tickets for superadmin
 */
const getTickets = async (req, res) => {
    try {
        const filter = {};
        const userRole = req.user.role.toLowerCase();
        
        if (userRole !== 'superadmin') {
            filter.tenantId = req.user.tenantId.toString();

            // Stylists, Receptionists, Accountants and Inventory Managers only see their own tickets
            if (['stylist', 'receptionist', 'accountant', 'inventory_manager'].includes(userRole)) {
                filter.userId = req.user._id;
            }

            // Managers see their own tickets AND tickets created by other staff
            if (userRole === 'manager') {
                filter.$or = [
                    { userId: req.user._id },
                    { creatorRole: { $in: ['stylist', 'receptionist', 'accountant', 'inventory_manager'] } }
                ];
            }
        } else {
            // Superadmins only see tickets created by Salon Admins
            filter.creatorRole = 'admin';
        }

        const options = {
            sortBy: req.query.sortBy,
            limit: parseInt(req.query.limit, 10) || 10,
            skip: parseInt(req.query.skip, 10) || 0,
        };

        const tickets = await supportService.queryTickets(filter, options);
        res.status(200).send({ success: true, data: tickets });
    } catch (error) {
        console.error('SUPPORT_GET_TICKETS_ERROR:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            error: error.message 
        });
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
        
        const userRole = req.user.role.toLowerCase();

        // Ensure non-superadmins can only see their own tenant's tickets
        if (userRole !== 'superadmin') {
            const ticketTenantId = ticket.tenantId._id ? ticket.tenantId._id.toString() : ticket.tenantId.toString();
            const userTenantId = req.user.tenantId.toString();

            if (ticketTenantId !== userTenantId) {
                return res.status(403).send({ success: false, message: 'Unauthorized' });
            }

            // Stylists, Receptionists, Accountants and Inventory Managers only see their own tickets
            if (['stylist', 'receptionist', 'accountant', 'inventory_manager'].includes(userRole) && ticket.userId._id.toString() !== req.user._id.toString()) {
                return res.status(403).send({ success: false, message: 'Unauthorized' });
            }

            // Managers see their own tickets OR tickets created by other staff
            if (userRole === 'manager') {
                const isOwn = ticket.userId._id.toString() === req.user._id.toString();
                const isStaff = ['stylist', 'receptionist', 'accountant', 'inventory_manager'].includes(ticket.creatorRole?.toLowerCase());
                if (!isOwn && !isStaff) {
                    return res.status(403).send({ success: false, message: 'Unauthorized' });
                }
            }
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

        // Auto-update status to in-progress if an admin/manager responds to an open ticket
        const userRole = req.user.role.toLowerCase();
        if (['admin', 'superadmin', 'manager'].includes(userRole) && ticket.status === 'open') {
            await supportService.updateTicketById(req.params.id, { status: 'in-progress' });
        }

        const updatedTicket = await supportService.getTicketById(req.params.id);
        res.status(200).send({ success: true, data: updatedTicket });
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
