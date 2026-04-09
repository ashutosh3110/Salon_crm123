import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useCustomerAuth } from './CustomerAuthContext';
import mockApi from '../services/mock/mockApi';

const BusinessContext = createContext({
    salon: null, outlets: [], staff: [], services: [], categories: [], products: [],
    customers: [], bookings: [], feedbacks: [], suppliers: [], segments: [], shifts: [], catalogue: null,
    fetchCustomers: async () => {}, fetchSegments: async () => {}, fetchFeedbacks: async () => {},
    addCustomer: async () => {}, updateCustomer: async () => {}, deleteCustomer: async () => {},
    addSegment: async () => {}, deleteSegment: async () => {},
    updateFeedback: async () => {}, archiveFeedback: async () => {}, fetchSegmentCustomers: async () => [],
    fetchStaff: async () => {}, addStaff: async () => {}, updateStaff: async () => {}, deleteStaff: async () => {}
});

export function BusinessProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [salon, setSalon] = useState(null);
    const [outlets, setOutlets] = useState([]);
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [segments, setSegments] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [catalogue, setCatalogue] = useState(null);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [segmentsLoading, setSegmentsLoading] = useState(false);
    const [feedbacksLoading, setFeedbacksLoading] = useState(false);

    const [activeOutletId, setActiveOutletId] = useState(() => localStorage.getItem('active_outlet_id') || null);
    const activeOutlet = useMemo(() => (outlets || []).find((o) => String(o._id || o.id) === String(activeOutletId || '')) || null, [outlets, activeOutletId]);

    const fetchCustomers = useCallback(async () => {
        setCustomersLoading(true);
        try {
            const r = await mockApi.get('/clients');
            let list = r.data?.results || r.data?.data || (Array.isArray(r.data) ? r.data : []);
            setCustomers(Array.isArray(list) ? list : []);
        } catch { setCustomers([]); } finally { setCustomersLoading(false); }
    }, []);

    const fetchSegments = useCallback(async () => {
        setSegmentsLoading(true);
        try {
            const r = await mockApi.get('/segments');
            let list = r.data?.data || (Array.isArray(r.data) ? r.data : []);
            setSegments(Array.isArray(list) ? list : []);
        } catch { setSegments([]); } finally { setSegmentsLoading(false); }
    }, []);

    const fetchFeedbacks = useCallback(async () => {
        setFeedbacksLoading(true);
        try {
            const r = await mockApi.get('/feedbacks');
            let list = r.data?.data || (Array.isArray(r.data) ? r.data : []);
            setFeedbacks(Array.isArray(list) ? list : []);
        } catch { setFeedbacks([]); } finally { setFeedbacksLoading(false); }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.role !== 'superadmin') {
            mockApi.get('/tenants/me').then(r => r.data.success && setSalon(r.data.data));
            mockApi.get('/outlets').then(r => setOutlets(r.data?.data || r.data || []));
            mockApi.get('/users').then(r => setStaff(r.data?.data || r.data?.results || r.data || []));
            mockApi.get('/bookings').then(r => setBookings(r.data?.results || r.data?.data || r.data || []));
            mockApi.get('/services').then(r => setServices(r.data?.results || r.data || []));
            mockApi.get('/services/categories').then(r => setCategories(r.data?.data || r.data || []));
            mockApi.get('/products').then(r => setProducts(r.data?.results || r.data || []));
            mockApi.get('/suppliers').then(r => setSuppliers(r.data?.data || r.data || []));
            mockApi.get('/shifts').then(r => setShifts(r.data?.data || r.data || []));
            mockApi.get('/catalogue').then(r => setCatalogue(r.data));
            fetchCustomers(); fetchSegments(); fetchFeedbacks();
        }
    }, [isAuthenticated, user?.role, fetchCustomers, fetchSegments, fetchFeedbacks]);

    const addCustomer = async (d) => { const r = await mockApi.post('/clients', d); setCustomers(p => [r.data, ...p]); return r.data; };
    const deleteCustomer = async (id) => { await mockApi.delete(`/clients/${id}`); setCustomers(p => p.filter(c => (c._id !== id && c.id !== id))); };
    const updateCustomer = async (id, d) => { const r = await mockApi.patch(`/clients/${id}`, d); setCustomers(p => p.map(c => (c._id === id || c.id === id) ? { ...c, ...d } : c)); return r.data; };
    
    const addSegment = async (d) => { const r = await mockApi.post('/segments', d); setSegments(p => [r.data, ...p]); return r.data; };
    const deleteSegment = async (id) => { await mockApi.delete(`/segments/${id}`); setSegments(p => p.filter(s => (s._id !== id && s.id !== id))); };
    const fetchSegmentCustomers = async (sid) => (await mockApi.get(`/clients?segmentId=${sid}`)).data?.results || [];

    const updateFeedback = async (id, d) => { await mockApi.patch(`/feedbacks/${id}`, d); setFeedbacks(p => p.map(f => (f._id === id || f.id === id) ? { ...f, ...d } : f)); };
    const archiveFeedback = async (id) => { await mockApi.patch(`/feedbacks/${id}`, { status: 'Archived' }); setFeedbacks(p => p.map(f => (f._id === id || f.id === id) ? { ...f, status: 'Archived' } : f)); };

    const addSupplier = async (d) => { 
        const r = await mockApi.post('/suppliers', d); 
        setSuppliers(p => [r.data, ...p]); 
        return r.data; 
    };
    const deleteSupplier = async (id) => { 
        await mockApi.delete(`/suppliers/${id}`); 
        setSuppliers(p => p.filter(s => (s._id !== id && s.id !== id))); 
    };
    const updateSupplier = async (id, d) => { 
        const r = await mockApi.patch(`/suppliers/${id}`, d); 
        setSuppliers(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s)); 
        return r.data; 
    };

    const value = {
        salon, outlets, staff, services, categories, products, customers, customersLoading, fetchCustomers, addCustomer, updateCustomer, deleteCustomer,
        bookings, feedbacks, feedbacksLoading, fetchFeedbacks, archiveFeedback, updateFeedback, suppliers, segments, segmentsLoading, fetchSegments, 
        addSegment, deleteSegment, fetchSegmentCustomers, shifts, catalogue, activeOutletId, setActiveOutletId, activeOutlet,
        addSupplier, updateSupplier, deleteSupplier,
        addStaff: async (d) => { const r = await mockApi.post('/users', d); setStaff(p => [r.data, ...p]); return r.data; },
        updateStaff: async (id, d) => { const r = await mockApi.patch(`/users/${id}`, d); setStaff(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s)); return r.data; },
        deleteStaff: async (id) => { await mockApi.delete(`/users/${id}`); setStaff(p => p.filter(s => (s._id !== id && s.id !== id))); },
        fetchStaff: async () => { const r = await mockApi.get('/users'); setStaff(r.data?.data || r.data?.results || r.data || []); }
    };

    return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export const useBusiness = () => useContext(BusinessContext);
