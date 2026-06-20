import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import inventoryData from '../data/inventoryData.json';
import { useFinance } from './FinanceContext';
import { useBusiness } from './BusinessContext';
import { useCustomerAuth } from './CustomerAuthContext';
import { useAuth } from './AuthContext';

import api from '../services/api';

const InventoryContext = createContext();

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};

// ── Barcode Generator ─────────────────────────────────────────
export const generateEAN13 = (prefix = '890') => {
    const rand = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
    const digits = (prefix + rand).split('').map(Number);
    const checksum = digits.reduce((sum, d, i) => sum + d * (i % 2 === 0 ? 1 : 3), 0);
    const check = (10 - (checksum % 10)) % 10;
    return prefix + rand + check;
};

// ── Initial Data Helpers ─────────────────────────────────────
const getInitialState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
};

const totalStock = (stockByOutlet) =>
    Object.values(stockByOutlet || {}).reduce((s, v) => s + v, 0);

const computeStatus = (total, minStock, expiryDate) => {
    if (expiryDate) {
        const remainingDays = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (remainingDays <= 0) return 'Expired';
        if (remainingDays <= 30) return 'Near Expiry';
    }
    if (total <= minStock * 0.5) return 'Critical';
    if (total <= minStock) return 'Low Stock';
    return 'In Stock';
};

const INITIAL_PRODUCTS = inventoryData.products || [];
const INITIAL_MOVEMENTS = inventoryData.movements || [];
const INITIAL_PURCHASES = inventoryData.purchases || [];
const INITIAL_TRANSFERS = inventoryData.transfers || [];

const enrichProduct = (p) => {
    const stock = totalStock(p.stockByOutlet);
    const stockStatus = computeStatus(stock, p.minStock, p.expiryDate);
    const raw = String(p.status ?? '').toLowerCase();
    const listingStatus = raw === 'inactive' ? 'inactive' : 'active';
    return { ...p, stock, stockStatus, status: listingStatus };
};

const normalizeProduct = (p) => {
    const id = p?._id || p?.id;
    const ext = p?.extended && typeof p.extended === 'object' ? p.extended : {};
    const minStock = Number(p?.minStock ?? ext.threshold ?? p?.threshold ?? 5);
    const stockByOutlet = (p?.stockByOutlet && Object.keys(p.stockByOutlet).length > 0) ? p.stockByOutlet : { main: Number(p?.stock || 0) };
    const { extended: _dropExtended, ...base } = p || {};
    return enrichProduct({ 
        ...base, 
        ...ext, 
        id, 
        _id: id, 
        sellingPrice: Number(p?.sellingPrice ?? p?.price ?? ext.sellingPrice ?? 0), 
        price: Number(p?.price ?? p?.sellingPrice ?? ext.price ?? 0), 
        threshold: ext.threshold != null ? ext.threshold : minStock, 
        minStock, 
        stockByOutlet, 
        gender: String(p?.gender ?? ext.gender ?? 'all').toLowerCase(), 
        appCategory: p?.appCategory ?? ext.appCategory, 
        outletIds: (Array.isArray(p?.outletIds) ? p.outletIds : (Array.isArray(ext.outletIds) ? ext.outletIds : [])).map((x) => String(x)),
        likes: Number(p?.likes || 0),
        likedBy: p?.likedBy || [],
        category: p?.categoryId?.name || p?.category || 'General',
        categoryId: p?.categoryId?._id || p?.categoryId || '',
        images: Array.isArray(p?.images) ? p.images : (p?.appImage ? [p.appImage] : [])
    });
};

