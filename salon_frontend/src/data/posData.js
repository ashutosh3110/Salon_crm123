/**
 * POS Mock Data
 * Structured to match backend API models exactly.
 * When connecting to real backend, replace these with API calls to:
 *   GET /services, GET /products, GET /clients, GET /outlets,
 *   GET /users, GET /promotions/active, GET /invoices, POST /pos/checkout
 */

export const MOCK_SERVICES = [
    { _id: 's1', name: 'Haircut – Men', price: 400, duration: 30, category: 'Hair', status: 'active' },
    { _id: 's2', name: 'Haircut – Women', price: 600, duration: 45, category: 'Hair', status: 'active' },
    { _id: 's3', name: 'Hair Coloring', price: 2500, duration: 90, category: 'Hair', status: 'active' },
    { _id: 's4', name: 'Keratin Treatment', price: 5000, duration: 120, category: 'Hair', status: 'active' },
    { _id: 's5', name: 'Hair Spa', price: 1200, duration: 60, category: 'Hair', status: 'active' },
    { _id: 's6', name: 'Blow Dry & Styling', price: 500, duration: 30, category: 'Hair', status: 'active' },
    { _id: 's7', name: 'Classic Facial', price: 800, duration: 45, category: 'Skin', status: 'active' },
    { _id: 's8', name: 'Gold Facial', price: 1500, duration: 60, category: 'Skin', status: 'active' },
    { _id: 's9', name: 'Cleanup', price: 500, duration: 30, category: 'Skin', status: 'active' },
    { _id: 's10', name: 'Manicure', price: 350, duration: 30, category: 'Nails', status: 'active' },
    { _id: 's11', name: 'Pedicure', price: 450, duration: 40, category: 'Nails', status: 'active' },
    { _id: 's12', name: 'Gel Nails', price: 1200, duration: 60, category: 'Nails', status: 'active' },
    { _id: 's13', name: 'Full Body Wax', price: 2000, duration: 60, category: 'Waxing', status: 'active' },
    { _id: 's14', name: 'Half Arms Wax', price: 300, duration: 15, category: 'Waxing', status: 'active' },
    { _id: 's15', name: 'Eyebrow Threading', price: 50, duration: 10, category: 'Threading', status: 'active' },
    { _id: 's16', name: 'Upper Lip Threading', price: 30, duration: 5, category: 'Threading', status: 'active' },
    { _id: 's17', name: 'Bridal Makeup', price: 8000, duration: 120, category: 'Makeup', status: 'active' },
    { _id: 's18', name: 'Party Makeup', price: 3000, duration: 60, category: 'Makeup', status: 'active' },
];

export const MOCK_PRODUCTS = [
    { _id: 'p1', name: 'L\'Oréal Hair Serum', sku: 'LOR-SRM-001', price: 650, category: 'Hair Care', status: 'active' },
    { _id: 'p2', name: 'Moroccan Argan Oil', sku: 'MAO-OIL-001', price: 950, category: 'Hair Care', status: 'active' },
    { _id: 'p3', name: 'Keratin Shampoo', sku: 'KRT-SHP-001', price: 480, category: 'Hair Care', status: 'active' },
    { _id: 'p4', name: 'Anti-Dandruff Shampoo', sku: 'ADS-SHP-001', price: 320, category: 'Hair Care', status: 'active' },
    { _id: 'p5', name: 'Vitamin C Face Serum', sku: 'VTC-SRM-001', price: 890, category: 'Skin Care', status: 'active' },
    { _id: 'p6', name: 'Sunscreen SPF 50+', sku: 'SUN-SCR-001', price: 550, category: 'Skin Care', status: 'active' },
    { _id: 'p7', name: 'Sheet Mask Pack (5)', sku: 'SHT-MSK-005', price: 450, category: 'Skin Care', status: 'active' },
    { _id: 'p8', name: 'Nail Polish Set', sku: 'NPS-SET-001', price: 350, category: 'Nails', status: 'active' },
    { _id: 'p9', name: 'Cuticle Oil', sku: 'CTC-OIL-001', price: 250, category: 'Nails', status: 'active' },
    { _id: 'p10', name: 'Hair Styling Gel', sku: 'HSG-GEL-001', price: 280, category: 'Styling', status: 'active' },
];

