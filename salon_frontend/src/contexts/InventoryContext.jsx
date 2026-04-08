import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// Helper: given a product with stockByOutlet, compute total
const totalStock = (stockByOutlet) =>
    Object.values(stockByOutlet || {}).reduce((s, v) => s + v, 0);

// Helper: compute status from total stock vs minStock and expiry
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

// Initial constants removed to use JSON
const INITIAL_PRODUCTS = inventoryData.products || [];
const INITIAL_MOVEMENTS = inventoryData.movements || [];
const INITIAL_PURCHASES = inventoryData.purchases || [];
const INITIAL_TRANSFERS = inventoryData.transfers || [];
const MONTHLY_HISTORY_GLOBAL = inventoryData.monthlyHistory || [];

// Enrich: add computed `stock` (total) and `stockStatus` (inventory level).
// Keep `status` as API listing flag: active | inactive (do not mix with stock labels).
const enrichProduct = (p) => {
    const stock = totalStock(p.stockByOutlet);
    const stockStatus = computeStatus(stock, p.minStock, p.expiryDate);
    const raw = String(p.status ?? '').toLowerCase();
    const listingStatus = raw === 'inactive' ? 'inactive' : 'active';
    return { ...p, stock, stockStatus, status: listingStatus };
};

const EXTENDED_KEYS = [
    'brand',
    'description',
    'gstPercent',
    'hsnCode',
    'barcode',
    'threshold',
    'supplier',
    'availability',
    'outletIds',
    'mfgDate',
    'expiryDate',
    'isShopProduct',
    'appCategory',
    'appImage',
    'shopDescription',
    'rating',
    'appCare',
    'appUsage',
    'appOrigin',
    'appKnowMore',
    'appFormulaType',
    'appConsistency',
    'appRitualStatus',
    'appVendorDetails',
    'appReturnPolicy',
    'gender',
];

const buildExtended = (product) => {
    const ext = {};
    for (const k of EXTENDED_KEYS) {
        const v = product[k];
        if (v !== undefined && v !== null) ext[k] = v;
    }
    return ext;
};

const toProductPayload = (product) => {
    const price = Number(product.sellingPrice ?? product.price ?? 0);
    const ext = buildExtended(product);
    return {
        name: String(product.name ?? '').trim(),
        sku: String(product.sku ?? '').trim(),
        price: Number.isFinite(price) ? price : 0,
        category: product.category != null ? String(product.category) : '',
        status: product.status === 'inactive' ? 'inactive' : 'active',
        extended: ext && typeof ext === 'object' ? ext : {},
    };
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
        outletIds: (
            Array.isArray(p?.outletIds) ? p.outletIds : Array.isArray(ext.outletIds) ? ext.outletIds : []
        ).map((x) => String(x)),
    });
};

const normalizeShopCat = (c) => {
    const id = String(c?._id ?? c?.id ?? '');
    return {
        ...c,
        id,
        _id: id,
        name: c?.name ?? '',
        image:
            c?.image ||
            'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000',
        sortOrder: Number(c?.sortOrder ?? 0),
        count: 0,
    };
};

// Initial constants removed to use JSON
const INITIAL_SALE_RECORDS = inventoryData.saleRecords || [];

