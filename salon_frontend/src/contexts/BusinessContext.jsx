import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
    const { isAuthenticated } = useAuth();
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

    const activeOutlet = outlets.find(o => o._id === activeOutletId) || null;

    // Fetch Initial Data on login
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
        }
    }, [isAuthenticated]);

    const fetchSalon = async () => {
        setSalonLoading(true);
        try {
            const response = await api.get('/tenant/me');
            if (response.data.success) {
                setSalon(response.data.data);
            }
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch salon:', error);
        } finally {
            setSalonLoading(false);
        }
    };

    const fetchOutlets = async () => {
        setOutletsLoading(true);
        try {
            const response = await api.get('/outlets');
            setOutlets(response.data || []);
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch outlets:', error);
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

    const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
            const response = await api.get('/bookings');
            setBookings(response.data.results || response.data || []);
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
            const response = await api.patch('/tenant/me', data);
            if (response.data.success) {
                setSalon(response.data.data);
                return response.data.data;
            }
        } catch (error) {
            console.error('[BusinessContext] Update salon failed:', error);
            throw error;
        }
    };

    const fetchStaff = async () => {
        setStaffLoading(true);
        try {
            const response = await api.get('/users');
            const staffData = response.data.success ? response.data.data : response.data;
            setStaff(staffData.filter(u => u.role !== 'superadmin'));
        } catch (error) {
            console.error('[BusinessContext] Failed to fetch staff:', error);
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
        salon, salonLoading, updateSalon, fetchSalon,
        staff, staffLoading, addStaff, updateStaff, deleteStaff, fetchStaff,
        services, servicesLoading, addService, updateService, deleteService, toggleServiceStatus, fetchServices,
        categories, categoriesLoading, addCategory, updateCategory, deleteCategory, toggleCategoryStatus, fetchCategories,
        outlets, products, customers,
        addOutlet, updateOutlet, deleteOutlet, toggleOutletStatus,
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