export const MOCK_CLIENTS = [
    { _id: 'c1', name: 'Aman Verma', phone: '9876543210', email: 'aman@gmail.com', gender: 'male', loyaltyPoints: 450 },
    { _id: 'c2', name: 'Sonal Jha', phone: '9876543211', email: 'sonal@gmail.com', gender: 'female', loyaltyPoints: 120 },
    { _id: 'c3', name: 'Rohit Kumar', phone: '9876543212', email: 'rohit@gmail.com', gender: 'male', loyaltyPoints: 0 },
    { _id: 'c4', name: 'Deepika Sharma', phone: '9876543213', email: 'deepika@gmail.com', gender: 'female', loyaltyPoints: 890 },
    { _id: 'c5', name: 'Kiran Patel', phone: '9876543214', email: 'kiran@gmail.com', gender: 'female', loyaltyPoints: 200 },
    { _id: 'c6', name: 'Arjun Singh', phone: '9876543215', email: 'arjun@gmail.com', gender: 'male', loyaltyPoints: 50 },
    { _id: 'c7', name: 'Priya Nair', phone: '9876543216', email: 'priya@gmail.com', gender: 'female', loyaltyPoints: 620 },
    { _id: 'c8', name: 'Rahul Deshmukh', phone: '9876543217', email: 'rahul@gmail.com', gender: 'male', loyaltyPoints: 330 },
];

export const MOCK_OUTLETS = [
    { _id: 'o1', name: 'Downtown Studio', address: '123 MG Road, Mumbai', phone: '022-1234567', status: 'active', isMain: true },
    { _id: 'o2', name: 'Bandra Branch', address: '45 Hill Road, Bandra', phone: '022-2345678', status: 'active', isMain: false },
    { _id: 'o3', name: 'Pune Outlet', address: '78 FC Road, Pune', phone: '020-3456789', status: 'active', isMain: false },
];

export const MOCK_STAFF = [
    { _id: 'u1', name: 'Ravi Sharma', email: 'ravi@salon.com', role: 'stylist' },
    { _id: 'u2', name: 'Neha Gupta', email: 'neha@salon.com', role: 'stylist' },
    { _id: 'u3', name: 'Amit Patel', email: 'amit@salon.com', role: 'stylist' },
    { _id: 'u4', name: 'Meera Singh', email: 'meera@salon.com', role: 'stylist' },
    { _id: 'u5', name: 'Suresh Kumar', email: 'suresh@salon.com', role: 'stylist' },
];

export const MOCK_PROMOTIONS = [
    { _id: 'pr1', name: 'First Visit – 10% Off', discountType: 'percentage', discountValue: 10 },
    { _id: 'pr2', name: 'Flat ₹200 Off (Above ₹1500)', discountType: 'fixed', discountValue: 200 },
    { _id: 'pr3', name: 'Weekend Special – 15% Off', discountType: 'percentage', discountValue: 15 },
];

