import httpStatus from 'http-status-codes';
import authService from './auth.service.js';
import tokenService from './token.service.js';

const register = async (req, res, next) => {
    try {
        const { user } = await authService.registerSalonOwner(req.body);
        const tokens = await tokenService.generateAuthTokens(user);

        res.status(httpStatus.CREATED).send({
            success: true,
            message: 'Registration successful',
            data: {
                accessToken: tokens.access.token,
                refreshToken: tokens.refresh.token,
                user: {
                    userId: user._id,
                    tenantId: user.tenantId,
                    role: user.role,
                    onboardingStatus: user.onboardingStatus,
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUserWithEmailAndPassword(email, password);
        const tokens = await tokenService.generateAuthTokens(user);

        res.send({
            success: true,
            message: 'Login successful',
            data: {
                accessToken: tokens.access.token,
                refreshToken: tokens.refresh.token, // Including refresh token for robustness
                user: {
                    userId: user._id,
                    tenantId: user.tenantId,
                    role: user.role,
                    onboardingStatus: user.onboardingStatus,
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const requestOtp = async (req, res, next) => {
    try {
        const { phone, tenantId } = req.body;
        const result = await authService.requestOtp(phone, tenantId);
        res.send(result);
    } catch (error) {
        console.error('[AUTH] Request OTP Error:', error);
        next(error);
    }
};

const loginWithOtp = async (req, res, next) => {
    try {
        const { phone, tenantId, otp } = req.body;
        const client = await authService.loginWithOtp(phone, tenantId, otp);

        // Use token service to generate tokens (ensure it works with client object)
        const tokens = await tokenService.generateAuthTokens(client);

        res.send({
            success: true,
            message: 'OTP login successful',
            data: {
                accessToken: tokens.access.token,
                refreshToken: tokens.refresh.token,
                user: {
                    userId: client._id,
                    tenantId: client.tenantId,
                    role: 'customer', // Default role for OTP logins
                }
            }
        });
    } catch (error) {
        console.error('[AUTH] Login with OTP Error:', error);
        next(error);
    }
};

export default {
    register,
    login,
    requestOtp,
    loginWithOtp,
};
