import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCustomerAuth } from './CustomerAuthContext';
import api from '../services/api';

import { toast } from 'react-hot-toast';

const BusinessContext = createContext({
    salon: null, outlets: [], staff: [], services: [], categories: [], products: [],
    customers: [], bookings: [], invoices: [], orders: [], feedbacks: [], suppliers: [], segments: [], shifts: [], catalogue: null,
    fetchCustomers: async () => { }, fetchSegments: async () => { }, fetchFeedbacks: async () => { },
    fetchServices: async () => { }, fetchBookings: async () => { }, fetchProducts: async () => { }, fetchSuppliers: async () => { },
    fetchInvoices: async () => { }, fetchOrders: async () => { },
    addCustomer: async () => { }, updateCustomer: async () => { }, deleteCustomer: async () => { }, bulkImportCustomers: async () => { },
    addSegment: async () => { }, deleteSegment: async () => { },
    updateFeedback: async () => { }, archiveFeedback: async () => { }, fetchSegmentCustomers: async () => [],
    fetchStaff: async () => { }, addStaff: async () => { }, updateStaff: async () => { }, deleteStaff: async () => { },
    roles: [], fetchRoles: async () => { },
    setOutlets: () => { }, fetchOutlets: async () => { }, outletsLoading: false,
    loyaltySettings: null, fetchLoyaltySettings: async () => { },
    platformSettings: null, fetchPlatformSettings: async () => { },
    updateSalon: async () => { }, fetchSalon: async () => { },
    salonLoading: false,
    banners: [], offers: [], lookbook: [], experts: [], productCategories: [], nearbyOutlets: [], userSession: null,
    isPageLoading: false, setIsPageLoading: () => { }
});



// Normalization helpers for data consistency
const normalizeProduct = (p) => {
    if (!p) return null;
    const id = String(p._id ?? p.id ?? '');
    return {
        ...p,
        id,
        _id: id,
        category: p.categoryId?.name || p.category || 'General',
        categoryId: p.categoryId?._id || p.categoryId || '',
        images: Array.isArray(p.images) ? p.images : (p.appImage ? [p.appImage] : [])
    };
};

const normalizeShopCat = (c) => {
    const id = String(c?._id ?? c?.id ?? '');
    return { 
        ...c, 
        id, 
        _id: id, 
        name: c?.name ?? '', 
        image: c?.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000' 
    };
};

