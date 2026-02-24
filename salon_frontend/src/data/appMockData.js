// ==========================================
// Customer App Mock Data
// Structured to match backend models exactly
// TODO: Replace each section with real API calls
// ==========================================

// --- Mock Customer Profile (matches Client model) ---
export const MOCK_CUSTOMER = {
    _id: 'cust-001',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543210',
    gender: 'female',
    birthday: '1995-06-15',
    loyaltyPoints: 320,
    role: 'customer',
};

// --- Mock Services (matches Service model) ---
export const MOCK_SERVICES = [
    { _id: 'srv-001', name: 'Classic Haircut', description: 'Precision cut with wash & style finish', price: 500, duration: 45, category: 'Hair', status: 'active' },
    { _id: 'srv-002', name: 'Hair Coloring', description: 'Full head premium color with ammonia-free products', price: 2500, duration: 120, category: 'Hair', status: 'active' },
    { _id: 'srv-003', name: 'Keratin Treatment', description: 'Deep keratin smoothing for frizz-free hair', price: 4500, duration: 180, category: 'Hair', status: 'active' },
    { _id: 'srv-004', name: 'Bridal Makeup', description: 'HD bridal makeup with airbrush finish', price: 8000, duration: 150, category: 'Skin', status: 'active' },
    { _id: 'srv-005', name: 'Facial — Gold', description: 'Luxurious gold facial for radiant glow', price: 1800, duration: 60, category: 'Skin', status: 'active' },
    { _id: 'srv-006', name: 'Manicure Deluxe', description: 'Spa manicure with paraffin wax treatment', price: 800, duration: 45, category: 'Nails', status: 'active' },
    { _id: 'srv-007', name: 'Pedicure Deluxe', description: 'Relaxing spa pedicure with scrub & massage', price: 1000, duration: 60, category: 'Nails', status: 'active' },
    { _id: 'srv-008', name: 'Full Body Massage', description: '60-minute deep tissue relaxation massage', price: 2000, duration: 60, category: 'Spa', status: 'active' },
    { _id: 'srv-009', name: 'Aroma Therapy', description: 'Essential oils aromatherapy with hot stones', price: 2800, duration: 90, category: 'Spa', status: 'active' },
    { _id: 'srv-010', name: 'Threading — Full Face', description: 'Eyebrow, upper lip, forehead & chin threading', price: 250, duration: 20, category: 'Skin', status: 'active' },
    { _id: 'srv-011', name: 'Hair Spa', description: 'Deep conditioning spa treatment for damaged hair', price: 1500, duration: 60, category: 'Hair', status: 'active' },
    { _id: 'srv-012', name: 'Nail Art', description: 'Custom nail art with gel polish', price: 1200, duration: 60, category: 'Nails', status: 'active' },
];

// --- Mock Staff (matches User model) ---
export const MOCK_STAFF = [
    { _id: 'staff-001', name: 'Anita Verma', role: 'stylist', specialization: 'Hair' },
    { _id: 'staff-002', name: 'Ritu Kapoor', role: 'stylist', specialization: 'Skin' },
    { _id: 'staff-003', name: 'Deepa Nair', role: 'stylist', specialization: 'Nails' },
    { _id: 'staff-004', name: 'Meera Joshi', role: 'stylist', specialization: 'Spa' },
    { _id: 'staff-005', name: 'Kavita Singh', role: 'stylist', specialization: 'Hair' },
];

