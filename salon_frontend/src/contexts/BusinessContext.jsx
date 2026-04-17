import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useCustomerAuth } from './CustomerAuthContext';
import api from '../services/api';

const BusinessContext = createContext({
    salon: null, outlets: [], staff: [], services: [], categories: [], products: [],
    customers: [], bookings: [], feedbacks: [], suppliers: [], segments: [], shifts: [], catalogue: null,
    fetchCustomers: async () => { }, fetchSegments: async () => { }, fetchFeedbacks: async () => { },
    fetchServices: async () => { }, fetchBookings: async () => { }, fetchProducts: async () => { }, fetchSuppliers: async () => { },
    addCustomer: async () => { }, updateCustomer: async () => { }, deleteCustomer: async () => { },
    addSegment: async () => { }, deleteSegment: async () => { },
    updateFeedback: async () => { }, archiveFeedback: async () => { }, fetchSegmentCustomers: async () => [],
    fetchStaff: async () => { }, addStaff: async () => { }, updateStaff: async () => { }, deleteStaff: async () => { },
    roles: [], fetchRoles: async () => { },
    setOutlets: () => { }, fetchOutlets: async () => { }, outletsLoading: false,
    loyaltySettings: null, fetchLoyaltySettings: async () => { },
    updateSalon: async () => { }, fetchSalon: async () => { },
    salonLoading: false
});

