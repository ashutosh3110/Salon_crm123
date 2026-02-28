import { createContext, useContext, useState, useEffect } from 'react';

const BusinessContext = createContext(null);

const MOCK_OUTLETS = [
    {
        _id: 'mock-1',
        name: 'Grace & Glamour - Downtown',
        city: 'Mumbai',
        address: '123, Marine Drive, South Mumbai',
        staffCount: 15,
        status: 'active',
        phone: '+91 98765 43210',
        email: 'downtown@graceglamour.com'
    },
    {
        _id: 'mock-2',
        name: 'The Royal Salon - Bandra',
        city: 'Mumbai',
        address: 'B-42, Pali Hill, Bandra West',
        staffCount: 8,
        status: 'active',
        phone: '+91 98765 43211',
        email: 'bandra@royalsalon.com'
    }
];

const MOCK_STAFF = [
    {
        _id: 's-1',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 98765 00001',
        role: 'manager',
        outletId: 'mock-1',
        outletName: 'Grace & Glamour - Downtown',
        inviteStatus: 'accepted',
        joinedDate: '2026-01-15'
    },
    {
        _id: 's-2',
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '+91 98765 00002',
        role: 'stylist',
        outletId: 'mock-1',
        outletName: 'Grace & Glamour - Downtown',
        inviteStatus: 'accepted',
        joinedDate: '2026-02-01'
    }
];

const MOCK_SERVICES = [
    { id: 1, name: 'Premium Haircut', category: 'Hair', duration: 45, price: 850, gst: 18, outlets: 'All Outlets', status: 'active', commissionApplicable: true, commissionType: 'percent', commissionValue: 10 },
    { id: 2, name: 'Facial Clean-up', category: 'Skin', duration: 30, price: 1200, gst: 12, outlets: 'Main Branch', status: 'active', commissionApplicable: true, commissionType: 'fixed', commissionValue: 150 },
    { id: 3, name: 'Bridal Makeup', category: 'Makeup', duration: 180, price: 15000, gst: 18, outlets: 'All Outlets', status: 'active', commissionApplicable: false },
    { id: 4, name: 'Pedicure Deluxe', category: 'Spa', duration: 60, price: 950, gst: 5, outlets: 'All Outlets', status: 'inactive', commissionApplicable: true, commissionType: 'percent', commissionValue: 5 },
];

const MOCK_CATEGORIES = [
    { id: 1, name: 'Hair', serviceCount: 12, status: 'active' },
    { id: 2, name: 'Skin', serviceCount: 8, status: 'active' },
    { id: 3, name: 'Makeup', serviceCount: 5, status: 'active' },
    { id: 4, name: 'Spa', serviceCount: 4, status: 'active' },
    { id: 5, name: 'Nails', serviceCount: 6, status: 'active' },
    { id: 6, name: 'Massage', serviceCount: 3, status: 'inactive' },
];

const MOCK_PRODUCTS = [
    { id: 1, name: 'Loreal Expert Shampoo', brand: 'Loreal', category: 'Hair Care', sellingPrice: 1250, sku: 'LRL-SMP-001', stock: 45, threshold: 10, status: 'active' },
    { id: 2, name: 'Matrix Hydra Serum', brand: 'Matrix', category: 'Serums', sellingPrice: 850, sku: 'MTX-SRM-042', stock: 8, threshold: 15, status: 'active' },
    { id: 3, name: 'Gillette Shaving Foam', brand: 'Gillette', category: 'Men Grooming', sellingPrice: 450, sku: 'GIL-FN-099', stock: 120, threshold: 20, status: 'active' },
    { id: 4, name: 'Philips Pro Hair Dryer', brand: 'Philips', category: 'Equipment', sellingPrice: 3500, sku: 'PHL-DRY-77', stock: 5, threshold: 5, status: 'inactive' },
];