// --- Mock Outlet (matches Outlet model) ---
export const MOCK_OUTLET = {
    _id: 'outlet-001',
    name: 'Glamour Studio — Koramangala',
    address: '1st Block, Koramangala, Bangalore 560034',
    phone: '080-12345678',
    isMain: true,
    status: 'active',
    workingHours: [
        { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
        { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
        { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
        { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
        { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
        { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
        { day: 'Sunday', isOpen: false, openTime: '', closeTime: '' },
    ],
};

// --- Mock Bookings (matches Booking model) ---
export const MOCK_BOOKINGS = [
    {
        _id: 'book-001',
        clientId: 'cust-001',
        serviceId: 'srv-001',
        staffId: 'staff-001',
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        duration: 45,
        status: 'confirmed',
        notes: '',
        price: 500,
        // Populated refs (for display):
        service: { name: 'Classic Haircut', category: 'Hair' },
        staff: { name: 'Anita Verma' },
    },
    {
        _id: 'book-002',
        clientId: 'cust-001',
        serviceId: 'srv-005',
        staffId: 'staff-002',
        appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
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
        appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        duration: 60,
        status: 'completed',
        notes: '',
        price: 2000,
        service: { name: 'Full Body Massage', category: 'Spa' },
        staff: { name: 'Meera Joshi' },
    },
    {
        _id: 'book-004',
        clientId: 'cust-001',
        serviceId: 'srv-002',
        staffId: 'staff-005',
        appointmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        duration: 120,
        status: 'completed',
        notes: '',
        price: 2500,
        service: { name: 'Hair Coloring', category: 'Hair' },
        staff: { name: 'Kavita Singh' },
    },
    {
        _id: 'book-005',
        clientId: 'cust-001',
        serviceId: 'srv-006',
        staffId: 'staff-003',
        appointmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        duration: 45,
        status: 'cancelled',
        notes: 'Customer requested cancellation',
        price: 800,
        service: { name: 'Manicure Deluxe', category: 'Nails' },
        staff: { name: 'Deepa Nair' },
    },
];

// --- Mock Loyalty Wallet (matches LoyaltyWallet model) ---
export const MOCK_LOYALTY_WALLET = {
    _id: 'wallet-001',
    customerId: 'cust-001',
    totalPoints: 320,
};

// --- Mock Loyalty Rules (matches LoyaltyRule model) ---
export const MOCK_LOYALTY_RULES = {
    _id: 'rule-001',
    earnRate: 1,           // 1 point per ₹1 spent
    redeemRate: 0.5,       // ₹0.50 per point
    minRedeemPoints: 100,
    maxEarnPerInvoice: 500,
    expiryDays: 365,
    isActive: true,
};

// --- Mock Loyalty Transactions (matches LoyaltyTransaction model) ---
export const MOCK_LOYALTY_TRANSACTIONS = [
    { _id: 'lt-001', customerId: 'cust-001', type: 'EARN', points: 120, invoiceId: 'inv-001', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), metadata: { serviceName: 'Full Body Massage' } },
    { _id: 'lt-002', customerId: 'cust-001', type: 'EARN', points: 250, invoiceId: 'inv-002', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), metadata: { serviceName: 'Hair Coloring' } },
    { _id: 'lt-003', customerId: 'cust-001', type: 'REDEEM', points: -100, invoiceId: 'inv-003', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), metadata: { redeemedFor: '₹50 discount' } },
    { _id: 'lt-004', customerId: 'cust-001', type: 'EARN', points: 50, referenceId: 'ref-001', createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), metadata: { source: 'Referral bonus' } },
];

// --- Mock Referrals (matches Referral model) ---
export const MOCK_REFERRALS = [
    { _id: 'ref-001', referrerCustomerId: 'cust-001', referredCustomerId: 'cust-010', rewardPoints: 50, status: 'COMPLETED', rewardedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), referredName: 'Sneha Patel' },
    { _id: 'ref-002', referrerCustomerId: 'cust-001', referredCustomerId: 'cust-011', rewardPoints: 50, status: 'PENDING', rewardedAt: null, referredName: 'Aisha Khan' },
    { _id: 'ref-003', referrerCustomerId: 'cust-001', referredCustomerId: 'cust-012', rewardPoints: 50, status: 'COMPLETED', rewardedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), referredName: 'Neha Gupta' },
];

// --- Mock Promotions (matches Promotion model) ---
export const MOCK_PROMOTIONS = [
    {
        _id: 'promo-001',
        name: '20% Off First Visit',
        description: 'Get 20% off on your very first booking!',
        type: 'PERCENTAGE',
        value: 20,
        maxDiscountAmount: 500,
        minBillAmount: 500,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        targetingType: 'NEW',
        activationMode: 'AUTO',
    },
    {
        _id: 'promo-002',
        name: 'Spa Weekend',
        description: 'Flat ₹300 off on all Spa services this weekend!',
        type: 'FLAT',
        value: 300,
        minBillAmount: 1000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        targetingType: 'ALL',
        activationMode: 'COUPON',
        couponCode: 'SPAWEEKEND',
    },
];

