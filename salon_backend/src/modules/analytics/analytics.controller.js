import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync.js';
import analyticsService from './analytics.service.js';

const getStats = catchAsync(async (req, res) => {
    const stats = await analyticsService.getAnalyticsStats();
    res.status(StatusCodes.OK).send(stats);
});

export default {
    getStats
};