const MOCK_CUSTOMERS = [
    { _id: 'c-1', name: 'Aryan Khan', phone: '+91 98765 43210', lastVisit: '2024-03-15', totalVisits: 12, spend: 15400, preferred: 'Haircut', tags: ['VIP'], status: 'Regular' },
    { _id: 'c-2', name: 'Ishita Sharma', phone: '+91 98765 43211', lastVisit: '2024-03-20', totalVisits: 5, spend: 8200, preferred: 'Manicure', tags: ['Regular'], status: 'Regular' },
    { _id: 'c-3', name: 'Rahul Verma', phone: '+91 98765 43212', lastVisit: '2024-02-10', totalVisits: 2, spend: 1200, preferred: 'Shave', tags: ['New'], status: 'Inactive' },
    { _id: 'c-4', name: 'Simran Jit', phone: '+91 98765 43213', lastVisit: '2024-03-21', totalVisits: 25, spend: 45000, preferred: 'Coloring', tags: ['VIP'], status: 'Regular' },
    { _id: 'c-5', name: 'Vikram Singh', phone: '+91 98765 43214', lastVisit: '2023-12-01', totalVisits: 1, spend: 500, preferred: 'Trim', tags: ['New'], status: 'Inactive' },
];

const MOCK_BOOKINGS = [
    {
        _id: 'b1',
        client: { name: 'Aryan Khan', phone: '+91 99887 76655' },
        service: { name: 'Full Haircut & Wash', price: 850 },
        staff: { _id: 's-1', name: 'Rahul Sharma' },
        appointmentDate: new Date().setHours(10, 0, 0, 0),
        status: 'upcoming',
        outletName: 'Grace & Glamour - Downtown',
        source: 'Online'
    },
    {
        _id: 'b2',
        client: { name: 'Pooja Hegde', phone: '+91 98765 43210' },
        service: { name: 'Facial Clean-up', price: 1200 },
        staff: { _id: 's-2', name: 'Priya Singh' },
        appointmentDate: new Date().setHours(11, 30, 0, 0),
        status: 'confirmed',
        outletName: 'The Royal Salon - Bandra',
        source: 'Walk-in'
    },
    {
        _id: 'b3',
        client: { name: 'Varun Dhawan', phone: '+91 99001 12233' },
        service: { name: 'Beard Trim', price: 450 },
        staff: { _id: 's-1', name: 'Rahul Sharma' },
        appointmentDate: new Date().setHours(14, 0, 0, 0),
        status: 'no-show',
        outletName: 'Grace & Glamour - Downtown',
        source: 'Online'
    }
];

const MOCK_SUPPLIERS = [
    { id: '1', name: 'Glossy Cosmetics Ltd', contact: 'Anil Mehta', phone: '+91 98200 12345', email: 'anil@glossy.com', gstin: '27AAACG1234A1Z5', due: 45000, status: 'Active' },
    { id: '2', name: 'Salon Supplies Inc', contact: 'Sarah J.', phone: '+91 98111 22233', email: 'sales@salonsupplies.in', gstin: '27BBBCG5678B1Z2', due: 12500, status: 'Overdue' },
    { id: '3', name: 'Organic India', contact: 'Rajesh K.', phone: '+91 99000 55555', email: 'support@organic.in', gstin: '27CCC G9012C1Z9', due: 0, status: 'Active' },
];

const MOCK_FEEDBACK = [
    { id: '1', customer: 'Aryan Khan', rating: 5, comment: 'Amazing haircut as always! Zoya is very detailed and understands exactly what I want.', service: 'Haircut', staff: 'Zoya Khan', date: '2024-03-22', status: 'active' },
    { id: '2', customer: 'Ishita Sharma', rating: 2, comment: 'Waiting time was too long even with an appointment. Service was okay but not exceptional.', service: 'Manicure', staff: 'Sneha Rao', date: '2024-03-21', status: 'active' },
    { id: '3', customer: 'Rahul Verma', rating: 4, comment: 'Good experience, clean place. Will come back.', service: 'Shave', staff: 'Haris Ali', date: '2024-03-20', status: 'active' },
    { id: '4', customer: 'Simran Jit', rating: 5, comment: 'The new color looks stunning. Best salon in town!', service: 'Hair Coloring', staff: 'Mehak Rizvi', date: '2024-03-19', status: 'active' },
];

