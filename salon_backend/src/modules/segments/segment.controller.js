import httpStatus from 'http-status-codes';
import Segment from './segment.model.js';
import segmentService from './segment.service.js';

const getSegments = async (req, res, next) => {
    try {
        const data = await segmentService.computeSegments(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const createSegment = async (req, res, next) => {
    try {
        const { name, rule, iconName, color } = req.body || {};
        const segment = await Segment.create({
            tenantId: req.tenantId,
            name,
            rule: rule || '',
            iconName: iconName || 'Zap',
            color: color || 'bg-blue-50 text-blue-600 border-blue-100',
            isCustom: true,
        });

        res.status(httpStatus.CREATED).send({
            success: true,
            data: {
                id: segment._id.toString(),
                name: segment.name,
                rule: segment.rule,
                iconName: segment.iconName,
                color: segment.color,
            },
        });
    } catch (error) {
        next(error);
    }
};

const deleteSegment = async (req, res, next) => {
    try {
        const { segmentId } = req.params;

        // Predefined segments are virtual (no deletion in DB).
        if (['vip', 'new', 'inactive'].includes(String(segmentId))) {
            return res.status(httpStatus.OK).send({ success: true });
        }

        await Segment.deleteOne({ tenantId: req.tenantId, _id: segmentId });
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

const getSegmentCustomers = async (req, res, next) => {
    try {
        const { segmentId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const customers = await segmentService.getCustomersForSegment(req.tenantId, segmentId, { limit });
        res.status(httpStatus.OK).send({ success: true, data: customers });
    } catch (error) {
        next(error);
    }
};

export default {
    getSegments,
    createSegment,
    deleteSegment,
    getSegmentCustomers,
};

