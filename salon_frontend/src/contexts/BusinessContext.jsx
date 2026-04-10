import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useCustomerAuth } from './CustomerAuthContext';
import api from '../services/api';

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
            const r = await api.get('/clients');
            let list = r.data?.results || r.data?.data || (Array.isArray(r.data) ? r.data : []);
            setCustomers(Array.isArray(list) ? list : []);
        } catch { setCustomers([]); } finally { setCustomersLoading(false); }
    }, []);

    const fetchSegments = useCallback(async () => {
        setSegmentsLoading(true);
        try {
            const r = await api.get('/segments');
            let list = r.data?.data || (Array.isArray(r.data) ? r.data : []);
            setSegments(Array.isArray(list) ? list : []);
        } catch { setSegments([]); } finally { setSegmentsLoading(false); }
    }, []);

    const fetchFeedbacks = useCallback(async () => {
        setFeedbacksLoading(true);
        try {
            const r = await api.get('/feedbacks');
            let list = r.data?.data || (Array.isArray(r.data) ? r.data : []);
            setFeedbacks(Array.isArray(list) ? list : []);
        } catch { setFeedbacks([]); } finally { setFeedbacksLoading(false); }
    }, []);

    const initializationRef = useRef(false);

    const fetchCustomerInitialData = useCallback(async (force = false) => {
        if (initializationRef.current && !force) return;
        initializationRef.current = true;
        try {
            const [t, o, s, b, c, cat, p, sup, sh] = await Promise.all([
                api.get('/salons/me'),
                api.get('/outlets'),
                api.get('/users'),
                api.get('/bookings'),
                api.get('/services'),
                api.get('/services/categories'),
                api.get('/products'),
                api.get('/suppliers'),
                api.get('/shifts')
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
            initializationRef.current = false;
        }
    }, [fetchCustomers, fetchSegments, fetchFeedbacks]);

    useEffect(() => {
        if (isAuthenticated && user?.role !== 'superadmin') {
            fetchCustomerInitialData();
        }
    }, [isAuthenticated, user?.role, fetchCustomerInitialData]);

    const addCustomer = useCallback(async (d) => { const r = await api.post('/clients', d); setCustomers(p => [r.data, ...p]); return r.data; }, []);
    const deleteCustomer = useCallback(async (id) => { await api.delete(`/clients/${id}`); setCustomers(p => p.filter(c => (c._id !== id && c.id !== id))); }, []);
    const updateCustomer = useCallback(async (id, d) => { const r = await api.patch(`/clients/${id}`, d); setCustomers(p => p.map(c => (c._id === id || c.id === id) ? { ...c, ...d } : c)); return r.data; }, []);
    
    const addSegment = useCallback(async (d) => { const r = await api.post('/segments', d); setSegments(p => [r.data, ...p]); return r.data; }, []);
    const deleteSegment = useCallback(async (id) => { await api.delete(`/segments/${id}`); setSegments(p => p.filter(s => (s._id !== id && s.id !== id))); }, []);
    const fetchSegmentCustomers = useCallback(async (sid) => (await api.get(`/clients?segmentId=${sid}`)).data?.results || [], []);

    const updateFeedback = useCallback(async (id, d) => { await api.patch(`/feedbacks/${id}`, d); setFeedbacks(p => p.map(f => (f._id === id || f.id === id) ? { ...f, ...d } : f)); }, []);
    const archiveFeedback = useCallback(async (id) => { await api.patch(`/feedbacks/${id}`, { status: 'Archived' }); setFeedbacks(p => p.map(f => (f._id === id || f.id === id) ? { ...f, status: 'Archived' } : f)); }, []);

    const addSupplier = useCallback(async (d) => { 
        const r = await api.post('/suppliers', d); 
        setSuppliers(p => [r.data, ...p]); 
        return r.data; 
    }, []);
    const deleteSupplier = useCallback(async (id) => { 
        await api.delete(`/suppliers/${id}`); 
        setSuppliers(p => p.filter(s => (s._id !== id && s.id !== id))); 
    }, []);
    const updateSupplier = useCallback(async (id, d) => { 
        const r = await api.patch(`/suppliers/${id}`, d); 
        setSuppliers(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s)); 
        return r.data; 
    }, []);

    const fetchOutlets = useCallback(async (params) => {
        setOutletsLoading(true);
        try {
            const { lat, lng, radius } = params || {};
            const url = (lat != null && lng != null) 
                ? `/outlets/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
                : `/outlets`;
            const res = await api.get(url);
            const data = res.data?.data || res.data || [];
            setOutlets(data);
            return data;
        } finally {
            setOutletsLoading(false);
        }
    }, []);

    const addOutlet = useCallback(async (d) => {
        if (salon?.limits?.outletLimit > 0 && outlets.length >= salon.limits.outletLimit && salon.limits.outletLimit !== 999) {
            throw new Error(`Plan Limit Reached: You can only have up to ${salon.limits.outletLimit} outlets on the ${salon.subscriptionPlan.toUpperCase()} plan.`);
        }
        const r = await api.post('/outlets', d);
        setOutlets(p => [r.data, ...p]);
        return r.data;
    }, [salon, outlets.length]);

    const addStaff = useCallback(async (d) => { 
        if (salon?.limits?.staffLimit > 0 && staff.length >= salon.limits.staffLimit && salon.limits.staffLimit !== 999) {
            throw new Error(`Plan Limit Reached: You can only have up to ${salon.limits.staffLimit} staff members on the ${salon.subscriptionPlan.toUpperCase()} plan.`);
        }
        const r = await api.post('/users', d); 
        setStaff(p => [r.data, ...p]); 
        return r.data; 
    }, [salon, staff.length]);

    const updateStaff = useCallback(async (id, d) => { const r = await api.patch(`/users/${id}`, d); setStaff(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s)); return r.data; }, []);
    const deleteStaff = useCallback(async (id) => { await api.delete(`/users/${id}`); setStaff(p => p.filter(s => (s._id !== id && s.id !== id))); }, []);
    const fetchStaff = useCallback(async () => { const r = await api.get('/users'); setStaff(r.data?.data || r.data?.results || r.data || []); }, []);
    const fetchShifts = useCallback(async () => { const r = await api.get('/shifts'); setShifts(r.data?.data || r.data || []); }, []);
    const addShift = useCallback(async (d) => { const r = await api.post('/shifts', d); setShifts(p => [r.data, ...p]); return r.data; }, []);
    const updateShift = useCallback(async (id, d) => { const r = await api.patch(`/shifts/${id}`, d); setShifts(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s)); return r.data; }, []);

    const value = useMemo(() => ({
        salon, outlets, outletsLoading, staff, services, categories, products, customers, customersLoading, fetchCustomers, addCustomer, updateCustomer, deleteCustomer,
        bookings, feedbacks, feedbacksLoading, fetchFeedbacks, archiveFeedback, updateFeedback, suppliers, segments, segmentsLoading, fetchSegments, 
        addSegment, deleteSegment, fetchSegmentCustomers, shifts, catalogue, activeOutletId, setActiveOutletId, setOutlets, activeOutlet, fetchOutlets,
        addSupplier, updateSupplier, deleteSupplier,
        addOutlet,
        fetchCustomerInitialData,
        addStaff,
        updateStaff,
        deleteStaff,
        fetchStaff,
        fetchShifts,
        addShift,
        updateShift,
        shiftsLoading: false
    }), [
        salon, outlets, outletsLoading, staff, services, categories, products, customers, customersLoading, fetchCustomers, addCustomer, deleteCustomer, updateCustomer,
        bookings, feedbacks, feedbacksLoading, fetchFeedbacks, archiveFeedback, updateFeedback, suppliers, segments, segmentsLoading, fetchSegments, addSegment, deleteSegment, fetchSegmentCustomers,
        shifts, catalogue, activeOutletId, setActiveOutletId, setOutlets, activeOutlet, fetchOutlets, addSupplier, updateSupplier, deleteSupplier, addOutlet, fetchCustomerInitialData,
        addStaff, updateStaff, deleteStaff, fetchStaff, fetchShifts, addShift, updateShift
    ]);

    return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export const useBusiness = () => useContext(BusinessContext);