export const InventoryProvider = ({ children }) => {
    const { addExpense } = useFinance();
    const { outlets: tenantOutlets, suppliers: businessSuppliers } = useBusiness();
    const { customer } = useCustomerAuth();
    const tenantOutletLenRef = useRef(0);
    const { user: dashboardUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState(() => getInitialState('inv_movements', INITIAL_MOVEMENTS));
    const [purchases, setPurchases] = useState(() => getInitialState('inv_purchases', INITIAL_PURCHASES));
    const [transfers, setTransfers] = useState(() => getInitialState('inv_transfers', INITIAL_TRANSFERS));
    const [outlets, setOutlets] = useState(() => getInitialState('inv_outlets', inventoryData.outlets));

    // ── Sale Records — Reconciliation log ────────────────────
    const [saleRecords, setSaleRecords] = useState(() => getInitialState('inv_sale_records', INITIAL_SALE_RECORDS));
    const [stockInHistory, setStockInHistory] = useState(() => getInitialState('inv_stock_in', inventoryData.stockInHistory || []));
    const [supplierInvoices, setSupplierInvoices] = useState([]);
    const [supplierLedger, setSupplierLedger] = useState(null);
    const [adjustmentLog, setAdjustmentLog] = useState(() => getInitialState('inv_adjustments', inventoryData.adjustmentLog || []));
    // Do not use static/mock product categories.
    const [productCategories] = useState([]);
    /** Supplier names from Finance → Suppliers API (BusinessContext) */
    const suppliers = useMemo(
        () =>
            (businessSuppliers || []).map((s) => ({
                ...s,
                id: s.id || s._id,
                name: s.name || '',
            })),
        [businessSuppliers]
    );
    const [shopCategoriesRaw, setShopCategoriesRaw] = useState([]);
    const path = typeof window !== 'undefined' ? window.location.pathname || '' : '';
    const isCustomerPath = path.startsWith('/app');
    const customerToken = typeof localStorage !== 'undefined' ? localStorage.getItem('customer_token') : null;

    const mergeInventoryStock = useCallback(async (productRows) => {
        const list = Array.isArray(productRows) ? productRows : [];
        try {
            const res = await api.get('/inventory/overview');
            const lines = res?.data?.lines || [];
            const byPid = {};
            for (const line of lines) {
                const pid = String(line.productId?._id || line.productId || '');
                const oid = String(line.outletId?._id || line.outletId || '');
                if (!pid || !oid) continue;
                if (!byPid[pid]) byPid[pid] = {};
                byPid[pid][oid] = Number(line.quantity) || 0;
            }
            return list.map((p) => {
                const pid = String(p._id || p.id);
                const extra = byPid[pid];
                if (!extra) return p;
                const stockByOutlet = { ...(p.stockByOutlet || {}), ...extra };
                return enrichProduct({ ...p, stockByOutlet });
            });
        } catch (err) {
            console.warn('[InventoryContext] Bulk merge failed:', err.message);
            return list;
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        const tenantId = localStorage.getItem('active_tenant_id');
        try {
            const res = await api.get('/products', { params: { page: 1, limit: 500, tenantId: tenantId || undefined, _v: Date.now() } });
            const rows = res?.data?.results || res?.data?.data?.results || [];
            let list = Array.isArray(rows) ? rows.map(normalizeProduct) : [];
            list = await mergeInventoryStock(list);
            setProducts(list);
        } catch (error) {
            setProducts([]);
        }
    }, [mergeInventoryStock, customerToken, isCustomerPath, dashboardUser]);

    const fetchShopCategories = useCallback(async () => {
        const path = typeof window !== 'undefined' ? window.location.pathname || '' : '';
        const isCustomerPath = path.startsWith('/app');
        const roleToken =
            localStorage.getItem('auth_token_admin') ||
            localStorage.getItem('auth_token_manager') ||
            localStorage.getItem('auth_token_receptionist') ||
            localStorage.getItem('auth_token_inventory_manager') ||
            localStorage.getItem('auth_token_superadmin');
        const customerToken = localStorage.getItem('customer_token');

        let tenantIdForPublic = null;
        try {
            const raw = localStorage.getItem('customer_user');
            if (raw) {
                tenantIdForPublic = JSON.parse(raw)?.tenantId;
            } else {
                tenantIdForPublic = localStorage.getItem('active_tenant_id');
            }
        } catch {
            /* ignore */
        }

        const canAuthList =
            (isCustomerPath && customerToken) || (!isCustomerPath && roleToken);

        try {
            if (canAuthList) {
                const res = await api.get('/shop-categories', { params: { page: 1, limit: 200 } });
                const rows = res?.data?.results || [];
                setShopCategoriesRaw(Array.isArray(rows) ? rows.map(normalizeShopCat) : []);
                return;
            }
            if (isCustomerPath && tenantIdForPublic) {
                const res = await api.get(`/shop-categories/tenant/${tenantIdForPublic}`);
                const rows = res?.data?.data || [];
                setShopCategoriesRaw(Array.isArray(rows) ? rows.map(normalizeShopCat) : []);
                return;
            }
            setShopCategoriesRaw([]);
        } catch {
            setShopCategoriesRaw([]);
        }
    }, [customerToken, dashboardUser, isCustomerPath]);

    const shopCategories = useMemo(
        () =>
            shopCategoriesRaw.map((cat) => ({
                ...cat,
                count: products.filter((p) => String(p.appCategory) === String(cat.id)).length,
            })),
        [shopCategoriesRaw, products]
    );

    const fetchStockInHistory = useCallback(async () => {
        try {
            const res = await api.get('/inventory/stock-in/history', { params: { page: 1, limit: 500 } });
            const rows = res?.data?.results || res?.data?.data || [];
            setStockInHistory(rows);
        } catch (error) {
            console.warn('[InventoryContext] Fetch stock-in history failed:', error);
        }
    }, []);

    const fetchSupplierInvoices = useCallback(async () => {
        try {
            const res = await api.get('/suppliers/invoices');
            const rows = res?.data?.results || res?.data?.data?.results || [];
            setSupplierInvoices(rows);
        } catch (error) {
            console.error('[InventoryContext] Fetch supplier invoices failed:', error);
        }
    }, []);

    const fetchSupplierLedger = useCallback(async (supplierId) => {
        try {
            const res = await api.get(`/suppliers/${supplierId}/ledger`);
            setSupplierLedger(res?.data?.data || null);
        } catch (error) {
            console.error('[InventoryContext] Fetch supplier ledger failed:', error);
        }
    }, []);

    const recordSupplierPayment = useCallback(async (payload) => {
        try {
            const res = await api.post('/suppliers/payment', payload);
            await fetchSupplierInvoices();
            return res.data;
        } catch (error) {
            throw error;
        }
    }, [fetchSupplierInvoices]);

    useEffect(() => {
        const path = typeof window !== 'undefined' ? window.location.pathname || '' : '';
        const isCustomerPath = path.startsWith('/app');
        const customerToken = typeof localStorage !== 'undefined' ? localStorage.getItem('customer_token') : null;

        // Skip for Superadmin in Dashboard
        if (!isCustomerPath && dashboardUser?.role === 'superadmin') return;

        // Process Dashboard fetch
        if (!isCustomerPath && dashboardUser) {
            const role = dashboardUser.role;
            const isAuthorized = ['admin', 'manager', 'receptionist', 'inventory_manager'].includes(role);
            if (isAuthorized) {
                fetchProducts();
                fetchShopCategories();
                fetchStockInHistory();
                fetchSupplierInvoices();
            }
        }

        // Process Customer App fetch
        const publicPaths = ['/app/login', '/app/signup'];
        const isPublicPath = publicPaths.some(p => path.startsWith(p));

        if (isCustomerPath && !isPublicPath) {
            if (customerToken || customer) {
                fetchProducts();
                fetchShopCategories();
                fetchStockInHistory();
                fetchSupplierInvoices();
            }
        }
    }, [fetchProducts, fetchShopCategories, fetchStockInHistory, customer, dashboardUser, isCustomerPath, path]);

    // Customer app: when outlets first load (0 → N), re-fetch so mergeInventoryStock applies per-outlet qty
    useEffect(() => {
        const len = tenantOutlets?.length || 0;
        const prev = tenantOutletLenRef.current;
        tenantOutletLenRef.current = len;
        if (prev !== 0 || len === 0) return;
        if (typeof window === 'undefined' || !window.location.pathname.startsWith('/app')) return;
        if (!localStorage.getItem('customer_token')) return;
        fetchProducts();
    }, [tenantOutlets?.length, fetchProducts]);

    // Helper to strip large data before localStorage (to avoid QuotaExceededError)
    const stripLargeAppData = (data) => {
        if (!Array.isArray(data)) return data;
        return data.map(item => {
            const newItem = { ...item };
            // Identify large fields (base64 images usually start with data:image)
            if (newItem.appImage?.length > 500) newItem.appImage = ''; 
            if (newItem.image?.length > 500) newItem.image = '';
            return newItem;
        });
    };

    // Persistence Effect with Quota Safeguard
    useEffect(() => {
        try {
            localStorage.setItem('inv_products', JSON.stringify(stripLargeAppData(products)));
            localStorage.setItem('inv_movements', JSON.stringify(movements));
            localStorage.setItem('inv_purchases', JSON.stringify(purchases));
            localStorage.setItem('inv_transfers', JSON.stringify(transfers));
            localStorage.setItem('inv_outlets', JSON.stringify(outlets));
            localStorage.setItem('inv_sale_records', JSON.stringify(saleRecords));
            localStorage.setItem('inv_stock_in', JSON.stringify(stockInHistory));
            localStorage.setItem('inv_adjustments', JSON.stringify(adjustmentLog));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.warn('[InventoryContext] LocalStorage quota exceeded. Stripping more cache...');
            }
        }
    }, [products, movements, purchases, transfers, outlets, saleRecords, stockInHistory, adjustmentLog]);

    // ── Monthly History — 6 months of consumption per product ──
    const MONTHLY_HISTORY = inventoryData.monthlyHistory || [];

    // Manual projection overrides: { [sku]: projectedQty }
    const [projectionOverrides, setProjectionOverrides] = useState({});

    // Auto-calculate next-month projection: avg of last 3 complete months × 1.1 buffer
    const computeAutoProjection = (sku) => {
        const history = MONTHLY_HISTORY
            .filter(h => h.sku === sku)
            .slice(-4, -1); // last 3 complete months (exclude partial current month)
        if (history.length === 0) return 0;
        const avg = history.reduce((s, h) => s + h.actual, 0) / history.length;
        return Math.ceil(avg * 1.1);
    };

    // Set manual projection override
    const setProjection = (sku, qty) =>
        setProjectionOverrides(prev => ({ ...prev, [sku]: Number(qty) }));

    // Reset to auto-computed
    const resetProjection = (sku) =>
        setProjectionOverrides(prev => {
            const next = { ...prev };
            delete next[sku];
            return next;
        });

    // ── Add new product ───────────────────────────────────────
    const addProduct = async (product) => {
        const barcode = product.barcode || generateEAN13();
        const payload = toProductPayload({ ...product, barcode });
        try {
            const res = await api.post('/products', payload);
            const created = normalizeProduct(res?.data || {});
            setProducts((prev) => [created, ...prev]);
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to create product.');
        }
    };

    // ── Update single product fields ──────────────────────────
    const updateProduct = async (id, updates) => {
        const pid = String(id);
        const existing = products.find((p) => String(p.id) === pid || String(p._id) === pid);
        if (!existing) return;
        const payload = toProductPayload({ ...existing, ...updates });
        try {
            const res = await api.patch(`/products/${pid}`, payload);
            const updated = normalizeProduct(res?.data || { ...existing, ...updates });
            setProducts((prev) => prev.map((p) => (String(p.id) === pid || String(p._id) === pid ? updated : p)));
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to update product.');
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const pid = String(id);
            try {
                await api.delete(`/products/${pid}`);
                setProducts((prev) => prev.filter((p) => String(p.id) !== pid && String(p._id) !== pid));
            } catch (error) {
                alert(error?.response?.data?.message || 'Failed to delete product.');
            }
        }
    };

    const duplicateProduct = async (id) => {
        const product = products.find((p) => String(p.id) === String(id) || String(p._id) === String(id));
        if (product) {
            const newProduct = {
                ...product,
                name: `${product.name} (Copy)`,
                sku: `${product.sku}-COPY`,
                barcode: generateEAN13(),
                stock: 0,
                stockByOutlet: { main: 0 },
            };
            await addProduct(newProduct);
        }
    };

    // ── Update stock for a specific outlet ────────────────────
    const updateStockByOutlet = (sku, qty, type, outletId, source) => {
        const product = products.find(p => p.sku === sku || p.barcode === sku);
        if (!product) return false;

        setProducts(prev => prev.map(p => {
            if (p.sku !== sku && p.barcode !== sku) return p;
            const newByOutlet = { ...p.stockByOutlet };
            const current = newByOutlet[outletId] || 0;
            newByOutlet[outletId] = type === 'in'
                ? current + qty
                : Math.max(0, current - qty);
            return enrichProduct({ ...p, stockByOutlet: newByOutlet });
        }));

        const newMovement = {
            id: Date.now(),
            type,
            product: product.name,
            qty,
            source: source || outletId,
            outlet: outletId,
            time: 'Just now',
        };
        setMovements(prev => [newMovement, ...prev]);
        return true;
    };

    // ── Legacy updateStock (uses total pool / first outlet) ───
    const updateStock = (sku, qty, type, source) => {
        return updateStockByOutlet(sku, qty, type, 'main', source);
    };

    // ── Transfer stock between outlets ────────────────────────
    const transferStock = ({ sku, qty, fromOutlet, toOutlet, reason }) => {
        const product = products.find(p => p.sku === sku || p.barcode === sku);
        if (!product) return { success: false, error: 'Product not found' };

        const fromStock = product.stockByOutlet?.[fromOutlet] || 0;
        if (fromStock < qty) return { success: false, error: `Insufficient stock at source. Available: ${fromStock}` };

        setProducts(prev => prev.map(p => {
            if (p.sku !== sku && p.barcode !== sku) return p;
            const newByOutlet = { ...p.stockByOutlet };
            newByOutlet[fromOutlet] = (newByOutlet[fromOutlet] || 0) - qty;
            newByOutlet[toOutlet] = (newByOutlet[toOutlet] || 0) + qty;
            return enrichProduct({ ...p, stockByOutlet: newByOutlet });
        }));

        const fromName = outlets.find(o => o.id === fromOutlet)?.name || fromOutlet;
        const toName = outlets.find(o => o.id === toOutlet)?.name || toOutlet;
        const newMovement = {
            id: Date.now(),
            type: 'transfer',
            product: product.name,
            qty,
            source: `${fromName} → ${toName}`,
            outlet: null,
            time: 'Just now',
        };
        setMovements(prev => [newMovement, ...prev]);

        const newTransfer = {
            id: `TR${Date.now().toString().slice(-4)}`,
            productName: product.name,
            sku,
            qty,
            from: fromOutlet,
            to: toOutlet,
            date: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            status: 'Completed',
            reason: reason || 'Stock Balancing',
        };
        setTransfers(prev => [newTransfer, ...prev]);
        return { success: true };
    };

    // ── Add new outlet/hubs ───────────────────────────────────
    const addOutlet = (data) => {
        const id = `outlet-${Date.now()}`;
        const newOutlet = {
            id,
            ...data,
            light: `${data.color}/10 text-${data.color.replace('bg-', '')}-600`
        };
        setOutlets(prev => [...prev, newOutlet]);
    };

    const deleteOutlet = (id) => {
        setOutlets(prev => prev.filter(o => o.id !== id));
    };

    const updateOutlet = (id, updates) => {
        setOutlets(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    };

    // ── Shop Categories (Shop Modules) — API per tenant ───────
    const addShopCategory = async (category) => {
        try {
            const res = await api.post('/shop-categories', {
                name: category.name,
                image: category.image || '',
                sortOrder: category.sortOrder ?? 0,
            });
            const newCat = normalizeShopCat(res?.data || {});
            setShopCategoriesRaw((prev) => [...prev, newCat]);
        } catch (error) {
            const status = error?.response?.status;
            const serverMsg = error?.response?.data?.message;
            const hint =
                status === 404
                    ? '\n\n(404: API URL check — VITE_API_URL should be set in environment variables. Restart frontend after .env change.)'
                    : '';
            alert(serverMsg || `Failed to add shop section.${hint}`);
        }
    };

    const updateShopCategory = async (id, updates) => {
        const cid = String(id);
        try {
            const body = {};
            if (updates.name != null) body.name = updates.name;
            if (updates.image != null) body.image = updates.image;
            if (updates.sortOrder != null) body.sortOrder = updates.sortOrder;
            const res = await api.patch(`/shop-categories/${cid}`, body);
            const updated = normalizeShopCat(res?.data || {});
            setShopCategoriesRaw((prev) =>
                prev.map((c) => (String(c.id) === cid ? updated : c))
            );
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to update shop category.');
        }
    };

    const deleteShopCategory = async (id) => {
        const cid = String(id);
        try {
            await api.delete(`/shop-categories/${cid}`);
            setShopCategoriesRaw((prev) => prev.filter((c) => String(c.id) !== cid));
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete shop category.');
        }
    };

    // ── Add purchase order ────────────────────────────────────
    const addPurchase = (purchase) => {
        setPurchases(prev => [{ ...purchase, id: `PUR${Date.now().toString().slice(-4)}` }, ...prev]);

        // ── Connect to Accountant Expenses ──
        addExpense({
            date: new Date().toISOString().split('T')[0],
            vendor: purchase.vendor || 'Inventory Supplier',
            category: 'Inventory',
            desc: `Stock Purchase: ${purchase.productName || 'Bulk Order'}`,
            amount: purchase.totalAmount || 0,
            status: 'Paid'
        });
    };

    // ── Add Sale Record (called from POS on checkout) ─────────
    // Records each product/service item with subType for reconciliation
    const addSaleRecord = (records) => {
        const enriched = records.map((r, i) => ({
            ...r,
            id: `SR${Date.now()}${i}`,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        }));
        setSaleRecords(prev => [...enriched, ...prev]);

        // Also auto-deduct stock for retail products from outlet-1 (active outlet)
        enriched.forEach(r => {
            if (r.subType === 'retail_sale' || r.subType === 'service_usage') {
                updateStockByOutlet(r.sku, r.qty, 'out', r.outletId || 'outlet-1', r.invoiceId);
            }
        });
    };

    // ── Find product by barcode or SKU ────────────────────────
    const findByBarcode = (code) =>
        products.find(p => p.barcode === code || p.sku === code) || null;

    // ── Outlet-wise stats ─────────────────────────────────────
    const getOutletStats = (outletId) => ({
        outletId,
        totalProducts: products.filter(p => (p.stockByOutlet?.[outletId] || 0) > 0).length,
        totalStock: products.reduce((s, p) => s + (p.stockByOutlet?.[outletId] || 0), 0),
        totalValue: products.reduce((s, p) => s + (p.stockByOutlet?.[outletId] || 0) * p.costPrice, 0),
        lowStockItems: products.filter(p => {
            const outletStock = p.stockByOutlet?.[outletId] || 0;
            return outletStock > 0 && outletStock <= Math.ceil(p.minStock / outlets.length);
        }).length,
    });

    const lowStockItems = products.filter(p => p.stock <= p.minStock);

    // ── Reconciliation: group by product, sum retail vs service ─
    const reconciliationData = (() => {
        const map = {};
        saleRecords.forEach(r => {
            if (!map[r.sku]) {
                map[r.sku] = {
                    sku: r.sku,
                    productName: r.productName,
                    retailQty: 0, retailValue: 0,
                    serviceQty: 0, serviceValue: 0,
                    records: [],
                };
            }
            if (r.subType === 'retail_sale') {
                map[r.sku].retailQty += r.qty;
                map[r.sku].retailValue += r.total;
            } else if (r.subType === 'service_usage') {
                map[r.sku].serviceQty += r.qty;
                map[r.sku].serviceValue += r.total;
            }
            map[r.sku].records.push(r);
        });
        return Object.values(map).sort((a, b) =>
            (b.retailQty + b.serviceQty) - (a.retailQty + a.serviceQty)
        );
    })();

    // ── Projection Summary — compare projected vs actual per product ─
    const projectionSummary = (() => {
        const skus = [...new Set(MONTHLY_HISTORY.map(h => h.sku))];
        return skus.map(sku => {
            const product = products.find(p => p.sku === sku);
            const history = MONTHLY_HISTORY.filter(h => h.sku === sku);
            const projected = projectionOverrides[sku] ?? computeAutoProjection(sku);
            const isOverridden = sku in projectionOverrides;

            // Actual this month (Feb 2026) from saleRecords
            const actualFromSales = saleRecords
                .filter(r => r.sku === sku)
                .reduce((s, r) => s + r.qty, 0);
            // Also include monthly history Feb entry
            const histFeb = history.find(h => h.month === 'Feb 2026')?.actual || 0;
            const actual = actualFromSales || histFeb;

            const variance = actual - projected;
            const variancePct = projected > 0 ? Math.round((variance / projected) * 100) : 0;
            const status = variancePct >= 15 ? 'Over Budget'
                : variancePct <= -15 ? 'Under Budget'
                    : 'On Track';

            // Build 6-month trend array for sparkline
            const trend = history.map(h => ({
                month: h.month.split(' ')[0], // 'Sep', 'Oct' …
                actual: h.actual,
                projected: projectionOverrides[sku] ?? computeAutoProjection(sku),
            }));

            return {
                sku,
                productName: product?.name || sku,
                category: product?.category || '',
                projected,
                actual,
                variance,
                variancePct,
                status,
                isOverridden,
                trend,
            };
        }).sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct));
    })();

    const expiryAlerts = products.filter(p => {
        if (!p.expiryDate) return false;
        const remainingDays = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return remainingDays <= 60; // Alert for items expiring within 2 months
    });

    const value = useMemo(() => ({
        products,
        movements,
        purchases,
        transfers,
        saleRecords,
        reconciliationData,
        projectionSummary,
        setProjection,
        resetProjection,
        outlets,
        addOutlet,
        deleteOutlet,
        updateOutlet,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateStock,
        updateStockByOutlet,
        transferStock,
        addPurchase,
        addSaleRecord,
        findByBarcode,
        generateEAN13,
        getOutletStats,
        lowStockItems,
        expiryAlerts,
        stats: {
            totalProducts: products.length,
            lowStockCount: lowStockItems.length,
            expiryAlertCount: expiryAlerts.length,
            pendingOrders: purchases.filter(p => p.status === 'Pending').length,
            totalValue: products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0),
        },
        stockInHistory,
        supplierInvoices,
        supplierLedger,
        fetchSupplierInvoices,
        fetchSupplierLedger,
        recordSupplierPayment,
        adjustmentLog,
        addStockIn: async (data) => {
            try {
                // If no productId is provided, use the first available product
                const productId = data.productId || products[0]?.id || products[0]?._id;
                if (!productId) throw new Error('No product available to link stock-in.');

                const payload = {
                    productId,
                    outletId: data.outletId || 'main', // Default to main
                    type: 'STOCK_IN',
                    quantity: Number(data.quantity) || 1,
                    purchasePrice: Number(data.amount) || 0,
                    taxRate: Number(data.taxRate) || 0,
                    taxAmount: Number(data.taxAmount) || 0,
                    attachmentUrl: data.attachmentUrl || '',
                    invoiceRef: data.invoiceRef,
                    supplierName: data.supplierName,
                    reason: 'Accountant Voucher Entry'
                };

                const res = await api.post('/inventory/stock-in', payload);
                
                // Add to Finance Expenses as well
                const totalWithTax = (Number(data.amount) || 0) + (Number(data.taxAmount) || 0);
                addExpense({
                    date: new Date().toISOString().split('T')[0],
                    vendor: data.supplierName || 'Inventory Supplier',
                    category: 'inventory',
                    desc: `Voucher: ${data.invoiceRef || 'Manual Purchase'}`,
                    amount: totalWithTax,
                    status: 'Paid',
                    paymentMethod: data.type === 'Credit' ? 'unpaid' : 'cash'
                });

                // Refresh history and products
                await fetchStockInHistory();
                await fetchSupplierInvoices();
                await fetchProducts();
                return { success: true, data: res.data };
            } catch (error) {
                console.error('[InventoryContext] Add stock-in failed:', error);
                throw error;
            }
        },
        productCategories,
        suppliers,
        shopCategories,
        addShopCategory,
        updateShopCategory,
        deleteShopCategory,
        fetchProducts,
        fetchShopCategories,
        fetchStockInHistory,
    }), [products, movements, purchases, transfers, saleRecords, reconciliationData, projectionSummary, outlets, lowStockItems, expiryAlerts, stockInHistory, adjustmentLog, productCategories, suppliers, shopCategories, fetchProducts, fetchShopCategories, fetchStockInHistory]);

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};
