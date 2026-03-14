import { createContext, useContext, useState, useEffect } from 'react';
import businessMockData from '../data/businessMockData.json';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
    const [outlets, setOutlets] = useState(() => {
        const saved = localStorage.getItem('mock_outlets');
        return saved ? JSON.parse(saved) : businessMockData.outlets;
    });

    const [staff, setStaff] = useState(() => {
        const saved = localStorage.getItem('mock_staff');
        return saved ? JSON.parse(saved) : businessMockData.staff;
    });

    const [services, setServices] = useState(() => {
        const saved = localStorage.getItem('mock_services');
        return saved ? JSON.parse(saved) : businessMockData.services;
    });

    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('mock_categories');
        return saved ? JSON.parse(saved) : businessMockData.categories;
    });

    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('mock_products');
        return saved ? JSON.parse(saved) : businessMockData.products;
    });

    const [customers, setCustomers] = useState(() => {
        const saved = localStorage.getItem('mock_customers');
        return saved ? JSON.parse(saved) : businessMockData.customers;
    });

    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem('mock_bookings');
        return saved ? JSON.parse(saved) : businessMockData.bookings;
    });

    const [feedbacks, setFeedbacks] = useState(() => {
        const saved = localStorage.getItem('mock_feedbacks');
        const initialData = saved ? JSON.parse(saved) : businessMockData.feedbacks;
        
        // Migration: Ensure all feedbacks use standardized keys
        return initialData.map(fb => ({
            ...fb,
            customerName: fb.customerName || fb.customer || 'Guest',
            service: fb.service || 'General Service',
            staffName: fb.staffName || fb.staff || 'N/A',
            comment: fb.comment || '',
            sentiment: fb.sentiment || (fb.rating >= 4 ? 'Positive' : (fb.rating === 3 ? 'Neutral' : 'Negative')),
            status: fb.status === 'active' ? (fb.rating <= 2 ? 'Urgent' : 'Pending') : (fb.status || 'Pending'),
            response: fb.response || ''
        }));
    });

    const [suppliers, setSuppliers] = useState(() => {
        const saved = localStorage.getItem('mock_suppliers');
        return saved ? JSON.parse(saved) : businessMockData.suppliers;
    });

    const [segments, setSegments] = useState(() => {
        const saved = localStorage.getItem('mock_segments');
        return saved ? JSON.parse(saved) : businessMockData.segments;
    });

    const [activeOutletId, setActiveOutletId] = useState(() => {
        return localStorage.getItem('active_outlet_id') || null;
    });

    const activeOutlet = outlets.find(o => o._id === activeOutletId) || null;

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
    useEffect(() => {
        if (activeOutletId) localStorage.setItem('active_outlet_id', activeOutletId);
        else localStorage.removeItem('active_outlet_id');
    }, [activeOutletId]);

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

    const addCategory = ({ name, gender }) => setCategories(prev => [{ id: Date.now(), name, gender: gender || 'both', serviceCount: 0, status: 'active' }, ...prev]);
    const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));
    const toggleCategoryStatus = (id) => setCategories(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
    const updateCategory = (id, data) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

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
        history: [],
        dob: customer.dob || '',
        anniversary: customer.anniversary || '',
        address: customer.address || '',
        remarks: customer.remarks || '',
        category: customer.category || 'Regular'
    }, ...prev]);
    const updateCustomer = (id, data) => setCustomers(prev => prev.map(c => c._id === id ? { ...c, ...data } : c));
    const deleteCustomer = (id) => setCustomers(prev => prev.filter(c => c._id !== id));

    const addSupplier = (supplier) => setSuppliers(prev => [{ ...supplier, id: `s-${Date.now()}`, due: 0, status: 'Active' }, ...prev]);
    const updateSupplier = (id, data) => setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    const deleteSupplier = (id) => setSuppliers(prev => prev.filter(s => s.id !== id));

    const addFeedback = (feedback) => {
        const sentiment = feedback.rating >= 4 ? 'Positive' : (feedback.rating === 3 ? 'Neutral' : 'Negative');
        setFeedbacks(prev => [{
            ...feedback,
            id: Date.now().toString(),
            status: feedback.rating <= 2 ? 'Urgent' : 'Pending',
            sentiment,
            date: new Date().toISOString().split('T')[0],
            response: ''
        }, ...prev]);
    };
    const updateFeedback = (id, data) => setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    const archiveFeedback = (id) => setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Archived' } : f));
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
        addCategory, deleteCategory, toggleCategoryStatus, updateCategory,
        addProduct, deleteProduct, toggleProductStatus,
        addCustomer, updateCustomer, deleteCustomer,
        feedbacks, addFeedback, updateFeedback, archiveFeedback, deleteFeedback,
        suppliers, addSupplier, updateSupplier, deleteSupplier,
        segments, addSegment, deleteSegment,
        bookings, addBooking, updateBookingStatus,
        activeOutletId, setActiveOutletId, activeOutlet
    };

    return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
    const context = useContext(BusinessContext);
    if (!context) throw new Error('useBusiness must be used within BusinessProvider');
    return context;
}
