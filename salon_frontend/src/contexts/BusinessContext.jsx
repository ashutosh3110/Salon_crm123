import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCustomerAuth } from './CustomerAuthContext';
import api from '../services/api';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const { customer } = useCustomerAuth();
    const [salon, setSalon] = useState(null);
    const [salonLoading, setSalonLoading] = useState(false);

    const [outlets, setOutlets] = useState([]);
    const [outletsLoading, setOutletsLoading] = useState(false);

    const [staff, setStaff] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);

    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [customers, setCustomers] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbacksLoading, setFeedbacksLoading] = useState(false);

    const [suppliers, setSuppliers] = useState([]);
    const [suppliersLoading, setSuppliersLoading] = useState(false);

    const [segments, setSegments] = useState([]);
    const [segmentsLoading, setSegmentsLoading] = useState(false);

    const [activeOutletId, setActiveOutletId] = useState(() => {
        return localStorage.getItem('active_outlet_id') || null;
    });

    const activeOutlet =
        outlets.find((o) => String(o._id || o.id) === String(activeOutletId || '')) || null;

    // Customer app: pick a default outlet so shop filters (outlet-specific stock) work
    useEffect(() => {
        if (typeof window === 'undefined' || !window.location.pathname.startsWith('/app')) return;
        const hasCustomerSession = customer || localStorage.getItem('customer_token');
        if (!hasCustomerSession) return;
        if (!outlets?.length || activeOutletId) return;
        const first = outlets[0];
        const id = first?._id || first?.id;
        if (!id) return;
        const sid = String(id);
        setActiveOutletId(sid);
        try {
            localStorage.setItem('active_outlet_id', sid);
        } catch {
            /* ignore */
        }
    }, [customer, outlets, activeOutletId]);

    // Fetch Initial Data on login (admin/staff)
    useEffect(() => {
        if (isAuthenticated) {
            if (!salon && !salonLoading) fetchSalon();
            fetchOutlets();
            fetchStaff();
            fetchServices();
            fetchCategories();
            fetchCustomers();
            fetchBookings();
            fetchProducts();
            fetchSegments();
            fetchFeedbacks();
            fetchSuppliers();
        }
    }, [isAuthenticated]);

    // Fetch outlets when customer logs in (for /app)
    useEffect(() => {
        if (customer && typeof window !== 'undefined' && window.location.pathname.startsWith('/app')) {
            fetchOutlets();
        }
    }, [customer]);

    const fetchSalon = async () => {
        setSalonLoading(true);
        try {
            const response = await api.get('/tenants/me');
            if (response.data.success) {
                setSalon(response.data.data);
            }
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch salon:', error);
        } finally {
            setSalonLoading(false);
        }
    };

    const fetchOutlets = async (opts = {}) => {
        setOutletsLoading(true);
        try {
            const params = {};
            const hasLocationFilter = opts.lat != null && opts.lng != null && opts.radius != null;
            if (hasLocationFilter) {
                params.lat = opts.lat;
                params.lng = opts.lng;
                params.radius = opts.radius;
            }
            const response = await api.get('/outlets', { params });
            const data = response.data || [];
            setOutlets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch outlets:', error);
            if (opts.lat != null) setOutlets([]);
        } finally {
            setOutletsLoading(false);
        }
    };

    const fetchCustomers = async () => {
        setCustomersLoading(true);
        try {
            const response = await api.get('/clients');
            setCustomers(response.data.results || response.data || []);
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch customers:', error);
        } finally {
            setCustomersLoading(false);
        }
    };

    const fetchSegments = async () => {
        setSegmentsLoading(true);
        try {
            const response = await api.get('/segments');
            const data = response?.data?.success ? response.data.data : response.data?.data || response.data;
            setSegments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch segments:', error);
            setSegments([]);
        } finally {
            setSegmentsLoading(false);
        }
    };

    const fetchFeedbacks = async () => {
        setFeedbacksLoading(true);
        try {
            const response = await api.get('/feedbacks');
            const list = response?.data?.success ? response.data.data : response?.data?.data || response?.data;
            if (Array.isArray(list)) {
                setFeedbacks(list.map((fb) => {
                    const ratingNum = Number(fb.rating || 0);
                    const sentiment = fb.sentiment || (ratingNum >= 4 ? 'Positive' : (ratingNum === 3 ? 'Neutral' : 'Negative'));
                    return {
                        ...fb,
                        id: fb._id ? String(fb._id) : fb.id,
                        sentiment,
                        date: fb.createdAt || fb.date,
                    };
                }));
            } else {
                setFeedbacks([]);
            }
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch feedbacks:', error);
            setFeedbacks([]);
        } finally {
            setFeedbacksLoading(false);
        }
    };

    // Auto-refresh feedback list only on feedback screens.
    useEffect(() => {
        if (!isAuthenticated) return;
        if (typeof window === 'undefined') return;
        const path = window.location.pathname || '';
        const isFeedbackScreen = path.includes('/crm/feedback') || path.includes('/manager/feedback');
        if (!isFeedbackScreen) return;

        const t = setInterval(() => {
            fetchFeedbacks().catch(() => {});
        }, 60000);

        return () => clearInterval(t);
    }, [isAuthenticated]);

    const fetchSegmentCustomers = async (segmentId, { limit = 50 } = {}) => {
        const response = await api.get(`/segments/${segmentId}/customers`, { params: { limit } });
        const data = response?.data?.success ? response.data.data : response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    };

    const normalizeBooking = (b) => {
        if (!b) return b;
        return {
            ...b,
            client: b.client || b.clientId || null,
            service: b.service || b.serviceId || null,
            staff: b.staff || b.staffId || null,
            outletName: b.outletName || b.outletId?.name || '',
        };
    };

    const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
            const response = await api.get('/bookings');
            const rows = response.data.results || response.data || [];
            setBookings((Array.isArray(rows) ? rows : []).map(normalizeBooking));
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch bookings:', error);
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data.results || response.data || []);
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch products:', error);
        } finally {
            setProductsLoading(false);
        }
    };

    const updateSalon = async (data) => {
        try {
            const response = await api.patch('/tenants/me', data);
            if (response.data?.success && response.data.data) {
                setSalon(response.data.data);
                return response.data.data;
            }
            const msg = response.data?.message || 'Update failed';
            throw new Error(msg);
        } catch (error) {
            console.error('[BusinessContext] Update salon failed:', error);
            const msg = error.response?.data?.message || error.message;
            throw new Error(msg);
        }
    };

    const fetchStaff = async () => {
        setStaffLoading(true);
        try {
            const response = await api.get('/users', { params: { limit: 200, page: 1 } });
            const staffRaw = response?.data?.success ? response.data.data : response.data;
            const staffList = Array.isArray(staffRaw) ? staffRaw : (staffRaw?.results || []);
            setStaff(staffList.filter((u) => u.role !== 'superadmin'));
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch staff:', error);
            setStaff([]);
        } finally {
            setStaffLoading(false);
        }
    };

    const fetchServices = async () => {
        setServicesLoading(true);
        try {
            const response = await api.get('/services');
            setServices(response.data.results || response.data || []);
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch services:', error);
        } finally {
            setServicesLoading(false);
        }
    };

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await api.get('/services/categories');
            setCategories(response.data || []);
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Persist active outlet ID to localStorage
    useEffect(() => {
        if (activeOutletId) localStorage.setItem('active_outlet_id', activeOutletId);
        else localStorage.removeItem('active_outlet_id');
    }, [activeOutletId]);

    // Actions
    const addOutlet = async (outletData) => {
        try {
            const response = await api.post('/outlets', outletData);
            setOutlets(prev => [response.data, ...prev]);
            return response.data;
        } catch (error) {
            console.error('[BusinessContext] Add outlet failed:', error);
            throw error;
        }
    };

    const updateOutlet = async (id, data) => {
        try {
            const response = await api.patch(`/outlets/${id}`, data);
            setOutlets(prev => prev.map(o => (o._id === id || o.id === id) ? response.data : o));
            return response.data;
        } catch (error) {
            console.error('[BusinessContext] Update outlet failed:', error);
            throw error;
        }
    };

    const deleteOutlet = async (id) => {
        try {
            await api.delete(`/outlets/${id}`);
            setOutlets(prev => prev.filter(o => o._id !== id && o.id !== id));
        } catch (error) {
            console.error('[BusinessContext] Delete outlet failed:', error);
            throw error;
        }
    };
    const toggleOutletStatus = (id) => setOutlets(prev => prev.map(o => o._id === id ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o));

    const addStaff = async (member) => {
        try {
            const response = await api.post('/users', member);
            const newStaff = response.data.success ? response.data.data : response.data;
            setStaff(prev => [newStaff, ...prev]);
            return newStaff;
        } catch (error) {
            console.error('[BusinessContext] Add staff failed:', error);
            throw error;
        }
    };

    const updateStaff = async (id, data) => {
        try {
            const response = await api.patch(`/users/${id}`, data);
            const updatedStaff = response.data.success ? response.data.data : response.data;
            setStaff(prev => prev.map(s => (s._id === id || s.id === id) ? updatedStaff : s));
            return updatedStaff;
        } catch (error) {
            console.error('[BusinessContext] Update staff failed:', error);
            throw error;
        }
    };

    const deleteStaff = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            setStaff(prev => prev.filter(s => (s._id !== id && s.id !== id)));
        } catch (error) {
            console.error('[BusinessContext] Delete staff failed:', error);
            throw error;
        }
    };

    const addService = async (newService) => {
        try {
            const response = await api.post('/services', newService);
            setServices(prev => [response.data, ...prev]);
            return response.data;
        } catch (error) {
            console.error('[BusinessContext] Add service failed:', error);
            throw error;
        }
    };

    const updateService = async (id, updatedData) => {
        try {
            const response = await api.patch(`/services/${id}`, updatedData);
            setServices(prev => prev.map(s => (s._id === id || s.id === id) ? response.data : s));
            return response.data;
        } catch (error) {
            console.error('[BusinessContext] Update service failed:', error);
            throw error;
        }
    };

    const deleteService = async (id) => {
        try {
            await api.delete(`/services/${id}`);
            setServices(prev => prev.filter(s => (s._id !== id && s.id !== id)));
        } catch (error) {
            console.error('[BusinessContext] Delete service failed:', error);
            throw error;
        }
    };

    const toggleServiceStatus = async (id) => {
        const item = services.find(s => s._id === id || s.id === id);
        if (!item) return;
        const newStatus = item.status === 'active' ? 'inactive' : 'active';
        await updateService(id, { status: newStatus });
    };

    const addCategory = async (data) => {
        try {
            const response = await api.post('/services/categories', data);
            setCategories(prev => [response.data, ...prev]);
            return response.data;
        } catch (error) {
            console.error('[BusinessContext] Add category failed:', error);
            throw error;
        }
    };

    const updateCategory = async (id, data) => {
        try {
            const response = await api.patch(`/services/categories/${id}`, data);
            setCategories(prev => prev.map(c => (c._id === id || c.id === id) ? response.data : c));
            return response.data;
        } catch (error) {
            console.error('[BusinessContext] Update category failed:', error);
            throw error;
        }
    };

    const deleteCategory = async (id) => {
        try {
            await api.delete(`/services/categories/${id}`);
            setCategories(prev => prev.filter(c => (c._id !== id && c.id !== id)));
        } catch (error) {
            console.error('[BusinessContext] Delete category failed:', error);
            throw error;
        }
    };

    const toggleCategoryStatus = async (id) => {
        const item = categories.find(c => c._id === id || c.id === id);
        if (!item) return;
        const newStatus = item.status === 'active' ? 'inactive' : 'active';
        await updateCategory(id, { status: newStatus });
    };

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

    const fetchSuppliers = async () => {
        setSuppliersLoading(true);
        try {
            const response = await api.get('/suppliers');
            const raw = response.data?.data ?? response.data ?? [];
            const list = Array.isArray(raw) ? raw : [];
            setSuppliers(
                list.map((s) => ({
                    ...s,
                    id: s.id || s._id,
                    due: typeof s.due === 'number' ? s.due : 0,
                    status: s.status || 'Active',
                }))
            );
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch suppliers:', error);
            setSuppliers([]);
        } finally {
            setSuppliersLoading(false);
        }
    };

    const addSupplier = async (supplier) => {
        const payload = {
            name: supplier?.name,
            contact: supplier?.contact || '',
            gstin: supplier?.gstin || '',
            phone: supplier?.phone || '',
            email: supplier?.email || '',
            address: supplier?.address || '',
        };
        const response = await api.post('/suppliers', payload);
        const created = response.data?.data;
        if (created?._id || created?.id) {
            setSuppliers((prev) => [
                {
                    ...created,
                    id: created.id || created._id,
                    due: typeof created.due === 'number' ? created.due : 0,
                    status: created.status || 'Active',
                },
                ...prev,
            ]);
        } else {
            await fetchSuppliers();
        }
        return created;
    };

    const updateSupplier = async (id, data) => {
        const payload = {
            name: data?.name,
            contact: data?.contact,
            gstin: data?.gstin,
            phone: data?.phone,
            email: data?.email,
            address: data?.address,
        };
        const cleaned = Object.fromEntries(
            Object.entries(payload).filter(([, v]) => v !== undefined)
        );
        const response = await api.patch(`/suppliers/${id}`, cleaned);
        const updated = response.data?.data;
        if (updated) {
            setSuppliers((prev) =>
                prev.map((s) => {
                    const sid = s.id || s._id;
                    if (String(sid) !== String(id)) return s;
                    return {
                        ...s,
                        ...updated,
                        id: updated.id || updated._id || id,
                        due: typeof updated.due === 'number' ? updated.due : s.due,
                        status: updated.status ?? s.status,
                    };
                })
            );
        } else {
            await fetchSuppliers();
        }
        return updated;
    };

    const deleteSupplier = async (id) => {
        await api.delete(`/suppliers/${id}`);
        setSuppliers((prev) => prev.filter((s) => String(s.id || s._id) !== String(id)));
    };

    const addFeedback = async (feedback) => {
        try {
            const payload = {
                customerName: feedback?.customerName,
                rating: feedback?.rating,
                comment: feedback?.comment,
                service: feedback?.service,
                staffName: feedback?.staffName,
                images: feedback?.images,
            };
            const res = await api.post('/feedbacks', payload);
            const created = res?.data?.data;

            // Keep admin UI synced if feedback list is already loaded.
            if (isAuthenticated && created?._id) {
                setFeedbacks(prev => [{
                    ...created,
                    id: String(created._id),
                    date: created.createdAt || created.date,
                }, ...prev]);
            }

            return created;
        } catch (error) {
            console.error('[BusinessContext] Add feedback failed:', error);
            return null;
        }
    };

    const updateFeedback = async (id, data) => {
        try {
            await api.patch(`/feedbacks/${id}`, data);
            await fetchFeedbacks();
        } catch (error) {
            console.error('[BusinessContext] Update feedback failed:', error);
            return null;
        }
    };

    const archiveFeedback = async (id) => {
        try {
            await api.patch(`/feedbacks/${id}/archive`);
            await fetchFeedbacks();
        } catch (error) {
            console.error('[BusinessContext] Archive feedback failed:', error);
            return null;
        }
    };

    const deleteFeedback = async (id) => {
        // Backend delete route isn't implemented in this build.
        // Keep UI consistent by archiving instead.
        return archiveFeedback(id);
    };

    const addSegment = async (segment) => {
        const payload = {
            name: segment?.name,
            rule: segment?.rule,
            iconName: segment?.iconName,
            color: segment?.color,
        };
        const response = await api.post('/segments', payload);
        if (response?.data?.success) {
            await fetchSegments();
            return response.data.data;
        }
        await fetchSegments();
        return response?.data?.data || null;
    };

    const deleteSegment = async (id) => {
        await api.delete(`/segments/${id}`);
        await fetchSegments();
        return true;
    };

    const addBooking = async (booking) => {
        try {
            const response = await api.post('/bookings', booking);
            const created = normalizeBooking(response.data);
            setBookings(prev => [created, ...prev]);
            return created;
        } catch (error) {
            console.error('[BusinessContext] Add booking failed:', error);
            throw error;
        }
    };
    const updateBookingStatus = async (id, status) => {
        try {
            const response = await api.patch(`/bookings/${id}`, { status });
            const updated = normalizeBooking(response.data);
            setBookings(prev => prev.map(b => (b._id === id ? updated : b)));
            return updated;
        } catch (error) {
            console.error('[BusinessContext] Update booking status failed:', error);
            throw error;
        }
    };

    const value = {
        salon, salonLoading, updateSalon, fetchSalon,
        staff, staffLoading, addStaff, updateStaff, deleteStaff, fetchStaff,
        services, servicesLoading, addService, updateService, deleteService, toggleServiceStatus, fetchServices,
        categories, categoriesLoading, addCategory, updateCategory, deleteCategory, toggleCategoryStatus, fetchCategories,
        outlets, outletsLoading, fetchOutlets, setOutlets, products, customers,
        addOutlet, updateOutlet, deleteOutlet, toggleOutletStatus,
        addProduct, deleteProduct, toggleProductStatus,
        addCustomer, updateCustomer, deleteCustomer,
        feedbacks,
        addFeedback,
        updateFeedback,
        archiveFeedback,
        deleteFeedback,
        fetchFeedbacks,
        suppliers,
        suppliersLoading,
        fetchSuppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        segments,
        segmentsLoading,
        fetchSegments,
        fetchSegmentCustomers,
        addSegment,
        deleteSegment,
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