const MOCK_SEGMENTS = [
    { id: '1', name: 'VIP Customers', count: 42, color: 'bg-amber-50 text-amber-600 border-amber-100', iconName: 'Crown', rule: 'Spend > ₹20,000 OR Visits > 15' },
    { id: '2', name: 'New Customers', count: 128, color: 'bg-blue-50 text-blue-600 border-blue-100', iconName: 'Zap', rule: 'First visit in last 30 days' },
    { id: '3', name: 'Inactive (30d+)', count: 86, color: 'bg-red-50 text-red-600 border-red-100', iconName: 'UserMinus', rule: 'No visit since 30+ days' },
];

export function BusinessProvider({ children }) {
    const [outlets, setOutlets] = useState(() => {
        const saved = localStorage.getItem('mock_outlets');
        return saved ? JSON.parse(saved) : MOCK_OUTLETS;
    });

    const [staff, setStaff] = useState(() => {
        const saved = localStorage.getItem('mock_staff');
        return saved ? JSON.parse(saved) : MOCK_STAFF;
    });

    const [services, setServices] = useState(() => {
        const saved = localStorage.getItem('mock_services');
        return saved ? JSON.parse(saved) : MOCK_SERVICES;
    });

    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('mock_categories');
        return saved ? JSON.parse(saved) : MOCK_CATEGORIES;
    });

    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('mock_products');
        return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
    });

    const [customers, setCustomers] = useState(() => {
        const saved = localStorage.getItem('mock_customers');
        return saved ? JSON.parse(saved) : MOCK_CUSTOMERS;
    });

    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem('mock_bookings');
        return saved ? JSON.parse(saved) : MOCK_BOOKINGS;
    });

    const [feedbacks, setFeedbacks] = useState(() => {
        const saved = localStorage.getItem('mock_feedbacks');
        return saved ? JSON.parse(saved) : MOCK_FEEDBACK;
    });

    const [suppliers, setSuppliers] = useState(() => {
        const saved = localStorage.getItem('mock_suppliers');
        return saved ? JSON.parse(saved) : MOCK_SUPPLIERS;
    });

    const [segments, setSegments] = useState(() => {
        const saved = localStorage.getItem('mock_segments');
        return saved ? JSON.parse(saved) : MOCK_SEGMENTS;
    });

    // Persist to localStorage
    useEffect(() => { localStorage.setItem('mock_outlets', JSON.stringify(outlets)); }, [outlets]);
    useEffect(() => { localStorage.setItem('mock_staff', JSON.stringify(staff)); }, [staff]);
    useEffect(() => { localStorage.setItem('mock_services', JSON.stringify(services)); }, [services]);
    useEffect(() => { localStorage.setItem('mock_categories', JSON.stringify(categories)); }, [categories]);
    useEffect(() => { localStorage.setItem('mock_products', JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem('mock_customers', JSON.stringify(customers)); }, [customers]);
    useEffect(() => { localStorage.setItem('mock_bookings', JSON.stringify(bookings)); }, [bookings]);
    useEffect(() => { localStorage.setItem('mock_feedbacks', JSON.stringify(feedbacks)); }, [feedbacks]);
    useEffect(() => { localStorage.setItem('mock_segments', JSON.stringify(segments)); }, [segments]);

    // Actions
    const addOutlet = (outlet) => setOutlets(prev => [{ ...outlet, _id: `out-${Date.now()}`, staffCount: 0 }, ...prev]);
    const updateOutlet = (id, data) => setOutlets(prev => prev.map(o => o._id === id ? { ...o, ...data } : o));
    const deleteOutlet = (id) => setOutlets(prev => prev.filter(o => o._id !== id));

    const addStaff = (member) => {
        const newMember = { ...member, _id: `s-${Date.now()}`, inviteStatus: 'accepted', joinedDate: new Date().toISOString().split('T')[0], outletName: outlets.find(o => o._id === member.outletId)?.name || 'Main' };
        setStaff(prev => [newMember, ...prev]);
    };
    const updateStaff = (id, data) => setStaff(prev => prev.map(s => s._id === id ? { ...s, ...data } : s));
    const deleteStaff = (id) => setStaff(prev => prev.filter(s => s._id !== id));

    const addService = (newService) => setServices(prev => [{ ...newService, id: Date.now() }, ...prev]);
    const updateService = (id, updatedData) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
    const deleteService = (id) => setServices(prev => prev.filter(s => s.id !== id));
    const toggleServiceStatus = (id) => setServices(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));

    const addCategory = (name) => setCategories(prev => [{ id: Date.now(), name, serviceCount: 0, status: 'active' }, ...prev]);
    const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));
    const toggleCategoryStatus = (id) => setCategories(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));

    const addProduct = (newProduct) => setProducts(prev => [{ ...newProduct, id: Date.now(), stock: 0 }, ...prev]);
    const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));
    const toggleProductStatus = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));

    const addCustomer = (customer) => setCustomers(prev => [{
        ...customer,
        _id: `c-${Date.now()}`,
        lastVisit: new Date().toISOString().split('T')[0],
        totalVisits: 0,
        spend: 0,
        tags: ['New'],
        status: 'Regular',
        history: []
    }, ...prev]);
    const updateCustomer = (id, data) => setCustomers(prev => prev.map(c => c._id === id ? { ...c, ...data } : c));
    const deleteCustomer = (id) => setCustomers(prev => prev.filter(c => c._id !== id));

    const addSupplier = (supplier) => setSuppliers(prev => [{ ...supplier, id: `s-${Date.now()}`, due: 0, status: 'Active' }, ...prev]);
    const updateSupplier = (id, data) => setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    const deleteSupplier = (id) => setSuppliers(prev => prev.filter(s => s.id !== id));

    const addFeedback = (feedback) => setFeedbacks(prev => [{
        ...feedback,
        id: Date.now().toString(),
        status: 'active',
        date: new Date().toISOString().split('T')[0]
    }, ...prev]);
    const archiveFeedback = (id) => setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'archived' } : f));
    const deleteFeedback = (id) => setFeedbacks(prev => prev.filter(f => f.id !== id));

    const addSegment = (segment) => setSegments(prev => [{ ...segment, id: Date.now().toString(), count: 0 }, ...prev]);
    const deleteSegment = (id) => setSegments(prev => prev.filter(s => s.id !== id));

    const addBooking = (booking) => setBookings(prev => [{ ...booking, _id: `b-${Date.now()}` }, ...prev]);
    const updateBookingStatus = (id, status) => setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));

    const value = {
        outlets, staff, services, categories, products, customers,
        addOutlet, updateOutlet, deleteOutlet,
        addStaff, updateStaff, deleteStaff,
        addService, updateService, deleteService, toggleServiceStatus,
        addCategory, deleteCategory, toggleCategoryStatus,
        addProduct, deleteProduct, toggleProductStatus,
        addCustomer, updateCustomer, deleteCustomer,
        feedbacks, addFeedback, archiveFeedback, deleteFeedback,
        suppliers, addSupplier, updateSupplier, deleteSupplier,
        segments, addSegment, deleteSegment,
        bookings, addBooking, updateBookingStatus
    };

    return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
    const context = useContext(BusinessContext);
    if (!context) throw new Error('useBusiness must be used within BusinessProvider');
    return context;
}
