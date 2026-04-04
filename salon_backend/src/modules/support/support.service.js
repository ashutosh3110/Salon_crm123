import SupportTicket from './support.model.js';

/**
 * Create a new support ticket
 */
const createTicket = async (ticketBody) => {
    return SupportTicket.create(ticketBody);
};

/**
 * Get tickets with filtering and pagination
 */
const queryTickets = async (filter, options) => {
    return SupportTicket.find(filter)
        .sort(options.sortBy || { createdAt: -1 })
        .skip(options.skip || 0)
        .limit(options.limit || 10)
        .populate('userId', 'name email role')
        .populate('clientId', 'name email phone')
        .populate('tenantId', 'name');
};

/**
 * Get ticket by id
 */
const getTicketById = async (id) => {
    return SupportTicket.findById(id)
        .populate('userId', 'name email role')
        .populate('clientId', 'name email phone')
        .populate('tenantId', 'name')
        .populate('responses.userId', 'name email role');
};

/**
 * Update ticket
 */
const updateTicketById = async (ticketId, updateBody) => {
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    Object.assign(ticket, updateBody);
    await ticket.save();
    return ticket;
};

/**
 * Add response to a ticket
 */
const addResponse = async (ticketId, responseBody) => {
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    ticket.responses.push(responseBody);
    await ticket.save();
    return ticket;
};

/**
 * Delete ticket
 */
const deleteTicketById = async (ticketId) => {
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    await ticket.remove();
    return ticket;
};

export default {
    createTicket,
    queryTickets,
    getTicketById,
    updateTicketById,
    addResponse,
    deleteTicketById,
};
