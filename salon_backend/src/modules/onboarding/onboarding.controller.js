import httpStatus from 'http-status-codes';
import onboardingService from './onboarding.service.js';

const getStatus = async (req, res, next) => {
    try {
        const status = await onboardingService.getStatus(req.tenantId, req.user);
        res.send(status);
    } catch (error) {
        next(error);
    }
};

const confirmSalon = async (req, res, next) => {
    try {
        const tenant = await onboardingService.confirmSalonDetails(req.tenantId, req.body);
        res.send({
            success: true,
            message: 'Salon details confirmed',
            data: { onboardingStep: tenant.onboardingStep }
        });
    } catch (error) {
        next(error);
    }
};

const createOutlet = async (req, res, next) => {
    try {
        const outlet = await onboardingService.createInitialOutlet(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send({
            success: true,
            message: 'Outlet created successfully',
            data: { outlet, onboardingStep: 'OUTLET_CREATED' }
        });
    } catch (error) {
        next(error);
    }
};

const addStaff = async (req, res, next) => {
    try {
        const staff = await onboardingService.addInitialStaff(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send({
            success: true,
            message: 'First staff member added',
            data: { staff, onboardingStep: 'STAFF_ADDED' }
        });
    } catch (error) {
        next(error);
    }
};

const complete = async (req, res, next) => {
    try {
        const result = await onboardingService.completeOnboarding(req.tenantId, req.user._id);
        res.send({
            success: true,
            message: 'Onboarding completed successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getStatus,
    confirmSalon,
    createOutlet,
    addStaff,
    complete,
};
