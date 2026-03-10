/**
 * POS Mock Data
 * Powered by JSON for clean architecture
 */

import posData from './posMockData.json';

export const MOCK_SERVICES = posData.services;
export const MOCK_PRODUCTS = posData.products;
export const MOCK_CLIENTS = posData.clients;
export const MOCK_OUTLETS = posData.outlets;
export const MOCK_STAFF = posData.staff;
export const MOCK_PROMOTIONS = posData.promotions;
export const MOCK_VOUCHERS = posData.vouchers;
export const MOCK_APPOINTMENTS = posData.appointments;

// --- Mock Invoices with dynamic dates ---
export const MOCK_INVOICES = posData.invoices.map(inv => ({
    ...inv,
    createdAt: new Date().toISOString()
}));

export const MOCK_SETTINGS = posData.settings;
