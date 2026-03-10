// ==========================================
// Customer App Mock Data
// Powered by JSON for clean architecture
// ==========================================

import customerData from './customerMockData.json';

// --- Re-exporting from JSON ---
export const MOCK_CUSTOMER = customerData.customer;
export const MOCK_SERVICES = customerData.services;
export const MOCK_STAFF = customerData.staff;
export const MOCK_OUTLETS = customerData.outlets;
export const MOCK_OUTLET = customerData.outlets[0];
export const MOCK_LOYALTY_WALLET = customerData.loyaltyWallet;
export const MOCK_LOYALTY_RULES = customerData.loyaltyRules;
export const MOCK_LOYALTY_TRANSACTIONS = customerData.loyaltyTransactions;
export const MOCK_REFERRALS = customerData.referrals;
export const MOCK_PROMOTIONS = customerData.promotions;
export const MOCK_PRODUCTS = customerData.products;

// --- Mock Bookings (Calculated for relative dates) ---
export const MOCK_BOOKINGS = [
    {
        _id: 'book-001',
        clientId: 'cust-001',
        serviceId: 'srv-001',
        staffId: 'staff-001',
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        status: 'confirmed',
        notes: '',
        price: 500,
        service: { name: 'Classic Haircut', category: 'Hair' },
        staff: { name: 'Anita Verma' },
    },
    {
        _id: 'book-002',
        clientId: 'cust-001',
        serviceId: 'srv-005',
        staffId: 'staff-002',
        appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        status: 'pending',
        notes: 'Sensitive skin — use gentle products',
        price: 1800,
        service: { name: 'Facial — Gold', category: 'Skin' },
        staff: { name: 'Ritu Kapoor' },
    },
    {
        _id: 'book-003',
        clientId: 'cust-001',
        serviceId: 'srv-008',
        staffId: 'staff-004',
        appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        status: 'completed',
        notes: '',
        price: 2000,
        service: { name: 'Full Body Massage', category: 'Spa' },
        staff: { name: 'Meera Joshi' },
    }
];

// --- Helper: Generate time slots from outlet working hours ---
export function generateTimeSlots(dayOfWeek, serviceDuration = 30, outlet = null) {
    const targetOutlet = outlet || MOCK_OUTLET;
    const dayHours = targetOutlet.workingHours?.find(d => d.day === dayOfWeek);

    // Fallback if working hours not found (common for outlets without explicit hours in mock)
    if (!dayHours || !dayHours.isOpen) {
        // Provide default 10 AM - 8 PM if not specified
        if (!dayHours) {
            const slots = [];
            for (let t = 600; t + serviceDuration <= 1200; t += 30) {
                const h = Math.floor(t / 60);
                const m = t % 60;
                const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                slots.push({ time: label, available: Math.random() > 0.2, isPast: false });
            }
            return slots;
        }
        return [];
    }

    const [openH, openM] = dayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const slots = [];
    for (let t = openMinutes; t + serviceDuration <= closeMinutes; t += 30) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        slots.push({
            time: label,
            available: Math.random() > 0.2,
            isPast: false,
        });
    }
    return slots;
}

// --- Constants ---
export const SERVICE_CATEGORIES = ['All', 'Hair', 'Skin', 'Nails', 'Spa'];
export const PRODUCT_CATEGORIES = [
    { _id: 'cat-1', name: 'Hair Care', icon: '💇‍♀️', img: 'https://images.unsplash.com/photo-1543873400-f96f9268f703?w=200&q=80', description: 'Shampoos, Oils, Serums & Masques', count: 42, color: 'bg-rose-50' },
    { _id: 'cat-2', name: 'Skin Care', icon: '✨', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80', description: 'Face creams, serums, and masks', count: 35, color: 'bg-blue-50' },
    { _id: 'cat-3', name: 'Makeup', icon: '💄', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&q=80', description: 'Face, Eyes, Lips and Nails', count: 28, color: 'bg-purple-50' },
    { _id: 'cat-4', name: 'Tools', icon: '🔌', img: 'https://images.unsplash.com/photo-1522338140262-f46f5912018a?w=200&q=80', description: 'Dryers, Straighteners, Trimmers', count: 15, color: 'bg-amber-50' },
    { _id: 'cat-5', name: 'Body Care', icon: '🧼', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80', description: 'Lotions, Body wash, Fragrances', count: 22, color: 'bg-emerald-50' },
];
