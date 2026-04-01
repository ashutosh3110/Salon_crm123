import express from 'express';
import authRoute from './modules/auth/auth.routes.js';
import tenantRoute from './modules/tenant/tenant.routes.js';
import posRoute from './modules/pos/pos.routes.js';
import clientRoute from './modules/client/client.routes.js';
import productRoute from './modules/product/product.routes.js';
import serviceRoute from './modules/service/service.routes.js';
import loyaltyRoute from './modules/loyalty/loyalty.routes.js';
import promotionRoute from './modules/promotion/promotion.routes.js';
import outletRoute from './modules/outlet/outlet.routes.js';
import userRoute from './modules/user/user.routes.js';
import bookingRoute from './modules/booking/booking.routes.js';
import inventoryRoute from './modules/inventory/inventory.routes.js';
import invoiceRoute from './modules/invoice/invoice.routes.js';
import catalogueRoute from './modules/catalogue/catalogue.routes.js';
import subscriptionRoute from './modules/subscription/subscription.routes.js';
import billingRoute from './modules/billing/billing.routes.js';
import analyticsRoute from './modules/analytics/analytics.routes.js';
import cmsRoute from './modules/cms/cms.routes.js';
import blogRoute from './modules/blog/blog.routes.js';
import marketingRoute from './modules/marketing/marketing.routes.js';
import inquiryRoute from './modules/inquiry/inquiry.routes.js';
import reminderLinkRoute from './modules/reminderLink/reminderLink.routes.js';
// import onboardingGuard from './middlewares/onboardingGuard.js';
import geocodeRoute from './modules/geocode/geocode.routes.js';
import segmentsRoute from './modules/segments/segment.routes.js';
import feedbackRoutes from './modules/feedback/feedback.routes.js';
import shopCategoryRoute from './modules/shopCategory/shopCategory.routes.js';
import supplierRoute from './modules/supplier/supplier.routes.js';
import financeRoute from './modules/finance/finance.routes.js';
import attendanceRoute from './modules/attendance/attendance.routes.js';
import shiftRoute from './modules/shift/shift.routes.js';
import payrollRoute from './modules/payroll/payroll.routes.js';
import hrPerformanceRoute from './modules/hrPerformance/hrPerformance.routes.js';
import dashboardRoute from './modules/dashboard/dashboard.routes.js';
import stylistRoute from './modules/stylist/stylist.routes.js';
import leadRoute from './modules/lead/lead.routes.js';
import notificationRoute from './modules/notification/notification.routes.js';
import supportRoute from './modules/support/support.routes.js';

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/geocode',
        route: geocodeRoute,
    },
    {
        path: '/tenants',
        route: tenantRoute,
    },

    {
        path: '/catalogue',
        route: catalogueRoute,
    },
    {
        path: '/subscriptions',
        route: subscriptionRoute,
    },
    {
        path: '/billing',
        route: billingRoute,
    },
    {
        path: '/analytics',
        route: analyticsRoute,
    },
    {
        path: '/cms',
        route: cmsRoute,
    },
    {
        path: '/blogs',
        route: blogRoute,
    },
    {
        path: '/shop-categories',
        route: shopCategoryRoute,
    },
    {
        path: '/inventory',
        route: inventoryRoute,
    },
];

const protectedRoutes = [
    {
        path: '/pos',
        route: posRoute,
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
    {
        path: '/marketing',
        route: marketingRoute,
    },
    {
        path: '/inquiries',
        route: inquiryRoute,
    },
    {
        path: '/reminders-links',
        route: reminderLinkRoute,
    },
    {
        path: '/segments',
        route: segmentsRoute,
    },
    {
        path: '/feedbacks',
        route: feedbackRoutes,
    },
    {
        path: '/suppliers',
        route: supplierRoute,
    },
    {
        path: '/finance',
        route: financeRoute,
    },
    {
        path: '/attendance',
        route: attendanceRoute,
    },
    {
        path: '/shifts',
        route: shiftRoute,
    },
    {
        path: '/payroll',
        route: payrollRoute,
    },
    {
        path: '/hr-performance',
        route: hrPerformanceRoute,
    },
    {
        path: '/dashboard',
        route: dashboardRoute,
    },
    {
        path: '/stylist',
        route: stylistRoute,
    },
    {
        path: '/leads',
        route: leadRoute,
    },
    {
        path: '/notifications',
        route: notificationRoute,
    },
    {
        path: '/support',
        route: supportRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

protectedRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
