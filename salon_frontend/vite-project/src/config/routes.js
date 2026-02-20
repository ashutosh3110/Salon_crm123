// Centralized route path constants
export const ROUTES = {
    // Auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_OTP: '/verify-otp',

    // Onboarding
    ONBOARDING: '/app/onboarding',

    // Dashboard
    DASHBOARD: '/app/dashboard',

    // Clients / CRM
    CLIENTS: '/app/clients',
    CLIENT_DETAIL: '/app/clients/:id',
    CLIENT_SEGMENTS: '/app/clients/segments',

    // Bookings
    BOOKINGS: '/app/bookings',
    BOOKING_CALENDAR: '/app/bookings/calendar',
    WALK_IN_QUEUE: '/app/bookings/walk-in',

    // POS
    POS: '/app/pos',
    BILL_HISTORY: '/app/pos/history',

    // Services
    SERVICES: '/app/services',
    SERVICE_CATEGORIES: '/app/services/categories',

    // Products
    PRODUCTS: '/app/products',
    PRODUCT_DETAIL: '/app/products/:id',
    PRODUCT_CATEGORIES: '/app/products/categories',

    // Inventory
    INVENTORY: '/app/inventory',
    STOCK_MOVEMENTS: '/app/inventory/movements',
    INVENTORY_AUDIT: '/app/inventory/audit',

    // Suppliers
    SUPPLIERS: '/app/suppliers',
    SUPPLIER_DETAIL: '/app/suppliers/:id',
    PURCHASE_ORDERS: '/app/suppliers/orders',

    // Finance
    FINANCE: '/app/finance',
    EXPENSES: '/app/finance/expenses',
    CASH_REGISTER: '/app/finance/cash-register',
    RECONCILIATION: '/app/finance/reconciliation',

    // HR
    EMPLOYEES: '/app/hr/employees',
    EMPLOYEE_DETAIL: '/app/hr/employees/:id',
    ATTENDANCE: '/app/hr/attendance',
    SHIFTS: '/app/hr/shifts',
    PAYROLL: '/app/hr/payroll',

    // Loyalty
    LOYALTY: '/app/loyalty',
    REFERRALS: '/app/loyalty/referrals',
    LOYALTY_TRANSACTIONS: '/app/loyalty/transactions',

    // Promotions
    PROMOTIONS: '/app/promotions',
    PACKAGE_BUILDER: '/app/promotions/packages',

    // Marketing
    CAMPAIGNS: '/app/marketing/campaigns',
    CAMPAIGN_BUILDER: '/app/marketing/create',
    TEMPLATES: '/app/marketing/templates',

    // Membership
    MEMBERSHIPS: '/app/memberships',
    MEMBERSHIP_DETAIL: '/app/memberships/:id',

    // Feedback
    FEEDBACK: '/app/feedback',

    // Analytics
    ANALYTICS: '/app/analytics',
    REVENUE_REPORT: '/app/analytics/revenue',
    OUTLET_ANALYTICS: '/app/analytics/outlets',
    EMPLOYEE_ANALYTICS: '/app/analytics/employees',
    CLIENT_ANALYTICS: '/app/analytics/clients',
    ITEM_SALES: '/app/analytics/items',

    // Subscription (Super Admin)
    SUBSCRIPTIONS: '/app/subscriptions',
    PLAN_BUILDER: '/app/subscriptions/plans',
    TENANT_SUBSCRIPTIONS: '/app/subscriptions/tenants',

    // Outlets
    OUTLETS: '/app/outlets',
    OUTLET_DETAIL: '/app/outlets/:id',

    // Users
    USERS: '/app/users',

    // Notifications
    NOTIFICATIONS: '/app/notifications',

    // Settings
    SETTINGS: '/app/settings',
    SETTINGS_GENERAL: '/app/settings/general',
    SETTINGS_BRANDING: '/app/settings/branding',
    SETTINGS_TAX: '/app/settings/tax',
    SETTINGS_PAYMENT: '/app/settings/payment',
    SETTINGS_INTEGRATIONS: '/app/settings/integrations',
};