export function BusinessProvider({ children }) {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const { isCustomerAuthenticated, customer, setCustomer, loading: customerLoading } = useCustomerAuth();
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
    const [orders, setOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [segments, setSegments] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [catalogue, setCatalogue] = useState(null);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [segmentsLoading, setSegmentsLoading] = useState(false);
    const [feedbacksLoading, setFeedbacksLoading] = useState(false);
    const [outletsLoading, setOutletsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [loyaltySettings, setLoyaltySettings] = useState(null);
    const [loyaltyPlans, setLoyaltyPlans] = useState([]);
    const [platformSettings, setPlatformSettings] = useState(null);
    
    // Initialization Refs
    const initializationRef = useRef(false);
    const lastInitializedId = useRef(null);
    const lastInitializedPath = useRef(null);
    const [banners, setBanners] = useState([]);
    const [offers, setOffers] = useState([]);
    const [lookbook, setLookbook] = useState([]);
    const [experts, setExperts] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [nearbyOutlets, setNearbyOutlets] = useState([]);
    const [userSession, setUserSession] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(false);
    



    const [activeSalonId, setActiveSalonId] = useState(() => localStorage.getItem('active_salon_id') || null);

    // CRITICAL: Cleanup invalid/mock salon IDs from previous sessions
    useEffect(() => {
        const sid = localStorage.getItem('active_salon_id');
        if (sid && sid !== 'null' && sid !== 'undefined' && !/^[0-9a-fA-F]{24}$/.test(sid)) {
            console.warn('Detecting invalid Salon ID format, cleaning up...', sid);
            localStorage.removeItem('active_salon_id');
            setActiveSalonId(null);
        }
    }, []);

    const [activeOutletId, _setActiveOutletId] = useState(() => localStorage.getItem('active_outlet_id') || null);
    const skipNextOutletToastRef = useRef(false);
    const skipNextInitializationRef = useRef(false);

    const setActiveOutletId = useCallback((idOrFn, options = {}) => {
        if (options.quiet) {
            skipNextOutletToastRef.current = true;
        }
        if (options.background) {
            skipNextInitializationRef.current = true;
        }
        _setActiveOutletId(idOrFn);
    }, []);
    
    // Ref to prevent infinite loops in toast/refetch
    const lastNotifiedOutletIdRef = useRef(activeOutletId);

    const activeOutlet = useMemo(() => (outlets || []).find((o) => String(o._id || o.id) === String(activeOutletId || '')) || null, [outlets, activeOutletId]);



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

    // Auto-set salon ID from user profile if missing
    useEffect(() => {
        if (isAuthenticated && user?.salonId && !activeSalonId) {
            setActiveSalonId(user.salonId);
            localStorage.setItem('active_salon_id', user.salonId);
        }
    }, [isAuthenticated, user, activeSalonId]);

    // Sync profile data from initial-data back to CustomerAuthContext
    useEffect(() => {
        if (userSession?.profile) {
            setCustomer(prev => ({ ...prev, ...userSession.profile }));
        }
    }, [userSession?.profile, setCustomer]);

    // Handle logout cleanup for Business Context
    useEffect(() => {
        if (authLoading || customerLoading) return;

        if (!isAuthenticated && !isCustomerAuthenticated) {
            // We clear sensitive/private data only
            // Public data like salon, outlets, services, products should remain accessible for guest browsing
            setStaff([]);
            setCustomers([]);
            setBookings([]);
            setOrders([]);
            setInvoices([]);
            setFeedbacks([]);
            setSuppliers([]);
            setSegments([]);
            setShifts([]);
            setCatalogue(null);
            setUserSession(null);

            // Critical: Don't clear activeSalonId/activeOutletId here. 
            // They are cleared explicitly in the logout functions if needed.
            // This prevents losing the selection on page refresh.

            initializationRef.current = false;
            lastInitializedId.current = null;
        }
    }, [isAuthenticated, isCustomerAuthenticated, authLoading, customerLoading]);


    const [customersMetadata, setCustomersMetadata] = useState({ totalCount: 0, totalPages: 0, currentPage: 1 });
    const [globalStats, setGlobalStats] = useState({ totalRevenue: 0, totalVIPs: 0, totalInactive: 0, totalCount: 0, totalLiability: 0 });
    const fetchPlatformSettings = useCallback(async () => {
        try {
            const r = await api.get('/settings');
            if (r.data?.success) {
                setPlatformSettings(r.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch platform settings:', err);
        }
    }, []);

    const fetchCustomers = useCallback(async (page = 1, limit = 5) => {
        setCustomersLoading(true);
        try {
            const r = await api.get(`/clients?page=${page}&limit=${limit}`);
            let list = r.data?.data || (Array.isArray(r.data) ? r.data : []);
            setCustomers(Array.isArray(list) ? list : []);
            if (r.data?.success) {
                setCustomersMetadata({
                    totalCount: r.data.totalCount || 0,
                    totalPages: r.data.totalPages || 0,
                    currentPage: r.data.currentPage || 1
                });
                if (r.data.globalStats) {
                    setGlobalStats(r.data.globalStats);
                }
            }
        } catch { setCustomers([]); } finally { setCustomersLoading(false); }
    }, []);

    const fetchAllCustomerIds = useCallback(async () => {
        try {
            const r = await api.get('/clients?limit=10000');
            const list = r.data?.data || [];
            return list.map(c => c._id);
        } catch { return []; }
    }, []);

    const fetchSegments = useCallback(async () => {
        setSegmentsLoading(true);
        try {
            const r = await api.get('/marketing/segments');
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


    const fetchServices = useCallback(async (sId, oId) => {
        try {
            const sid = sId || activeSalonId || salon?._id;
            // Use activeOutletId ONLY if oId is undefined. If oId is null, it means 'All Outlets'.
            const oid = oId === undefined ? activeOutletId : oId;

            if (!sid) return;

            let url = `/services?salonId=${sid}`;
            if (oid) url += `&outletId=${oid}`;

            const r = await api.get(url);
            setServices(r.data?.data || r.data?.results || r.data || []);
        } catch (error) {
            console.error("Fetch services failed:", error);
            setServices([]);
        }
    }, [activeSalonId, activeOutletId]);

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
    }, [activeSalonId]);

    const fetchCategories = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id;
            if (!sid) return;
            const r = await api.get(`/categories?salonId=${sid}`);
            setCategories(r.data?.data || []);
        } catch { setCategories([]); }
    }, [activeSalonId]);



    const fetchBookings = useCallback(async () => {
        try {
            const r = await api.get('/bookings');
            setBookings(r.data?.results || r.data?.data || r.data || []);
        } catch { setBookings([]); }
    }, []);

    const fetchInvoices = useCallback(async () => {
        try {
            const r = await api.get('/pos/invoices');
            setInvoices(r.data?.data || r.data?.results || r.data || []);
        } catch { setInvoices([]); }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const r = await api.get('/orders');
            setOrders(r.data?.data || r.data?.results || r.data || []);
        } catch { setOrders([]); }
    }, []);

    const fetchProducts = useCallback(async (sId, oId) => {
        try {
            const sid = sId || activeSalonId || salon?._id;
            const oid = oId === undefined ? activeOutletId : oId;

            if (!sid) return;
            let url = `/products?salonId=${sid}`;
            if (oid) url += `&outletId=${oid}`;

            const r = await api.get(url);
            const raw = r.data?.data || r.data?.results || r.data || [];
            setProducts(Array.isArray(raw) ? raw.map(normalizeProduct) : []);
        } catch (error) {
            console.error("Fetch products failed:", error);
            setProducts([]);
        }
    }, [activeSalonId, activeOutletId]);

    const fetchProductCategories = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id;
            if (!sid) return;
            const r = await api.get(`/product-categories?salonId=${sid}`);
            const raw = r.data?.data || r.data || [];
            setProductCategories(Array.isArray(raw) ? raw.map(normalizeShopCat) : []);
        } catch (error) {
            console.error("Fetch product categories failed:", error);
            setProductCategories([]);
        }
    }, [activeSalonId]);

    const fetchSuppliers = useCallback(async () => {
        try {
            const r = await api.get('/finance/suppliers');
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
            if (!sid) return;
            const r = await api.get(`/users?salonId=${sid}`);
            setStaff(r.data?.data || r.data?.results || r.data || []);
        } catch (error) {
            console.error("Fetch staff failed:", error);
            setStaff([]);
        }
    }, [activeSalonId]);

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
    }, [activeSalonId]);

    const fetchLoyaltyPlans = useCallback(async (sId) => {
        try {
            const sid = sId || activeSalonId || salon?._id || localStorage.getItem('active_salon_id');
            if (!sid) return;
            const r = await api.get(`/loyalty/membership-plans/public?salonId=${sid}`);
            if (r.data?.success) setLoyaltyPlans(r.data.data);
        } catch (err) {
            console.error('Failed to fetch loyalty plans:', err);
        }
    }, [activeSalonId]);

    const fetchCustomerInitialData = useCallback(async (options = {}) => {
        if (initializationRef.current) return;
        const sid = activeSalonId || localStorage.getItem('active_salon_id');
        if (!sid || sid === 'mock_tenant_id' || !/^[0-9a-fA-F]{24}$/.test(sid)) {
            setIsInitializing(false);
            return;
        }
        
        initializationRef.current = true;
        if (!options.background) setIsInitializing(true);
        try {
            const customerId = customer?._id || localStorage.getItem('customer_user') ? JSON.parse(localStorage.getItem('customer_user'))._id : null;
            
            // Get location if available
            let lat, lng;
            const savedLoc = localStorage.getItem('user_location');
            if (savedLoc) {
                const parsed = JSON.parse(savedLoc);
                lat = parsed.lat;
                lng = parsed.lng;
            }

            let url = `/salons/${sid}/initial-data?`;
            if (customerId) url += `customerId=${customerId}&`;
            if (activeOutletId) url += `outletId=${activeOutletId}&`;
            if (lat && lng) url += `lat=${lat}&lng=${lng}&`;

            const res = await api.get(url);
            
            if (res.data.success) {
                const d = res.data.data;
                setSalon(d.salon);
                setOutlets(d.outlets || []);
                setNearbyOutlets(d.nearbyOutlets || []);
                setServices(d.services || []);
                setCategories(d.categories || []);
                setFeedbacks(d.feedbacks || []);
                setStaff(d.staff || []);
                setLoyaltySettings(d.loyaltySettings);
                setLoyaltyPlans(d.loyaltyPlans || []);
                setProducts((d.products || []).map(normalizeProduct));
                setProductCategories((d.productCategories || []).map(normalizeShopCat));
                setBanners(d.cms?.banners || []);
                setOffers(d.cms?.offers || []);
                setLookbook(d.cms?.lookbook || []);
                setExperts(d.cms?.experts || []);
                
                // Set the combined user session data
                if (d.user) {
                    setUserSession(d.user);
                }
            }
        } catch (err) {
            console.error("Failed to fetch consolidated initial data:", err);
        } finally {
            initializationRef.current = false;
            setIsInitializing(false);
        }
    }, [activeSalonId, fetchProductCategories, fetchProducts, fetchLoyaltySettings, fetchLoyaltyPlans]);

    // Sync activeOutletId to localStorage and show message
    useEffect(() => {
        if (activeOutletId && activeOutletId !== lastNotifiedOutletIdRef.current) {
            localStorage.setItem('active_outlet_id', activeOutletId);
            lastNotifiedOutletIdRef.current = activeOutletId;
            
            // Show a premium selection message
            if (activeOutlet && !skipNextOutletToastRef.current) {
                toast.success(`Active Hub: ${activeOutlet.name}`, {
                    icon: '📍',
                    duration: 3000,
                    style: {
                        background: '#1A1A1A',
                        color: '#C8956C',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        border: '1px solid rgba(200,149,108,0.2)',
                        padding: '12px 20px',
                        borderRadius: '16px'
                    }
                });
            }
            skipNextOutletToastRef.current = false;
        }
    }, [activeOutletId, activeOutlet]);
    const fetchSalon = useCallback(async () => {
        try {
            const sid = activeSalonId || localStorage.getItem('active_salon_id');

            // If we are definitely authenticated, always use /salons/me
            if (isAuthenticated) {
                const res = await api.get('/salons/me');
                if (res.data.success) {
                    setSalon(res.data.data);
                    return res.data.data;
                }
                return null;
            }

            // For customers, we MUST have a valid sid
            if (!sid || sid === 'null' || sid === 'undefined') {
                return null;
            }

            const res = await api.get(`/salons/${sid}`);
            if (res.data.success) {
                setSalon(res.data.data);
                return res.data.data;
            }
        } catch (err) {
            console.error('Failed to fetch salon:', err);
        }
    }, [isAuthenticated, activeSalonId]);



    const addCustomer = useCallback(async (d) => {
        try {
            const r = await api.post('/clients', d);
            setCustomers(p => [r.data, ...p]);
            toast.success('Customer registered successfully');
            return r.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add customer');
            throw err;
        }
    }, []);

    const deleteCustomer = useCallback(async (id) => {
        try {
            await api.delete(`/clients/${id}`);
            setCustomers(p => p.filter(c => (c._id !== id && c.id !== id)));
            toast.success('Customer profile removed');
        } catch (err) {
            toast.error('Failed to delete customer');
            throw err;
        }
    }, []);

    const updateCustomer = useCallback(async (id, d) => {
        try {
            const r = await api.patch(`/clients/${id}`, d);
            setCustomers(p => p.map(c => (c._id === id || c.id === id) ? { ...c, ...d } : c));
            toast.success('Customer data updated');
            return r.data;
        } catch (err) {
            toast.error('Failed to update customer');
            throw err;
        }
    }, []);

    const bulkImportCustomers = useCallback(async (data) => {
        try {
            const r = await api.post('/clients/bulk', { customers: data });
            if (r.data?.success) {
                toast.success(`${r.data.count} customers imported successfully`);
                fetchCustomers(1, 5); // Refresh list
                return r.data;
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Bulk import failed');
            throw err;
        }
    }, [fetchCustomers]);

    const addSegment = useCallback(async (d) => {
        try {
            const r = await api.post('/marketing/segments', d);
            setSegments(p => [r.data, ...p]);
            toast.success(`Segment "${d.name}" created`);
            return r.data;
        } catch (err) {
            toast.error('Failed to create segment');
            throw err;
        }
    }, []);

    const deleteSegment = useCallback(async (id) => {
        try {
            await api.delete(`/marketing/segments/${id}`);
            setSegments(p => p.filter(s => (s._id !== id && s.id !== id)));
            toast.success('Segment deleted');
        } catch (err) {
            toast.error('Failed to delete segment');
            throw err;
        }
    }, []);

    const fetchSegmentCustomers = useCallback(async (sid) => (await api.get(`/marketing/segments/${sid}/customers`)).data?.results || [], []);

    const addFeedback = useCallback(async (d) => {
        try {
            const payload = {
                salonId: d.salonId || activeSalonId || salon?._id,
                outletId: d.outletId || activeOutletId,
                ...d
            };
            const r = await api.post('/feedbacks', payload);
            const newFb = r.data.data || r.data;
            setFeedbacks(p => [newFb, ...p]);
            toast.success('Feedback recorded');
            return newFb;
        } catch (err) {
            toast.error('Failed to submit feedback');
            throw err;
        }
    }, [activeSalonId, activeOutletId, salon?._id]);

    const updateFeedback = useCallback(async (id, d) => {
        try {
            await api.patch(`/feedbacks/${id}`, d);
            setFeedbacks(p => p.map(f => (f._id === id || f.id === id) ? { ...f, ...d } : f));
            toast.success('Feedback updated');
        } catch (err) {
            toast.error('Failed to update feedback');
            throw err;
        }
    }, []);

    const archiveFeedback = useCallback(async (id) => {
        try {
            await api.patch(`/feedbacks/${id}`, { status: 'Archived' });
            setFeedbacks(p => p.map(f => (f._id === id || f.id === id) ? { ...f, status: 'Archived' } : f));
            toast.success('Feedback archived');
        } catch (err) {
            toast.error('Failed to archive feedback');
            throw err;
        }
    }, []);

    const addSupplier = useCallback(async (d) => {
        try {
            const r = await api.post('/finance/suppliers', d);
            const newSup = r.data.data || r.data;
            setSuppliers(p => [newSup, ...p]);
            toast.success('Supplier added');
            return newSup;
        } catch (err) {
            toast.error('Failed to add supplier');
            throw err;
        }
    }, []);

    const deleteSupplier = useCallback(async (id) => {
        try {
            await api.delete(`/finance/suppliers/${id}`);
            setSuppliers(p => p.filter(s => (s._id !== id && s.id !== id)));
            toast.success('Supplier removed');
        } catch (err) {
            toast.error('Failed to delete supplier');
            throw err;
        }
    }, []);

    const updateSupplier = useCallback(async (id, d) => {
        try {
            const r = await api.put(`/finance/suppliers/${id}`, d);
            const updated = r.data.data || r.data;
            setSuppliers(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...updated } : s));
            toast.success('Supplier details updated');
            return updated;
        } catch (err) {
            toast.error('Failed to update supplier');
            throw err;
        }
    }, []);


    const addOutlet = useCallback(async (d) => {
        try {
            let payload = d;
            if (!(d instanceof FormData)) {
                payload = {
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
            }
            const r = await api.post('/outlets', payload);
            const newOutlet = r.data.data;
            setOutlets(p => [newOutlet, ...p]);
            toast.success('New outlet initialized');
            return newOutlet;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create outlet');
            throw err;
        }
    }, []);

    const updateOutlet = useCallback(async (id, d) => {
        try {
            let payload = d;
            if (!(d instanceof FormData)) {
                payload = {
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
            }
            const r = await api.put(`/outlets/${id}`, payload);
            const updated = r.data.data;
            setOutlets(p => p.map(o => o._id === id ? updated : o));
            toast.success('Outlet protocols updated');
            return updated;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteOutlet = useCallback(async (id) => {
        try {
            await api.delete(`/outlets/${id}`);
            setOutlets(p => p.filter(o => o._id !== id));
            toast.success('Outlet deleted');
        } catch (err) {
            toast.error('Failed to delete outlet');
            throw err;
        }
    }, []);

    const addStaff = useCallback(async (d) => {
        try {
            if (salon?.limits?.staffLimit > 0 && staff.length >= salon.limits.staffLimit && salon.limits.staffLimit !== 999) {
                throw new Error(`Plan Limit Reached: You can only have up to ${salon.limits.staffLimit} staff members.`);
            }
            const r = await api.post('/users', d);
            const newUser = r.data.data;
            setStaff(p => [newUser, ...p]);
            toast.success('Staff member onboarded');
            return newUser;
        } catch (err) {
            toast.error(err.message || 'Failed to add staff');
            throw err;
        }
    }, [salon, staff.length]);

    const updateStaff = useCallback(async (id, d) => {
        try {
            const r = await api.patch(`/users/${id}`, d);
            const updated = r.data.data;
            setStaff(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...updated } : s));
            toast.success('Staff records updated');
            return updated;
        } catch (err) {
            toast.error('Failed to update staff');
            throw err;
        }
    }, []);

    const deleteStaff = useCallback(async (id) => {
        try {
            await api.delete(`/users/${id}`);
            setStaff(p => p.filter(s => (s._id !== id && s.id !== id)));
            toast.success('Staff access revoked');
        } catch (err) {
            toast.error('Failed to delete staff');
            throw err;
        }
    }, []);

    const addShift = useCallback(async (d) => {
        try {
            const r = await api.post('/shifts', d);
            setShifts(p => [r.data, ...p]);
            toast.success('Work shift created');
            return r.data;
        } catch (err) {
            toast.error('Failed to create shift');
            throw err;
        }
    }, []);

    const updateShift = useCallback(async (id, d) => {
        try {
            const r = await api.patch(`/shifts/${id}`, d);
            setShifts(p => p.map(s => (s._id === id || s.id === id) ? { ...s, ...d } : s));
            toast.success('Shift parameters updated');
            return r.data;
        } catch (err) {
            toast.error('Failed to update shift');
            throw err;
        }
    }, []);


    const addService = useCallback(async (d) => {
        try {
            const r = await api.post('/services', d);
            const newService = r.data.data;
            setServices(p => [newService, ...p]);
            toast.success('New service launched');
            return newService;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateService = useCallback(async (id, d) => {
        try {
            const r = await api.put(`/services/${id}`, d);
            const updated = r.data.data;
            setServices(p => p.map(s => s._id === id ? updated : s));
            toast.success('Service catalog updated');
            return updated;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteService = useCallback(async (id) => {
        try {
            await api.delete(`/services/${id}`);
            setServices(p => p.filter(s => s._id !== id));
            toast.success('Service removed from catalog');
        } catch (err) {
            toast.error('Failed to delete service');
            throw err;
        }
    }, []);

    const toggleServiceStatus = useCallback(async (id, status) => {
        try {
            const newStatus = status === 'active' ? 'inactive' : 'active';
            await api.put(`/services/${id}`, { status: newStatus });
            setServices(p => p.map(s => s._id === id ? { ...s, status: newStatus } : s));
            toast.success(`Service status: ${newStatus.toUpperCase()}`);
        } catch (err) {
            toast.error('Operation failed');
            throw err;
        }
    }, []);




    const addCategory = useCallback(async (d) => {
        try {
            const r = await api.post('/categories', d);
            const newCat = r.data.data;
            setCategories(p => [newCat, ...p]);
            toast.success('Category created');
            return newCat;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateCategory = useCallback(async (id, d) => {
        try {
            const r = await api.put(`/categories/${id}`, d);
            const updated = r.data.data;
            setCategories(p => p.map(c => c._id === id ? updated : c));
            toast.success('Category updated');
            return updated;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteCategory = useCallback(async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            setCategories(p => p.filter(c => c._id !== id));
            toast.success('Category deleted');
        } catch (err) {
            toast.error('Failed to delete category');
            throw err;
        }
    }, []);

    const toggleCategoryStatus = useCallback(async (id) => {
        try {
            const cat = categories.find(c => c._id === id);
            if (!cat) return;
            const newStatus = cat.status === 'active' ? 'inactive' : 'active';
            await api.put(`/categories/${id}`, { status: newStatus });
            setCategories(p => p.map(c => c._id === id ? { ...c, status: newStatus } : c));
            toast.success(`Category ${newStatus}`);
        } catch (err) {
            toast.error('Status toggle failed');
            throw err;
        }
    }, [categories]);

    const addBooking = useCallback(async (d) => {
        try {
            const r = await api.post('/bookings', d);
            const newBooking = r.data.data;
            setBookings(p => [newBooking, ...p]);
            toast.success('Appointment confirmed');
            return newBooking;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
            throw err;
        }
    }, []);

    const updateBookingStatus = useCallback(async (id, data) => {
        try {
            const payload = typeof data === 'string' ? { status: data } : data;
            const r = await api.patch(`/bookings/${id}/status`, payload);
            const updated = r.data.data;
            setBookings(p => p.map(b => b._id === id ? { ...b, ...updated } : b));
            if (payload.status) toast.success(`Status updated: ${payload.status.toUpperCase()}`);
            if (payload.paymentStatus) toast.success(`Payment status: ${payload.paymentStatus.toUpperCase()}`);
            return updated;
        } catch (err) {
            toast.error('Update failed');
            throw err;
        }
    }, []);

    const checkoutPOS = useCallback(async (data) => {
        try {
            const r = await api.post('/pos/checkout', data);
            const invoice = r.data?.data || r.data;
            setInvoices(p => [invoice, ...p]);
            return invoice;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateSalon = useCallback(async (data) => {
        try {
            const res = await api.patch('/salons/me', data);
            if (res.data.success) {
                setSalon(res.data.data);
                toast.success('Salon profile synchronized');
                return res.data.data;
            }
            throw new Error(res.data.message || 'Failed to update salon');
        } catch (err) {
            toast.error('Profile sync failure');
            console.error('Update salon failed:', err);
            throw err;
        }
    }, []);

    const value = useMemo(() => ({
        salon, outlets, outletsLoading, staff, services, groupedServices, categories, products, customers, customersMetadata, globalStats, customersLoading, fetchCustomers, fetchAllCustomerIds, addCustomer, updateCustomer, deleteCustomer, bulkImportCustomers,
        bookings, invoices, orders, feedbacks, feedbacksLoading, fetchFeedbacks, archiveFeedback, updateFeedback, addFeedback, suppliers, segments, segmentsLoading, fetchSegments,
        addSegment, deleteSegment, fetchSegmentCustomers, shifts, catalogue,
        activeOutletId, setActiveOutletId,
        activeSalonId, setActiveSalonId,
        setOutlets, activeOutlet, fetchOutlets,

        addSupplier, updateSupplier, deleteSupplier,
        addOutlet, updateOutlet, deleteOutlet,
        roles, fetchRoles,
        fetchCustomerInitialData,
        fetchServices, fetchGroupedServices, fetchBookings, fetchInvoices, fetchOrders, fetchProducts, fetchProductCategories, fetchSuppliers,
        addStaff, updateStaff, deleteStaff, fetchStaff,
        addService, updateService, deleteService, toggleServiceStatus,
        fetchCategories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus,
        addBooking, updateBookingStatus, checkoutPOS,
        fetchShifts, addShift, updateShift,
        isInitializing,
        loyaltySettings, fetchLoyaltySettings,
        loyaltyPlans, fetchLoyaltyPlans,
        platformSettings, fetchPlatformSettings,
        updateSalon, fetchSalon,
        salonLoading: isInitializing,
        banners, setBanners,
        offers, setOffers,
        lookbook, setLookbook,
        experts, setExperts,
        productCategories, setProductCategories,
        nearbyOutlets, setNearbyOutlets,
        userSession,
        isPageLoading, setIsPageLoading
    }), [

        salon, outlets, outletsLoading, staff, services, categories, products, customers, customersMetadata, globalStats, customersLoading, fetchCustomers, addCustomer, deleteCustomer, updateCustomer, bulkImportCustomers,
        bookings, invoices, orders, feedbacks, feedbacksLoading, fetchFeedbacks, archiveFeedback, updateFeedback, addFeedback, suppliers, segments, segmentsLoading, fetchSegments, addSegment, deleteSegment, fetchSegmentCustomers,
        shifts, catalogue, activeOutletId, setActiveOutletId, activeSalonId, setActiveSalonId, setOutlets, activeOutlet, fetchOutlets, addSupplier, updateSupplier, deleteSupplier, addOutlet, updateOutlet, deleteOutlet,
        roles, fetchRoles,
        fetchCustomerInitialData,
        fetchServices, fetchGroupedServices, fetchBookings, fetchInvoices, fetchOrders, fetchProducts, fetchProductCategories, fetchSuppliers,
        addStaff, updateStaff, deleteStaff, fetchStaff,
        addService, updateService, deleteService, toggleServiceStatus,
        fetchCategories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus,
        addBooking, updateBookingStatus, checkoutPOS,
        fetchShifts, addShift, updateShift,
        isInitializing,
        loyaltySettings, fetchLoyaltySettings,
        loyaltyPlans, fetchLoyaltyPlans,
        platformSettings, fetchPlatformSettings,
        updateSalon, fetchSalon,
        banners, offers, lookbook, experts, productCategories, nearbyOutlets, userSession, isPageLoading
    ]);



    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlId = searchParams.get('tenantId');
        const urlOutletId = searchParams.get('outletId');

        const effectiveTid = String(urlId || activeSalonId || localStorage.getItem('active_salon_id') || '');
        const effectiveOid = String(urlOutletId || activeOutletId || localStorage.getItem('active_outlet_id') || '');

        if (urlId && urlId !== activeSalonId) {
            localStorage.setItem('active_salon_id', urlId);
            setActiveSalonId(urlId);
        }

        if (urlOutletId && urlOutletId !== activeOutletId) {
            localStorage.setItem('active_outlet_id', urlOutletId);
            setActiveOutletId(urlOutletId);
        }

        fetchPlatformSettings();

        // Skip guest/tenant initialization for auth routes, admin, stylist and superadmin routes
        const authRoutes = ['/login', '/register', '/admin/login', '/forgot-password'];
        const protectedPaths = ['/admin', '/superadmin', '/stylist'];

        if (authRoutes.includes(location.pathname) || protectedPaths.some(p => location.pathname.startsWith(p))) {
            // For protected paths, we only want to fetch data if authenticated
            if (!(isAuthenticated || isCustomerAuthenticated)) {
                // Special case: never initialize for superadmin routes if we are not yet authenticated as a user
                setIsInitializing(false);
                return;
            }
        }

        // Final sanity check for superadmin route
        if (location.pathname.startsWith('/superadmin')) {
            setIsInitializing(false);
            return;
        }

        if ((isAuthenticated || isCustomerAuthenticated) && user?.role !== 'superadmin') {
            // Prevent double initialization if already has data for this salon AND outlet, or already fetching
            const currentSalonId = String(salon?._id || '');
            const currentOutletId = String(localStorage.getItem('last_initialized_outlet_id') || '');
 
            if (initializationRef.current) return;
            if (salon && currentSalonId === effectiveTid && currentOutletId === effectiveOid) return;
 
            localStorage.setItem('last_initialized_outlet_id', effectiveOid);
            fetchCustomerInitialData({ background: skipNextInitializationRef.current });
            skipNextInitializationRef.current = false;
        } else if (effectiveTid) {
            if (lastInitializedId.current === effectiveTid) return;
            if (isInitializing || initializationRef.current) return;
 
            const initGuest = async () => {
                try {
                    initializationRef.current = true;
                    lastInitializedId.current = effectiveTid;
                    await fetchCustomerInitialData({ background: skipNextInitializationRef.current });
                    skipNextInitializationRef.current = false;
                } catch (err) {
                    console.error("Guest initialization failed:", err);
                } finally {
                    initializationRef.current = false;
                    setIsInitializing(false);
                }
            };
            initGuest();
        } else {
            setIsInitializing(false);
        }
    }, [isAuthenticated, isCustomerAuthenticated, activeSalonId, activeOutletId, fetchCustomerInitialData]);

    return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export const useBusiness = () => useContext(BusinessContext);
