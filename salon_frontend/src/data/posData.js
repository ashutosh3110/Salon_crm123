/**
 * POS Mock Data
 * Structured to match backend API models exactly.
 */

export const MOCK_SERVICES = [
    { _id: 's1', name: 'Haircut – Men', price: 400, duration: 30, category: 'Hair', status: 'active', commission: 20 },
    { _id: 's2', name: 'Haircut – Women', price: 600, duration: 45, category: 'Hair', status: 'active', commission: 20 },
    { _id: 's3', name: 'Hair Coloring', price: 2500, duration: 90, category: 'Hair', status: 'active', commission: 15 },
    { _id: 's4', name: 'Keratin Treatment', price: 5000, duration: 120, category: 'Hair', status: 'active', commission: 10 },
    { _id: 's5', name: 'Hair Spa', price: 1200, duration: 60, category: 'Hair', status: 'active', commission: 20 },
    { _id: 's6', name: 'Blow Dry & Styling', price: 500, duration: 30, category: 'Hair', status: 'active', commission: 25 },
    { _id: 's7', name: 'Classic Facial', price: 800, duration: 45, category: 'Skin', status: 'active', commission: 25 },
    { _id: 's8', name: 'Gold Facial', price: 1500, duration: 60, category: 'Skin', status: 'active', commission: 20 },
    { _id: 's9', name: 'Cleanup', price: 500, duration: 30, category: 'Skin', status: 'active', commission: 30 },
    { _id: 's10', name: 'Manicure', price: 350, duration: 30, category: 'Nails', status: 'active', commission: 30 },
    { _id: 's11', name: 'Pedicure', price: 450, duration: 40, category: 'Nails', status: 'active', commission: 30 },
    { _id: 's12', name: 'Gel Nails', price: 1200, duration: 60, category: 'Nails', status: 'active', commission: 15 },
    { _id: 's13', name: 'Full Body Wax', price: 2000, duration: 60, category: 'Waxing', status: 'active', commission: 25 },
    { _id: 's14', name: 'Half Arms Wax', price: 300, duration: 15, category: 'Waxing', status: 'active', commission: 35 },
    { _id: 's15', name: 'Eyebrow Threading', price: 50, duration: 10, category: 'Threading', status: 'active', commission: 40 },
    { _id: 's16', name: 'Upper Lip Threading', price: 30, duration: 5, category: 'Threading', status: 'active', commission: 40 },
    { _id: 's17', name: 'Bridal Makeup', price: 8000, duration: 120, category: 'Makeup', status: 'active', commission: 10 },
    { _id: 's18', name: 'Party Makeup', price: 3000, duration: 60, category: 'Makeup', status: 'active', commission: 15 },
];

export const MOCK_PRODUCTS = [
    { _id: 'p1', name: 'L\'Oréal Hair Serum', sku: 'LOR-SRM-001', price: 650, category: 'Hair Care', status: 'active', stock: 12, lowStockLevel: 5 },
    { _id: 'p2', name: 'Moroccan Argan Oil', sku: 'MAO-OIL-001', price: 950, category: 'Hair Care', status: 'active', stock: 2, lowStockLevel: 5 },
    { _id: 'p3', name: 'Keratin Shampoo', sku: 'KRT-SHP-001', price: 480, category: 'Hair Care', status: 'active', stock: 15, lowStockLevel: 5 },
    { _id: 'p4', name: 'Anti-Dandruff Shampoo', sku: 'ADS-SHP-001', price: 320, category: 'Hair Care', status: 'active', stock: 3, lowStockLevel: 5 },
    { _id: 'p5', name: 'Vitamin C Face Serum', sku: 'VTC-SRM-001', price: 890, category: 'Skin Care', status: 'active', stock: 8, lowStockLevel: 5 },
    { _id: 'p6', name: 'Sunscreen SPF 50+', sku: 'SUN-SCR-001', price: 550, category: 'Skin Care', status: 'active', stock: 20, lowStockLevel: 5 },
    { _id: 'p10', name: 'Hair Styling Gel', sku: 'HSG-GEL-001', price: 280, category: 'Styling', status: 'active', stock: 1, lowStockLevel: 3 },
];

export const MOCK_CLIENTS = [
    {
        _id: 'c1', name: 'Aman Verma', phone: '9876543210', email: 'aman@gmail.com', gender: 'male',
        loyaltyPoints: 450, walletBalance: 1200,
        packages: [{ name: 'Hair Spa Combo', sessionsLeft: 2, totalSessions: 5 }],
        history: [{ date: '2026-02-10', total: 1062, items: 'Haircut, Cleanup' }]
    },
    {
        _id: 'c2', name: 'Sonal Jha', phone: '9876543211', email: 'sonal@gmail.com', gender: 'female',
        loyaltyPoints: 120, walletBalance: 0,
        packages: [],
        history: [{ date: '2026-02-15', total: 3402, items: 'Hair Coloring' }]
    },
    { _id: 'c4', name: 'Deepika Sharma', phone: '9876543213', email: 'deepika@gmail.com', gender: 'female', loyaltyPoints: 890, walletBalance: 500, packages: [], history: [] },
];

export const MOCK_OUTLETS = [
    { _id: 'o1', name: 'Downtown Studio', address: '123 MG Road, Mumbai', phone: '022-1234567', status: 'active', isMain: true },
    { _id: 'o2', name: 'Bandra Branch', address: '45 Hill Road, Bandra', phone: '022-2345678', status: 'active', isMain: false },
];

export const MOCK_STAFF = [
    { _id: 'u1', name: 'Ravi Sharma', role: 'stylist', specialty: 'Hair' },
    { _id: 'u2', name: 'Neha Gupta', role: 'stylist', specialty: 'Skin' },
    { _id: 'u3', name: 'Amit Patel', role: 'stylist', specialty: 'Nails' },
    { _id: 'u4', name: 'Meera Singh', role: 'stylist', specialty: 'Hair' },
];

export const MOCK_PROMOTIONS = [
    { _id: 'pr1', name: 'First Visit – 10% Off', discountType: 'percentage', discountValue: 10 },
    { _id: 'pr2', name: 'Flat ₹200 Off (Above ₹1500)', discountType: 'fixed', discountValue: 200 },
];

export const MOCK_APPOINTMENTS = [
    { _id: 'a1', clientName: 'Aman Verma', phone: '9876543210', time: '14:30', service: 'Haircut', status: 'confirmed' },
    { _id: 'a2', clientName: 'Sonal Jha', phone: '9876543211', time: '16:00', service: 'Facial', status: 'pending' },
    { _id: 'a3', clientName: 'Unknown Walk-in', phone: '9123456789', time: '17:30', service: 'Manicure', status: 'confirmed' },
];

export const MOCK_INVOICES = [
    {
        _id: 'inv1', invoiceNumber: 'INV-2026-001', createdAt: new Date().toISOString(),
        clientId: { _id: 'c1', name: 'Aman Verma', phone: '9876543210' },
        outletId: { _id: 'o1', name: 'Downtown Studio' },
        staffId: { _id: 'u1', name: 'Ravi Sharma' },
        items: [
            { type: 'service', itemId: 's1', name: 'Haircut – Men', price: 400, quantity: 1, total: 400 },
            { type: 'service', itemId: 's9', name: 'Cleanup', price: 500, quantity: 1, total: 500 },
        ],
        subTotal: 900, tax: 162, discount: 0, total: 1062,
        paymentMethod: 'cash', paymentStatus: 'paid',
    },
];
