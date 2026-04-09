import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import inventoryData from '../data/inventoryData.json';
import { useFinance } from './FinanceContext';
import { useBusiness } from './BusinessContext';
import { useCustomerAuth } from './CustomerAuthContext';
import { useAuth } from './AuthContext';
import mockApi from '../services/mock/mockApi';

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
    return enrichProduct({ ...base, ...ext, id, _id: id, sellingPrice: Number(p?.sellingPrice ?? p?.price ?? ext.sellingPrice ?? 0), price: Number(p?.price ?? p?.sellingPrice ?? ext.price ?? 0), threshold: ext.threshold != null ? ext.threshold : minStock, minStock, stockByOutlet, gender: String(p?.gender ?? ext.gender ?? 'all').toLowerCase(), appCategory: p?.appCategory ?? ext.appCategory, outletIds: (Array.isArray(p?.outletIds) ? p.outletIds : (Array.isArray(ext.outletIds) ? ext.outletIds : [])).map((x) => String(x)) });
};

const normalizeShopCat = (c) => {
    const id = String(c?._id ?? c?.id ?? '');
    return { ...c, id, _id: id, name: c?.name ?? '', image: c?.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000', sortOrder: Number(c?.sortOrder ?? 0), count: 0 };
};

export const InventoryProvider = ({ children }) => {
    const { addExpense } = useFinance();
    const { outletsSnapshot = [] } = useBusiness();
    const { user: dashboardUser, isPlanActive } = useAuth();
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState(() => getInitialState('inv_movements', INITIAL_MOVEMENTS));
    const [purchases, setPurchases] = useState(() => getInitialState('inv_purchases', INITIAL_PURCHASES));
    const [transfers, setTransfers] = useState(() => getInitialState('inv_transfers', INITIAL_TRANSFERS));
    const [outlets, setOutlets] = useState(() => getInitialState('inv_outlets', inventoryData.outlets));
    const [saleRecords, setSaleRecords] = useState(() => getInitialState('inv_sale_records', []));
    const [stockInHistory, setStockInHistory] = useState([]);
    const [shopCategories, setShopCategories] = useState([]);
    const [supplierInvoices, setSupplierInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const initializationRef = useRef(false);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await mockApi.get('/products');
            const rows = res?.data?.results || res?.data?.data || res?.data || [];
            setProducts(rows.map(normalizeProduct));
        } catch { setProducts([]); }
    }, []);

    const fetchShopCategories = useCallback(async () => {
        try {
            const res = await mockApi.get('/shop-categories');
            const rows = res?.data?.results || res?.data?.data || res?.data || [];
            if (Array.isArray(rows)) setShopCategories(rows.map(normalizeShopCat));
            else setShopCategories([]);
        } catch { setShopCategories([]); }
    }, []);

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
        if (dashboardUser && isPlanActive) {
            fetchProducts();
            fetchShopCategories();
            fetchStockInHistory();
            fetchSupplierInvoices();
        }
    }, [dashboardUser, isPlanActive, fetchProducts, fetchShopCategories, fetchStockInHistory, fetchSupplierInvoices]);

    const addProduct = async (d) => { try { const r = await mockApi.post('/products', d); setProducts(p => [normalizeProduct(r.data), ...p]); return r.data; } catch (e) { throw e; } };
    const updateProduct = async (id, d) => { try { const r = await mockApi.patch(`/products/${id}`, d); setProducts(p => p.map(x => (x.id === id || x._id === id) ? normalizeProduct({ ...x, ...d }) : x)); return r.data; } catch (e) { throw e; } };
    const deleteProduct = async (id) => { try { await mockApi.delete(`/products/${id}`); setProducts(p => p.filter(x => (x.id !== id && x._id !== id))); } catch (e) { throw e; } };

    const value = {
        products, movements, purchases, transfers, outlets, saleRecords, stockInHistory, shopCategories, supplierInvoices, loading,
        fetchProducts, addProduct, updateProduct, deleteProduct, fetchShopCategories,
        lowStockItems: products.filter(p => p.stock <= p.minStock),
        stats: { totalProducts: products.length, lowStockCount: products.filter(p => p.stock <= p.minStock).length, totalValue: products.reduce((acc, p) => acc + (p.stock * (p.costPrice || 0)), 0) }
    };

    return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
