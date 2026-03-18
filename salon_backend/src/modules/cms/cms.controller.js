import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync.js';
import cmsService from './cms.service.js';

const getCMSData = catchAsync(async (req, res) => {
    const data = await cmsService.getAllCMSData();
    res.status(StatusCodes.OK).send(data);
});

const updateCMSSection = catchAsync(async (req, res) => {
    const { section } = req.params;
    const { content } = req.body;
    const updated = await cmsService.updateSection(section, content);
    res.status(StatusCodes.OK).send(updated);
});

export default {
    getCMSData,
    updateCMSSection,
};
