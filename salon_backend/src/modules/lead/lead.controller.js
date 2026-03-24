import httpStatus from 'http-status-codes';
import leadService from './lead.service.js';
import catchAsync from '../../utils/catchAsync.js';

const createLead = catchAsync(async (req, res) => {
    const lead = await leadService.createLead(req.body);
    res.status(httpStatus.CREATED).send({
        success: true,
        message: 'Inquiry submitted successfully',
        data: lead,
    });
});

const getLeads = catchAsync(async (req, res) => {
    const filter = {
        status: req.query.status && req.query.status !== 'all' ? req.query.status : undefined,
        search: req.query.search,
    };
    const options = {
        page: req.query.page,
        limit: req.query.limit,
    };
    const result = await leadService.queryLeads(filter, options);
    res.send({
        success: true,
        data: result,
    });
});

const updateLead = catchAsync(async (req, res) => {
    const lead = await leadService.updateLeadById(req.params.leadId, req.body);
    if (!lead) {
        return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Inquiry not found' });
    }
    res.send({
        success: true,
        message: 'Inquiry updated successfully',
        data: lead,
    });
});

const deleteLead = catchAsync(async (req, res) => {
    const lead = await leadService.deleteLeadById(req.params.leadId);
    if (!lead) {
        return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Inquiry not found' });
    }
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    createLead,
    getLeads,
    updateLead,
    deleteLead,
};