export const MOCK_INVOICES = [
    {
        _id: 'inv1', invoiceNumber: 'INV-2026-001', createdAt: '2026-02-23T06:30:00Z',
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
    {
        _id: 'inv2', invoiceNumber: 'INV-2026-002', createdAt: '2026-02-23T07:15:00Z',
        clientId: { _id: 'c2', name: 'Sonal Jha', phone: '9876543211' },
        outletId: { _id: 'o2', name: 'Bandra Branch' },
        staffId: { _id: 'u2', name: 'Neha Gupta' },
        items: [
            { type: 'service', itemId: 's3', name: 'Hair Coloring', price: 2500, quantity: 1, total: 2500 },
            { type: 'product', itemId: 'p1', name: 'L\'Oréal Hair Serum', price: 650, quantity: 1, total: 650 },
        ],
        subTotal: 3150, tax: 567, discount: 315, total: 3402,
        paymentMethod: 'card', paymentStatus: 'paid', promotionId: { _id: 'pr1', name: 'First Visit – 10% Off' },
    },
    {
        _id: 'inv3', invoiceNumber: 'INV-2026-003', createdAt: '2026-02-23T08:05:00Z',
        clientId: { _id: 'c3', name: 'Rohit Kumar', phone: '9876543212' },
        outletId: { _id: 'o3', name: 'Pune Outlet' },
        staffId: { _id: 'u3', name: 'Amit Patel' },
        items: [
            { type: 'service', itemId: 's7', name: 'Classic Facial', price: 800, quantity: 1, total: 800 },
        ],
        subTotal: 800, tax: 144, discount: 0, total: 944,
        paymentMethod: 'online', paymentStatus: 'paid',
    },
    {
        _id: 'inv4', invoiceNumber: 'INV-2026-004', createdAt: '2026-02-23T09:20:00Z',
        clientId: { _id: 'c4', name: 'Deepika Sharma', phone: '9876543213' },
        outletId: { _id: 'o1', name: 'Downtown Studio' },
        staffId: { _id: 'u4', name: 'Meera Singh' },
        items: [
            { type: 'service', itemId: 's4', name: 'Keratin Treatment', price: 5000, quantity: 1, total: 5000 },
            { type: 'product', itemId: 'p2', name: 'Moroccan Argan Oil', price: 950, quantity: 1, total: 950 },
        ],
        subTotal: 5950, tax: 1071, discount: 200, total: 6821,
        paymentMethod: 'card', paymentStatus: 'paid', promotionId: { _id: 'pr2', name: 'Flat ₹200 Off' },
    },
    {
        _id: 'inv5', invoiceNumber: 'INV-2026-005', createdAt: '2026-02-23T10:45:00Z',
        clientId: { _id: 'c5', name: 'Kiran Patel', phone: '9876543214' },
        outletId: { _id: 'o2', name: 'Bandra Branch' },
        staffId: { _id: 'u5', name: 'Suresh Kumar' },
        items: [
            { type: 'service', itemId: 's10', name: 'Manicure', price: 350, quantity: 1, total: 350 },
            { type: 'service', itemId: 's11', name: 'Pedicure', price: 450, quantity: 1, total: 450 },
        ],
        subTotal: 800, tax: 144, discount: 0, total: 944,
        paymentMethod: 'online', paymentStatus: 'paid',
    },
    {
        _id: 'inv6', invoiceNumber: 'INV-2026-006', createdAt: '2026-02-22T11:00:00Z',
        clientId: { _id: 'c6', name: 'Arjun Singh', phone: '9876543215' },
        outletId: { _id: 'o1', name: 'Downtown Studio' },
        staffId: { _id: 'u1', name: 'Ravi Sharma' },
        items: [
            { type: 'service', itemId: 's1', name: 'Haircut – Men', price: 400, quantity: 1, total: 400 },
        ],
        subTotal: 400, tax: 72, discount: 0, total: 472,
        paymentMethod: 'cash', paymentStatus: 'paid',
    },
    {
        _id: 'inv7', invoiceNumber: 'INV-2026-007', createdAt: '2026-02-22T14:30:00Z',
        clientId: { _id: 'c7', name: 'Priya Nair', phone: '9876543216' },
        outletId: { _id: 'o3', name: 'Pune Outlet' },
        staffId: { _id: 'u2', name: 'Neha Gupta' },
        items: [
            { type: 'service', itemId: 's17', name: 'Bridal Makeup', price: 8000, quantity: 1, total: 8000 },
        ],
        subTotal: 8000, tax: 1440, discount: 0, total: 9440,
        paymentMethod: 'card', paymentStatus: 'paid',
    },
    {
        _id: 'inv8', invoiceNumber: 'INV-2026-008', createdAt: '2026-02-23T11:30:00Z',
        clientId: { _id: 'c8', name: 'Rahul Deshmukh', phone: '9876543217' },
        outletId: { _id: 'o1', name: 'Downtown Studio' },
        staffId: { _id: 'u3', name: 'Amit Patel' },
        items: [
            { type: 'service', itemId: 's18', name: 'Party Makeup', price: 3000, quantity: 1, total: 3000 },
        ],
        subTotal: 3000, tax: 540, discount: 0, total: 3540,
        paymentMethod: 'unpaid', paymentStatus: 'unpaid',
    },
];
