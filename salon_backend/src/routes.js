import express from 'express';
import authRoute from './modules/auth/auth.routes.js';
import tenantRoute from './modules/tenant/tenant.routes.js';
import posRoute from './modules/pos/pos.routes.js';
import clientRoute from './modules/client/client.routes.js';
import productRoute from './modules/product/product.routes.js';
import serviceRoute from './modules/service/service.routes.js';
import loyaltyRoute from './modules/loyalty/loyalty.routes.js';
import promotionRoute from './modules/promotion/promotion.routes.js';
import onboardingRoute from './modules/onboarding/onboarding.routes.js';
import outletRoute from './modules/outlet/outlet.routes.js';
import userRoute from './modules/user/user.routes.js';
import bookingRoute from './modules/booking/booking.routes.js';
import inventoryRoute from './modules/inventory/inventory.routes.js';
import invoiceRoute from './modules/invoice/invoice.routes.js';
import onboardingGuard from './middlewares/onboardingGuard.js';

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/tenants',
        route: tenantRoute,
    },
    {
        path: '/onboarding',
        route: onboardingRoute,
    },
];

const protectedRoutes = [
    {
        path: '/pos',
        route: posRoute,
    },
    {
        path: '/inventory',
        route: inventoryRoute,
    },
    {
        path: '/clients',
        route: clientRoute,
    },
    {
        path: '/products',
        route: productRoute,
    },
    {
        path: '/services',
        route: serviceRoute,
    },
    {
        path: '/loyalty',
        route: loyaltyRoute,
    },
    {
        path: '/promotions',
        route: promotionRoute,
    },
    {
        path: '/outlets',
        route: outletRoute,
    },
    {
        path: '/users',
        route: userRoute,
    },
    {
        path: '/bookings',
        route: bookingRoute,
    },
    {
        path: '/invoices',
        route: invoiceRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

protectedRoutes.forEach((route) => {
    router.use(route.path, onboardingGuard, route.route);
});

export default router;