// --- Helper: Generate time slots from outlet working hours ---
export function generateTimeSlots(dayOfWeek, serviceDuration = 30) {
    const dayHours = MOCK_OUTLET.workingHours.find(d => d.day === dayOfWeek);
    if (!dayHours || !dayHours.isOpen) return [];

    const [openH, openM] = dayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const slots = [];
    for (let t = openMinutes; t + serviceDuration <= closeMinutes; t += 30) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const isPast = false; // TODO: compare with current time for today
        slots.push({
            time: label,
            available: Math.random() > 0.2, // 80% chance available (mock)
            isPast,
        });
    }
    return slots;
}

// --- Service Categories ---
export const SERVICE_CATEGORIES = ['All', 'Hair', 'Skin', 'Nails', 'Spa'];

// --- Mock Products (matches Product model) ---
export const MOCK_PRODUCTS = [
    { _id: 'prod-001', name: 'L\'Oréal Professional Shampoo', description: 'Deep nourishing shampoo for dry and damaged hair.', price: 850, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop', category: 'Hair Care', brand: 'L\'Oréal', rating: 4.8, reviews: 124 },
    { _id: 'prod-002', name: 'Moroccan Argan Oil', description: 'Premium cold-pressed argan oil for hair and skin.', price: 1200, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop', category: 'Hair Care', brand: 'Pure Organics', rating: 4.9, reviews: 89 },
    { _id: 'prod-003', name: 'Vitamin C Face Cream', description: 'Brightening face cream with pure Vitamin C and Hyaluronic acid.', price: 1500, image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=400&h=400&fit=crop', category: 'Skin Care', brand: 'DermaX', rating: 4.7, reviews: 256 },
    { _id: 'prod-004', name: 'Professional Hair Dryer', description: 'High-speed ionic hair dryer for salon-like finish at home.', price: 4500, image: 'https://images.unsplash.com/photo-1522338140262-f46f5912018a?w=400&h=400&fit=crop', category: 'Tools', brand: 'Philips', rating: 4.5, reviews: 540 },
    { _id: 'prod-005', name: 'Matte Liquid Lipstick', description: 'Long-stay waterproof matte lipstick in 12 shades.', price: 950, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', category: 'Makeup', brand: 'MAC', rating: 4.6, reviews: 110 },
    { _id: 'prod-006', name: 'Dead Sea Mud Mask', description: 'Detoxifying mud mask for deep pore cleansing.', price: 1800, image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop', category: 'Skin Care', brand: 'NaturalSpa', rating: 4.8, reviews: 75 },
    { _id: 'prod-007', name: 'Ceramic Hair Straightener', description: 'Advanced ceramic plates for smooth, frizz-free hair.', price: 3800, image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400&h=400&fit=crop', category: 'Tools', brand: 'Braun', rating: 4.4, reviews: 320 },
    { _id: 'prod-008', name: 'Organic Body Wash', description: 'Lavender and tea tree infused organic body wash.', price: 650, image: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=400&h=400&fit=crop', category: 'Body Care', brand: 'BodyShop', rating: 4.7, reviews: 412 },
];

export const PRODUCT_CATEGORIES = [
    { _id: 'cat-1', name: 'Hair Care', icon: '💇‍♀️', description: 'Shampoos, Oils, Serums & Masques', count: 42, color: 'bg-rose-50' },
    { _id: 'cat-2', name: 'Skin Care', icon: '✨', description: 'Face creams, serums, and masks', count: 35, color: 'bg-blue-50' },
    { _id: 'cat-3', name: 'Makeup', icon: '💄', description: 'Face, Eyes, Lips and Nails', count: 28, color: 'bg-purple-50' },
    { _id: 'cat-4', name: 'Tools', icon: '🔌', description: 'Dryers, Straighteners, Trimmers', count: 15, color: 'bg-amber-50' },
    { _id: 'cat-5', name: 'Body Care', icon: '🧼', description: 'Lotions, Body wash, Fragrances', count: 22, color: 'bg-emerald-50' },
];
