import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import inventoryData from '../data/inventoryData.json';
import { useFinance } from './FinanceContext';
import { useBusiness } from './BusinessContext';
import { useCustomerAuth } from './CustomerAuthContext';
import { useAuth } from './AuthContext';

import mockApi from '../services/mock/mockApi';
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
    const stockByOutlet = p?.stockByOutlet || { main: Number(p?.stock || 0) };
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
        likedBy: p?.likedBy || []
    });
};

const normalizeShopCat = (c) => {
    const id = String(c?._id ?? c?.id ?? '');
    return { ...c, id, _id: id, name: c?.name ?? '', image: c?.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000', sortOrder: Number(c?.sortOrder ?? 0), count: 0 };
};

export const InventoryProvider = ({ children }) => {
    const { addExpense } = useFinance();
    const { outletsSnapshot = [], salon, activeSalonId } = useBusiness();
    const { user: dashboardUser, isPlanActive } = useAuth();
    const { isCustomerAuthenticated } = useCustomerAuth();

    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState(() => getInitialState('inv_movements', INITIAL_MOVEMENTS));
    const [purchases, setPurchases] = useState(() => getInitialState('inv_purchases', INITIAL_PURCHASES));
    const [transfers, setTransfers] = useState(() => getInitialState('inv_transfers', INITIAL_TRANSFERS));
    const [outlets, setOutlets] = useState(() => getInitialState('inv_outlets', inventoryData.outlets));
    const [saleRecords, setSaleRecords] = useState(() => getInitialState('inv_sale_records', []));
    const [stockInHistory, setStockInHistory] = useState([]);
    const [shopCategories, setShopCategories] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [supplierInvoices, setSupplierInvoices] = useState([]);
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

    const fetchStockInHistory = useCallback(async () => {
        try {
            const res = await mockApi.get('/inventory/stock-in/history');
            const rows = res?.data?.results || res?.data?.data || res?.data || [];
            setStockInHistory(Array.isArray(rows) ? rows : []);
        } catch { setStockInHistory([]); }
    }, []);

    const fetchSupplierInvoices = useCallback(async () => {
        try {
            const res = await mockApi.get('/suppliers/invoices');
            const rows = res?.data?.results || res?.data?.data || res?.data || [];
            setSupplierInvoices(Array.isArray(rows) ? rows : []);
        } catch { setSupplierInvoices([]); }
    }, []);

    useEffect(() => {
        const isCustomerPath = window.location.pathname.startsWith('/app');
        const canFetchPublic = isCustomerPath && (salon?._id || activeSalonId || localStorage.getItem('active_salon_id'));
        const canFetchPrivate = (dashboardUser && isPlanActive);

        if (canFetchPrivate || canFetchPublic || isCustomerAuthenticated) {
            fetchProducts();
            fetchShopCategories();
            fetchProductCategories();
            
            if (canFetchPrivate) {
                fetchStockInHistory();
                fetchSupplierInvoices();
            }
        }
    }, [dashboardUser, isPlanActive, isCustomerAuthenticated, salon, activeSalonId, fetchProducts, fetchShopCategories, fetchProductCategories, fetchStockInHistory, fetchSupplierInvoices]);

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

    const value = {
        products, movements, purchases, transfers, outlets, saleRecords, stockInHistory, shopCategories, productCategories, supplierInvoices, loading,
        fetchProducts, addProduct, updateProduct, deleteProduct, fetchShopCategories,
        fetchProductCategories, addProductCategory, updateProductCategory, deleteProductCategory,
        toggleProductLike,
        lowStockItems: products.filter(p => p.stock <= p.minStock),
        stats: { totalProducts: products.length, lowStockCount: products.filter(p => p.stock <= p.minStock).length, totalValue: products.reduce((acc, p) => acc + (p.stock * (p.costPrice || 0)), 0) }
    };

    return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