const normalizeShopCat = (c) => {
    const id = String(c?._id ?? c?.id ?? '');
    return { ...c, id, _id: id, name: c?.name ?? '', image: c?.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000', sortOrder: Number(c?.sortOrder ?? 0), count: 0 };
};

const normalizeTransfer = (t) => {
    const id = t._id || t.id;
    const dateObj = new Date(t.createdAt || Date.now());
    const date = dateObj.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    return {
        id,
        _id: id,
        productName: t.productId?.name || 'Unknown Product',
        sku: t.productId?.sku || '',
        from: t.fromOutletId?._id || t.fromOutletId,
        to: t.toOutletId?._id || t.toOutletId,
        qty: t.quantity,
        reason: t.reason,
        status: t.status === 'COMPLETED' ? 'Completed' : t.status,
        date
    };
};

export const InventoryProvider = ({ children }) => {
    const { addExpense } = useFinance();
    const { outlets: outletsSnapshot = [], salon, activeSalonId } = useBusiness();
    const { user: dashboardUser, isAuthenticated: isPlanActive } = useAuth();
    const { isCustomerAuthenticated } = useCustomerAuth();

    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState(() => getInitialState('inv_movements', INITIAL_MOVEMENTS));
    const [purchases, setPurchases] = useState(() => getInitialState('inv_purchases', INITIAL_PURCHASES));
    const [transfers, setTransfers] = useState([]);
    const [outlets, setOutlets] = useState(() => getInitialState('inv_outlets', inventoryData.outlets));
    const [saleRecords, setSaleRecords] = useState(() => getInitialState('inv_sale_records', []));
    const [stockInHistory, setStockInHistory] = useState([]);
    const [shopCategories, setShopCategories] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [supplierInvoices, setSupplierInvoices] = useState([]);
    const [stockHistory, setStockHistory] = useState([]);
    const [summary, setSummary] = useState({ totalProducts: 0, totalStockValue: 0, potentialRevenue: 0, outOfStock: 0 });
    const [loading, setLoading] = useState(false);
    const initializationRef = useRef(false);


    
    // Standardize salonId resolution for customer side
    const getEffectiveSalonId = useCallback(() => {
        return activeSalonId || salon?._id || localStorage.getItem('active_salon_id');
    }, [activeSalonId, salon?._id]);

    const fetchProducts = useCallback(async () => {
        try {
            const salonId = dashboardUser?.salonId || getEffectiveSalonId();
            if (!salonId) return;
            const res = await api.get('/products', { params: { salonId } });
            const rows = res?.data?.data || [];
            setProducts(rows.map(normalizeProduct));
        } catch (err) { 
            console.error('Fetch products failed:', err);
            setProducts([]); 
        }
    }, [dashboardUser, getEffectiveSalonId]);

    const fetchShopCategories = useCallback(async () => {
        try {
            const salonId = dashboardUser?.salonId || getEffectiveSalonId();
            if (!salonId) return;
            // Fetch real product categories and map them to the shop categories format
            const res = await api.get('/product-categories', { params: { salonId } });
            const rows = res?.data?.data || [];
            if (Array.isArray(rows)) {
                setShopCategories(rows.filter(c => c.status === 'active').map(normalizeShopCat));
            } else {
                setShopCategories([]);
            }
        } catch (err) { 
            console.error('Fetch shop categories failed:', err);
            setShopCategories([]); 
        }
    }, [dashboardUser, getEffectiveSalonId]);

    const fetchProductCategories = useCallback(async () => {
        try {
            const salonId = dashboardUser?.salonId || getEffectiveSalonId();
            if (!salonId) return;
            const res = await api.get('/product-categories', { params: { salonId } });
            const rows = res?.data?.data || [];
            setProductCategories(rows);
        } catch (err) { 
            console.error('Fetch product categories failed:', err);
            setProductCategories([]); 
        }
    }, [dashboardUser, getEffectiveSalonId]);

    const fetchStockHistory = useCallback(async (params = {}) => {
        try {
            const res = await api.get('/inventory/history', { params });
            setStockHistory(res.data?.data || []);
        } catch { setStockHistory([]); }
    }, []);

    const fetchInventorySummary = useCallback(async () => {
        try {
            const res = await api.get('/inventory/summary');
            setSummary(res.data?.data || { totalProducts: 0, totalStockValue: 0, potentialRevenue: 0, outOfStock: 0 });
        } catch { }
    }, []);

    const updateStock = async (stockData) => {
        try {
            const res = await api.post('/inventory/update-stock', stockData);
            if (res.data.success) {
                toast.success(res.data.message || 'Stock updated');
                fetchProducts();
                fetchInventorySummary();
                return res.data;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update stock');
            throw error;
        }
    };

    const fetchTransfers = useCallback(async () => {
        try {
            const salonId = dashboardUser?.salonId || getEffectiveSalonId();
            if (!salonId) return;
            const res = await api.get('/inventory/transfers', { params: { salonId } });
            const rows = res?.data?.data || [];
            setTransfers(rows.map(normalizeTransfer));
        } catch (err) {
            console.error('Fetch transfers failed:', err);
            setTransfers([]);
        }
    }, [dashboardUser, getEffectiveSalonId]);

    const transferStock = async (transferData) => {
        try {
            const body = {
                productId: transferData.productId,
                fromOutletId: transferData.fromOutletId || transferData.fromOutlet,
                toOutletId: transferData.toOutletId || transferData.toOutlet,
                quantity: Number(transferData.quantity || transferData.qty),
                reason: transferData.reason,
                notes: transferData.notes || ''
            };

            // Lookup product ID using SKU if productId is missing
            if (!body.productId && transferData.sku) {
                const found = products.find(p => p.sku === transferData.sku);
                if (found) {
                    body.productId = found._id || found.id;
                }
            }

            if (!body.productId) {
                throw new Error('Product selection is required');
            }

            const res = await api.post('/inventory/transfer', body);
            if (res.data.success) {
                toast.success(res.data.message || 'Stock transferred successfully');
                fetchProducts();
                fetchTransfers();
                fetchInventorySummary();
                return { success: true };
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to transfer stock';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const lastFetchedRef = useRef({ salonId: null, timestamp: 0 });

    useEffect(() => {
        const isCustomerPath = window.location.pathname.startsWith('/app');
        if (isCustomerPath) return;

        const isStaffWithInventoryAccess = dashboardUser && ['admin', 'manager', 'receptionist'].includes(String(dashboardUser.role).toLowerCase());
        const canFetchPrivate = (dashboardUser && isPlanActive && isStaffWithInventoryAccess);
        const canFetchPublic = (salon?._id || activeSalonId || localStorage.getItem('active_salon_id'));
        const currentSalonId = dashboardUser?.salonId || salon?._id || activeSalonId || localStorage.getItem('active_salon_id');

        if (!currentSalonId) return;

        // Prevent redundant fetches within a short timeframe (2 seconds)
        const now = Date.now();
        if (lastFetchedRef.current.salonId === currentSalonId && (now - lastFetchedRef.current.timestamp < 2000)) {
            return;
        }

        if (canFetchPrivate || canFetchPublic || isCustomerAuthenticated) {
            fetchProducts();
            fetchShopCategories();
            fetchProductCategories();
            
            if (canFetchPrivate) {
                fetchStockHistory();
                fetchInventorySummary();
                fetchTransfers();
            }
            lastFetchedRef.current = { salonId: currentSalonId, timestamp: now };
        }
    }, [dashboardUser, isPlanActive, isCustomerAuthenticated, salon?._id, activeSalonId, fetchProducts, fetchShopCategories, fetchProductCategories, fetchStockHistory, fetchInventorySummary, fetchTransfers]);

    const toggleProductLike = async (productId) => {
        if (!isCustomerAuthenticated) return;
        
        try {
            const res = await api.post(`/products/${productId}/like`);
            if (res.data.success) {
                fetchProducts(); // Refresh to see updated likes
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const addProductCategory = async (d) => { 
        try { 
            const r = await api.post('/product-categories', d); 
            setProductCategories(p => [r.data.data, ...p]); 
            toast.success('Category vector defined');
            return r.data.data; 
        } catch (e) { 
            toast.error('Failed to create category');
            throw e; 
        } 
    };
    
    const updateProductCategory = async (id, d) => { 
        try { 
            const r = await api.put(`/product-categories/${id}`, d); 
            setProductCategories(p => p.map(x => (x._id === id) ? r.data.data : x)); 
            toast.success('Category protocols updated');
            return r.data.data; 
        } catch (e) { 
            toast.error('Update failure');
            throw e; 
        } 
    };
    
    const deleteProductCategory = async (id) => { 
        try { 
            await api.delete(`/product-categories/${id}`); 
            setProductCategories(p => p.filter(x => (x._id !== id))); 
            toast.success('Category decommissioned');
        } catch (e) { 
            toast.error('Deletion restricted');
            throw e; 
        } 
    };

    const addProduct = async (d) => { 
        try { 
            const r = await api.post('/products', d); 
            setProducts(p => [normalizeProduct(r.data.data), ...p]); 
            toast.success('New SKU neutralized & stored');
            return r.data.data; 
        } catch (e) { 
            toast.error('Production failure');
            throw e; 
        } 
    };
    
    const updateProduct = async (id, d) => { 
        try { 
            const r = await api.put(`/products/${id}`, d); 
            setProducts(p => p.map(x => (x.id === id || x._id === id) ? normalizeProduct(r.data.data) : x)); 
            toast.success('Asset parameters synchronized');
            return r.data.data; 
        } catch (e) { 
            toast.error('Sync failure');
            throw e; 
        } 
    };
    
    const deleteProduct = async (id) => { 
        try { 
            await api.delete(`/products/${id}`); 
            setProducts(p => p.filter(x => (x.id !== id && x._id !== id))); 
            toast.success('Asset purged from registry');
        } catch (e) { 
            toast.error('Purge failed');
            throw e; 
        } 
    };

    const effectiveOutlets = useMemo(() => {
        return (outletsSnapshot && outletsSnapshot.length > 0) ? outletsSnapshot : outlets;
    }, [outletsSnapshot, outlets]);

    const value = {
        products, movements, purchases, transfers, outlets: effectiveOutlets, saleRecords, stockHistory, shopCategories, productCategories, supplierInvoices, loading, summary,
        fetchProducts, addProduct, updateProduct, deleteProduct, fetchShopCategories, updateStock, fetchStockHistory, fetchInventorySummary,
        fetchProductCategories, addProductCategory, updateProductCategory, deleteProductCategory,
        toggleProductLike, fetchTransfers, transferStock,
        lowStockItems: products.filter(p => p.stock <= p.minStock),
        stats: { 
            totalProducts: summary.totalProducts || products.length, 
            skuCount: products.length,
            outletCount: effectiveOutlets.length,
            lowStockCount: products.filter(p => p.stock <= p.minStock).length, 
            totalValue: summary.totalStockValue || products.reduce((acc, p) => acc + (p.stock * (p.costPrice || 0)), 0),
            outOfStock: summary.outOfStock
        }
    };

    return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
