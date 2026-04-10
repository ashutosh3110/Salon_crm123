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
    fetchStaff: async () => {}, addStaff: async () => {}, updateStaff: async () => {}, deleteStaff: async () => {},
    setOutlets: () => {}, fetchOutlets: async () => {}, outletsLoading: false
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
    const [outletsLoading, setOutletsLoading] = useState(false);

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

    const [isInitializing, setIsInitializing] = useState(false);

    const fetchCustomerInitialData = useCallback(async (force = false) => {
        if (isInitializing && !force) return;
        setIsInitializing(true);
        try {
            const [t, o, s, b, c, cat, p, sup, sh] = await Promise.all([
                mockApi.get('/tenants/me'),
                mockApi.get('/outlets'),
                mockApi.get('/users'),
                mockApi.get('/bookings'),
                mockApi.get('/services'),
                mockApi.get('/services/categories'),
                mockApi.get('/products'),
                mockApi.get('/suppliers'),
                mockApi.get('/shifts')
            ]);
            if (t.data.success) setSalon(t.data.data);
            setOutlets(o.data?.data || o.data || []);
            setStaff(s.data?.data || s.data?.results || s.data || []);
            setBookings(b.data?.results || b.data?.data || b.data || []);
            setServices(c.data?.results || c.data || []);
            setCategories(cat.data?.data || cat.data || []);
            setProducts(p.data?.results || p.data || []);
            setSuppliers(sup.data?.data || sup.data || []);
            setShifts(sh.data?.data || sh.data || []);
            await Promise.all([fetchCustomers(), fetchSegments(), fetchFeedbacks()]);
        } catch (err) {
            console.error("[BusinessContext] Failed to fetch initial data", err);
        } finally {
            setIsInitializing(false);
        }
    }, [fetchCustomers, fetchSegments, fetchFeedbacks, isInitializing]);

    useEffect(() => {
        if (isAuthenticated && user?.role !== 'superadmin') {
            fetchCustomerInitialData();
        }
    }, [isAuthenticated, user?.role, fetchCustomerInitialData]);

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

    const fetchOutlets = async (params) => {
        setOutletsLoading(true);
        try {
            const { lat, lng, radius } = params || {};
            const url = (lat != null && lng != null) 
                ? `/outlets/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
                : `/outlets`;
            const res = await mockApi.get(url);
            const data = res.data?.data || res.data || [];
            setOutlets(data);
            return data;
        } finally {
            setOutletsLoading(false);
        }
    };

    const value = useMemo(() => ({
        salon, outlets, outletsLoading, staff, services, categories, products, customers, customersLoading, fetchCustomers, addCustomer, updateCustomer, deleteCustomer,
        bookings, feedbacks, feedbacksLoading, fetchFeedbacks, archiveFeedback, updateFeedback, suppliers, segments, segmentsLoading, fetchSegments, 
        addSegment, deleteSegment, fetchSegmentCustomers, shifts, catalogue, activeOutletId, setActiveOutletId, setOutlets, activeOutlet, fetchOutlets,
        addSupplier, updateSupplier, deleteSupplier,
        isInitializing, fetchCustomerInitialData,
        addStaff: async (d) => { const r = await mockApi.post('/users', d); setStaff(p => [r.data, ...p]); return r.data; },
        updateStaff: async (id, d) => { const r = await mockApi.patch(`/users/${id}`, d); setStaff(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s)); return r.data; },
        deleteStaff: async (id) => { await mockApi.delete(`/users/${id}`); setStaff(p => p.filter(s => (s._id !== id && s.id !== id))); },
        fetchStaff: async () => { const r = await mockApi.get('/users'); setStaff(r.data?.data || r.data?.results || r.data || []); },
        fetchShifts: async () => { const r = await mockApi.get('/shifts'); setShifts(r.data?.data || r.data || []); },
        addShift: async (d) => { const r = await mockApi.post('/shifts', d); setShifts(p => [r.data, ...p]); return r.data; },
        updateShift: async (id, d) => { const r = await mockApi.patch(`/shifts/${id}`, d); setShifts(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s)); return r.data; },
        shiftsLoading: false
    }), [
        salon, outlets, outletsLoading, staff, services, categories, products, customers, customersLoading, fetchCustomers, 
        bookings, feedbacks, feedbacksLoading, fetchFeedbacks, suppliers, segments, segmentsLoading, fetchSegments, 
        shifts, catalogue, activeOutletId, activeOutlet, isInitializing, fetchCustomerInitialData
    ]);

    return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export const useBusiness = () => useContext(BusinessContext);
