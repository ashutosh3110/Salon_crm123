// User Roles
export const ROLES = {
    SUPER_ADMIN: 'superadmin',
    ADMIN: 'admin',           // Salon Owner / Tenant Admin
    MANAGER: 'manager',
    RECEPTIONIST: 'receptionist',
    STYLIST: 'stylist',
    ACCOUNTANT: 'accountant',
    INVENTORY_MANAGER: 'inventory_manager',
    CUSTOMER: 'customer',
};

// Role display names
export const ROLE_LABELS = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.ADMIN]: 'Salon Owner',
    [ROLES.MANAGER]: 'Manager',
    [ROLES.RECEPTIONIST]: 'Receptionist',
    [ROLES.STYLIST]: 'Stylist',
    [ROLES.ACCOUNTANT]: 'Accountant',
    [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
    [ROLES.CUSTOMER]: 'Customer',
};

// Module access by role
export const MODULE_ACCESS = {
    dashboard: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.STYLIST, ROLES.ACCOUNTANT, ROLES.INVENTORY_MANAGER],
    clients: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.STYLIST],
    bookings: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.STYLIST],
    pos: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST],
    services: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.STYLIST],
    products: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.INVENTORY_MANAGER],
    inventory: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_MANAGER],
    suppliers: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.INVENTORY_MANAGER],
    finance: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT],
    hr: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT],
    marketing: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
    loyalty: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST],
    promotions: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST],
    membership: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST],
    feedback: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.STYLIST],
    analytics: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.INVENTORY_MANAGER],
    subscription: [ROLES.SUPER_ADMIN],
    settings: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    outlets: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
    users: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
    notifications: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.STYLIST, ROLES.ACCOUNTANT, ROLES.INVENTORY_MANAGER],
};

// Booking statuses
export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
};

// Payment methods
export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    UPI: 'upi',
    WALLET: 'wallet',
    SPLIT: 'split',
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
    FREE: 'free',
    BASIC: 'basic',
    PREMIUM: 'premium',
    ENTERPRISE: 'enterprise',
};

// Status colors for badges
export const STATUS_COLORS = {
    active: 'emerald',
    inactive: 'gray',
    pending: 'amber',
    completed: 'blue',
    cancelled: 'red',
    suspended: 'orange',
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SalonCRM';
