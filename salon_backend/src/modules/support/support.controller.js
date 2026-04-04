import supportService from './support.service.js';
import notificationService from '../notification/notification.service.js';

/**
 * Create a new support ticket
 */
const createTicket = async (req, res) => {
    try {
        const userRole = req.user.role?.toLowerCase() || 'unknown';
        const ticketData = {
            ...req.body,
            creatorRole: userRole,
            tenantId: req.user.tenantId?.toString(),
            status: userRole === 'manager' ? 'escalated' : 'open',
        };

        // If it's a customer, set clientId, otherwise set userId
        if (userRole === 'customer') {
            ticketData.clientId = req.user._id;
        } else {
            ticketData.userId = req.user._id;
        }

        const ticket = await supportService.createTicket(ticketData);

        // Notify Admins/Managers about the new ticket
        if (userRole === 'customer') {
            notificationService.sendToRole(ticketData.tenantId, 'manager', {
                type: 'new_support_ticket',
                title: 'New Support Ticket',
                body: `New ticket from customer: ${req.user.name || 'Customer'}. Subject: ${ticketData.subject}`,
                actionUrl: `/manager/support/${ticket._id}`,
            }).catch(err => console.error('[SupportNotification] Staff alert error:', err));
        }

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

            // Customers only see their own tickets
            if (userRole === 'customer') {
                filter.clientId = req.user._id;
            }

            // Managers see their own tickets AND tickets created by other staff
            if (userRole === 'manager') {
                filter.$or = [
                    { userId: req.user._id },
                    { creatorRole: { $in: ['stylist', 'receptionist', 'accountant', 'inventory_manager', 'customer'] } }
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

            // Managers see their own tickets OR tickets created by other staff OR tickets created by customers
            if (userRole === 'manager') {
                const isOwn = ticket.userId?._id?.toString() === req.user._id.toString();
                const isStaff = ['stylist', 'receptionist', 'accountant', 'inventory_manager'].includes(ticket.creatorRole?.toLowerCase());
                const isCustomer = ticket.creatorRole === 'customer';
                if (!isOwn && !isStaff && !isCustomer) {
                    return res.status(403).send({ success: false, message: 'Unauthorized' });
                }
            }

            // Customers only see their own tickets
            if (userRole === 'customer' && ticket.clientId?._id?.toString() !== req.user._id.toString()) {
                return res.status(403).send({ success: false, message: 'Unauthorized' });
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

        // Notify the appropriate parties
        const isStaffResponder = ['admin', 'superadmin', 'manager', 'receptionist', 'stylist', 'accountant', 'inventory_manager'].includes(userRole);
        
        if (isStaffResponder) {
            // Notify the customer if they are the ticket owner
            if (updatedTicket.clientId) {
                notificationService.sendNotification({
                    recipientId: updatedTicket.clientId._id || updatedTicket.clientId,
                    recipientType: 'client',
                    tenantId: updatedTicket.tenantId._id || updatedTicket.tenantId,
                    type: 'support_update',
                    title: 'Support Ticket Update',
                    body: `An expert has responded to your ticket: "${updatedTicket.subject}"`,
                    actionUrl: '/app/help-support',
                }).catch(err => console.error('[SupportNotification] Customer alert error:', err));
            }
        } else if (userRole === 'customer') {
            // Notify Managers
            notificationService.sendToRole(updatedTicket.tenantId._id || updatedTicket.tenantId, 'manager', {
                type: 'support_update',
                title: 'Customer Replied',
                body: `Customer ${req.user.name} replied to ticket: "${updatedTicket.subject}"`,
                actionUrl: `/manager/support/${updatedTicket._id}`,
            }).catch(err => console.error('[SupportNotification] Manager alert error:', err));
        }

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
