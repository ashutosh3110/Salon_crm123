import httpStatus from 'http-status-codes';

/**
 * Middleware to ensure admin has completed onboarding before accessing certain routes.
 */
const onboardingGuard = async (req, res, next) => {
    // Only apply to Admins/Owners
    if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
        if (req.user.onboardingStatus !== 'COMPLETED') {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                errorCode: 'ONBOARDING_REQUIRED',
                message: 'Please complete the onboarding setup to access the dashboard.',
                onboardingStatus: req.user.onboardingStatus,
            });
        }
    }
    next();
};

export default onboardingGuard;
