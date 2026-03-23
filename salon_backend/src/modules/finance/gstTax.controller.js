import httpStatus from 'http-status-codes';
import gstTaxService from './gstTax.service.js';

const getGstSummary = async (req, res, next) => {
    try {
        const data = await gstTaxService.getGstSummary(req.tenantId, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export default {
    getGstSummary,
};