export function BusinessProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const { isCustomerAuthenticated, customer } = useCustomerAuth();
    const [salon, setSalon] = useState(null);
    const [outlets, setOutlets] = useState([]);
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [groupedServices, setGroupedServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [roles, setRoles] = useState([]);
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
    const [isInitializing, setIsInitializing] = useState(true);
    const [loyaltySettings, setLoyaltySettings] = useState(null);
    const [loyaltyPlans, setLoyaltyPlans] = useState([]);


    const [activeOutletId, setActiveOutletId] = useState(() => localStorage.getItem('active_outlet_id') || null);
    const [activeSalonId, setActiveSalonId] = useState(() => localStorage.getItem('active_salon_id') || null);

    const activeOutlet = useMemo(() => (outlets || []).find((o) => String(o._id || o.id) === String(activeOutletId || '')) || null, [outlets, activeOutletId]);

    // Sync activeOutletId to localStorage
    useEffect(() => {
        if (activeOutletId) {
            localStorage.setItem('active_outlet_id', activeOutletId);
        }
    }, [activeOutletId]);

    // Sync activeSalonId to localStorage and update from activeOutlet
    useEffect(() => {
        if (activeSalonId) {
            localStorage.setItem('active_salon_id', activeSalonId);
        }
    }, [activeSalonId]);

    useEffect(() => {
        if (activeOutlet?.salonId) {
            const sid = String(activeOutlet.salonId._id || activeOutlet.salonId);
            if (sid !== activeSalonId) {
                setActiveSalonId(sid);
            }
        }
    }, [activeOutlet, activeSalonId]);


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

    const fetchFeedbacks = useCallback(async (sId, oId, status) => {
        setFeedbacksLoading(true);
        try {
            const sid = sId || activeSalonId || salon?._id;
            const oid = oId || activeOutletId;

            let url = `/feedbacks?`;
            if (sid) url += `&salonId=${sid}`;
            if (oid) url += `&outletId=${oid}`;
            if (status) url += `&status=${status}`;

            const r = await api.get(url);
            let list = r.data?.data || (Array.isArray(r.data) ? r.data : []);
            setFeedbacks(Array.isArray(list) ? list : []);
        } catch { setFeedbacks([]); } finally { setFeedbacksLoading(false); }
    }, [activeSalonId, activeOutletId, salon?._id]);

    const initializationRef = useRef(false);

    const fetchServices = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id;
            if (!sid) return;
            const r = await api.get(`/services?salonId=${sid}`);
            setServices(r.data?.data || r.data?.results || r.data || []);
        } catch (error) {
            console.error("Fetch services failed:", error);
            setServices([]);
        }
    }, [activeSalonId, salon?._id]);

    const fetchGroupedServices = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id;
            if (!sid) return;
            const r = await api.get(`/services/grouped?salonId=${sid}`);
            setGroupedServices(r.data?.data || []);
        } catch (error) {
            console.error("Fetch grouped services failed:", error);
            setGroupedServices([]);
        }
    }, [activeSalonId, salon?._id]);

    const fetchCategories = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id;
            if (!sid) return;
            const r = await api.get(`/categories?salonId=${sid}`);
            setCategories(r.data?.data || []);
        } catch { setCategories([]); }
    }, [activeSalonId, salon?._id]);



    const fetchBookings = useCallback(async () => {
        try {
            const r = await api.get('/bookings');
            setBookings(r.data?.results || r.data?.data || r.data || []);
        } catch { setBookings([]); }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const r = await api.get('/products');
            setProducts(r.data?.results || r.data || []);
        } catch { setProducts([]); }
    }, []);

    const fetchSuppliers = useCallback(async () => {
        try {
            const r = await api.get('/suppliers');
            setSuppliers(r.data?.data || r.data || []);
        } catch { setSuppliers([]); }
    }, []);

    const fetchOutlets = useCallback(async (params = {}) => {
        setOutletsLoading(true);
        try {
            const { lat, lng, radius } = params;
            let url = '/outlets';
            let query = {};

            if (lat && lng) {
                url = '/outlets/nearby';
                query = { lat, lng, radius: radius || 10 };
            }

            const res = await api.get(url, { params: query });
            const data = res.data?.data || [];
            setOutlets(data);
            return data;
        } catch (err) {
            console.error('Fetch outlets failed:', err);
            return [];
        } finally {
            setOutletsLoading(false);
        }
    }, []);

    const fetchStaff = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id;
            const r = await api.get(`/users${sid ? `?salonId=${sid}` : ''}`);
            setStaff(r.data?.data || r.data?.results || r.data || []);
        } catch (error) {
            console.error("Fetch staff failed:", error);
            setStaff([]);
        }
    }, [activeSalonId, salon?._id]);

    const fetchShifts = useCallback(async () => { const r = await api.get('/shifts'); setShifts(r.data?.data || r.data || []); }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const r = await api.get('/roles');
            setRoles(r.data?.data || []);
        } catch { setRoles([]); }
    }, []);

    const fetchLoyaltySettings = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id || localStorage.getItem('active_salon_id');
            if (!sid) return;
            const r = await api.get(`/loyalty/settings/public?salonId=${sid}`);
            if (r.data?.success) setLoyaltySettings(r.data.data);
        } catch (err) {
            console.error('Failed to fetch loyalty settings:', err);
        }
    }, [activeSalonId, salon?._id]);

    const fetchLoyaltyPlans = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id || localStorage.getItem('active_salon_id');
            if (!sid) return;
            const r = await api.get(`/loyalty/membership-plans/public?salonId=${sid}`);
            if (r.data?.success) setLoyaltyPlans(r.data.data);
        } catch (err) {
            console.error('Failed to fetch loyalty plans:', err);
        }
    }, [activeSalonId, salon?._id]);

    const lastInitializedId = useRef(null);
    const fetchCustomerInitialData = useCallback(async () => {
        const sid = activeSalonId || localStorage.getItem('active_salon_id');
        if (initializationRef.current && lastInitializedId.current === sid) return;
        initializationRef.current = true;
        lastInitializedId.current = sid;

        try {
            // Core Salon & Outlets
            const t = await api.get('/salons/me');
            if (t.data.success) {
                const sData = t.data.data;
                setSalon(sData);
                const salonId = sData._id;
                // Parallel fetch for speed
                await Promise.all([
                    fetchOutlets(),
                    fetchServices(salonId),
                    fetchCategories(salonId),
                    fetchFeedbacks(salonId),
                    fetchStaff(salonId),
                    fetchLoyaltySettings(salonId),
                    fetchLoyaltyPlans(salonId)
                ]);
            }
        } catch (err) {
            console.error("Failed to initialize customer data:", err);
        } finally {
            setIsInitializing(false);
        }
    }, [fetchOutlets, fetchServices, fetchCategories, fetchStaff, fetchFeedbacks, fetchLoyaltySettings, fetchLoyaltyPlans, activeSalonId]);
    const fetchSalon = useCallback(async () => {
        try {
            const res = await api.get('/salons/me');
            if (res.data.success) {
                setSalon(res.data.data);
                return res.data.data;
            }
        } catch (err) {
            console.error('Failed to fetch salon:', err);
        }
    }, []);

    const updateSalon = useCallback(async (data) => {
        try {
            const res = await api.patch('/salons/me', data);
            if (res.data.success) {
                setSalon(res.data.data);
                return res.data.data;
            }
            throw new Error(res.data.message || 'Failed to update salon');
        } catch (err) {
            console.error('Update salon failed:', err);
            throw err;
        }
    }, []);

    const addCustomer = useCallback(async (d) => { const r = await api.post('/clients', d); setCustomers(p => [r.data, ...p]); return r.data; }, []);
    const deleteCustomer = useCallback(async (id) => { await api.delete(`/clients/${id}`); setCustomers(p => p.filter(c => (c._id !== id && c.id !== id))); }, []);
    const updateCustomer = useCallback(async (id, d) => { const r = await api.patch(`/clients/${id}`, d); setCustomers(p => p.map(c => (c._id === id || c.id === id) ? { ...c, ...d } : c)); return r.data; }, []);

    const addSegment = useCallback(async (d) => { const r = await api.post('/segments', d); setSegments(p => [r.data, ...p]); return r.data; }, []);
    const deleteSegment = useCallback(async (id) => { await api.delete(`/segments/${id}`); setSegments(p => p.filter(s => (s._id !== id && s.id !== id))); }, []);
    const fetchSegmentCustomers = useCallback(async (sid) => (await api.get(`/clients?segmentId=${sid}`)).data?.results || [], []);

    const addFeedback = useCallback(async (d) => {
        const payload = {
            salonId: d.salonId || activeSalonId || salon?._id,
            outletId: d.outletId || activeOutletId,
            ...d
        };
        const r = await api.post('/feedbacks', payload);
        const newFb = r.data.data || r.data;
        setFeedbacks(p => [newFb, ...p]);
        return newFb;
    }, [activeSalonId, activeOutletId, salon?._id]);

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


    const addOutlet = useCallback(async (d) => {
        const payload = {
            ...d,
            address: {
                street: d.address,
                city: d.city,
                state: d.state,
                pincode: d.pincode
            },
            location: {
                type: 'Point',
                coordinates: [d.longitude || 0, d.latitude || 0]
            }
        };
        const r = await api.post('/outlets', payload);
        const newOutlet = r.data.data;
        setOutlets(p => [newOutlet, ...p]);
        return newOutlet;
    }, []);

    const updateOutlet = useCallback(async (id, d) => {
        const payload = {
            ...d,
            address: {
                street: d.address,
                city: d.city,
                state: d.state,
                pincode: d.pincode
            },
            location: {
                type: 'Point',
                coordinates: [d.longitude || 0, d.latitude || 0]
            }
        };
        const r = await api.put(`/outlets/${id}`, payload);
        const updated = r.data.data;
        setOutlets(p => p.map(o => o._id === id ? updated : o));
        return updated;
    }, []);

    const deleteOutlet = useCallback(async (id) => {
        await api.delete(`/outlets/${id}`);
        setOutlets(p => p.filter(o => o._id !== id));
    }, []);

    const addStaff = useCallback(async (d) => {
        if (salon?.limits?.staffLimit > 0 && staff.length >= salon.limits.staffLimit && salon.limits.staffLimit !== 999) {
            throw new Error(`Plan Limit Reached: You can only have up to ${salon.limits.staffLimit} staff members on the ${salon.subscriptionPlan.toUpperCase()} plan.`);
        }
        const r = await api.post('/users', d);
        const newUser = r.data.data;
        setStaff(p => [newUser, ...p]);
        return newUser;
    }, [salon, staff.length]);

    const updateStaff = useCallback(async (id, d) => { const r = await api.patch(`/users/${id}`, d); const updated = r.data.data; setStaff(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...updated } : s)); return updated; }, []);
    const deleteStaff = useCallback(async (id) => { await api.delete(`/users/${id}`); setStaff(p => p.filter(s => (s._id !== id && s.id !== id))); }, []);

    const addShift = useCallback(async (d) => { const r = await api.post('/shifts', d); setShifts(p => [r.data, ...p]); return r.data; }, []);
    const updateShift = useCallback(async (id, d) => { const r = await api.patch(`/shifts/${id}`, d); setShifts(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s)); return r.data; }, []);


    const addService = useCallback(async (d) => {
        const r = await api.post('/services', d);
        const newService = r.data.data;
        setServices(p => [newService, ...p]);
        return newService;
    }, []);

    const updateService = useCallback(async (id, d) => {
        const r = await api.put(`/services/${id}`, d);
        const updated = r.data.data;
        setServices(p => p.map(s => s._id === id ? updated : s));
        return updated;
    }, []);

    const deleteService = useCallback(async (id) => {
        await api.delete(`/services/${id}`);
        setServices(p => p.filter(s => s._id !== id));
    }, []);

    const toggleServiceStatus = useCallback(async (id, status) => {
        const newStatus = status === 'active' ? 'inactive' : 'active';
        await api.put(`/services/${id}`, { status: newStatus });
        setServices(p => p.map(s => s._id === id ? { ...s, status: newStatus } : s));
    }, []);




    const addCategory = useCallback(async (d) => {
        const r = await api.post('/categories', d);
        const newCat = r.data.data;
        setCategories(p => [newCat, ...p]);
        return newCat;
    }, []);

    const updateCategory = useCallback(async (id, d) => {
        const r = await api.put(`/categories/${id}`, d);
        const updated = r.data.data;
        setCategories(p => p.map(c => c._id === id ? updated : c));
        return updated;
    }, []);

    const deleteCategory = useCallback(async (id) => {
        await api.delete(`/categories/${id}`);
        setCategories(p => p.filter(c => c._id !== id));
    }, []);

    const toggleCategoryStatus = useCallback(async (id) => {
        const cat = categories.find(c => c._id === id);
        if (!cat) return;
        const newStatus = cat.status === 'active' ? 'inactive' : 'active';
        await api.put(`/categories/${id}`, { status: newStatus });
        setCategories(p => p.map(c => c._id === id ? { ...c, status: newStatus } : c));
    }, [categories]);

    const addBooking = useCallback(async (d) => {
        const r = await api.post('/bookings', d);
        const newBooking = r.data.data;
        setBookings(p => [newBooking, ...p]);
        return newBooking;
    }, []);

    const updateBookingStatus = useCallback(async (id, status) => {
        const r = await api.patch(`/bookings/${id}/status`, { status });
        const updated = r.data.data;
        setBookings(p => p.map(b => b._id === id ? { ...b, status: updated.status } : b));
        return updated;
    }, []);

    const value = useMemo(() => ({
        salon, outlets, outletsLoading, staff, services, groupedServices, categories, products, customers, customersLoading, fetchCustomers, addCustomer, updateCustomer, deleteCustomer,
        bookings, feedbacks, feedbacksLoading, fetchFeedbacks, archiveFeedback, updateFeedback, addFeedback, suppliers, segments, segmentsLoading, fetchSegments,
        addSegment, deleteSegment, fetchSegmentCustomers, shifts, catalogue,
        activeOutletId, setActiveOutletId,
        activeSalonId, setActiveSalonId,
        setOutlets, activeOutlet, fetchOutlets,

        addSupplier, updateSupplier, deleteSupplier,
        addOutlet, updateOutlet, deleteOutlet,
        roles, fetchRoles,
        fetchCustomerInitialData,
        fetchServices, fetchGroupedServices, fetchBookings, fetchProducts, fetchSuppliers,
        addStaff, updateStaff, deleteStaff, fetchStaff,
        addService, updateService, deleteService, toggleServiceStatus,
        fetchCategories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus,
        addBooking, updateBookingStatus,
        fetchShifts, addShift, updateShift,
        isInitializing,
        loyaltySettings, fetchLoyaltySettings,
        loyaltyPlans, fetchLoyaltyPlans,
        updateSalon, fetchSalon,
        salonLoading: isInitializing
    }), [

        salon, outlets, outletsLoading, staff, services, categories, products, customers, customersLoading, fetchCustomers, addCustomer, deleteCustomer, updateCustomer,
        bookings, feedbacks, feedbacksLoading, fetchFeedbacks, archiveFeedback, updateFeedback, addFeedback, suppliers, segments, segmentsLoading, fetchSegments, addSegment, deleteSegment, fetchSegmentCustomers,
        shifts, catalogue, activeOutletId, setActiveOutletId, activeSalonId, setActiveSalonId, setOutlets, activeOutlet, fetchOutlets, addSupplier, updateSupplier, deleteSupplier, addOutlet, updateOutlet, deleteOutlet,
        roles, fetchRoles,
        fetchCustomerInitialData,
        fetchServices, fetchGroupedServices, fetchBookings, fetchProducts, fetchSuppliers,
        addStaff, updateStaff, deleteStaff, fetchStaff,
        addService, updateService, deleteService, toggleServiceStatus,
        fetchCategories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus,
        addBooking, updateBookingStatus,
        fetchShifts, addShift, updateShift,
        isInitializing,
        loyaltySettings, fetchLoyaltySettings,
        loyaltyPlans, fetchLoyaltyPlans,
        updateSalon, fetchSalon
    ]);



    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlId = searchParams.get('tenantId');
        if (urlId && urlId !== activeSalonId) {
            localStorage.setItem('active_salon_id', urlId);
            setActiveSalonId(urlId);
        }

        const effectiveTid = urlId || activeSalonId || localStorage.getItem('active_salon_id');

        if ((isAuthenticated || isCustomerAuthenticated) && user?.role !== 'superadmin') {
            fetchCustomerInitialData();
        } else if (effectiveTid) {
            if (lastInitializedId.current === effectiveTid) return;
            lastInitializedId.current = effectiveTid;

            const initGuest = async () => {
                try {
                    const initTasks = [];
                    if (!salon) {
                        initTasks.push(api.get(`/salons/${effectiveTid}`).then(res => {
                            if (res.data.success) setSalon(res.data.data);
                        }));
                    }
                    initTasks.push(fetchServices(effectiveTid));
                    initTasks.push(fetchCategories(effectiveTid));
                    initTasks.push(fetchFeedbacks(effectiveTid));
                    initTasks.push(fetchStaff(effectiveTid));
                    await Promise.all(initTasks);
                } catch (err) {
                    console.error("Guest initialization failed:", err);
                } finally {
                    setIsInitializing(false);
                }
            };
            initGuest();
        } else {
            setIsInitializing(false);
        }
    }, [isAuthenticated, isCustomerAuthenticated, activeSalonId, fetchCustomerInitialData, fetchServices, fetchCategories, fetchStaff]);

    return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export const useBusiness = () => useContext(BusinessContext);
