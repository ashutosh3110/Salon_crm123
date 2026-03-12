import { createContext, useContext, useState, useEffect } from 'react';
import inventoryData from '../data/inventoryData.json';
import { useFinance } from './FinanceContext';

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
const INITIAL_PRODUCTS = inventoryData.products;
const INITIAL_MOVEMENTS = inventoryData.movements;
const INITIAL_PURCHASES = inventoryData.purchases;
const INITIAL_TRANSFERS = inventoryData.transfers;
const MONTHLY_HISTORY = inventoryData.monthlyHistory;

// Enrich: add computed `stock` (total) to every product
const enrichProduct = (p) => {
    const stock = totalStock(p.stockByOutlet);
    return { ...p, stock, status: computeStatus(stock, p.minStock, p.expiryDate) };
};

// Initial constants removed to use JSON
const INITIAL_SALE_RECORDS = inventoryData.saleRecords;

export const InventoryProvider = ({ children }) => {
    const { addExpense } = useFinance();
    const [products, setProducts] = useState(() => getInitialState('inv_products', INITIAL_PRODUCTS).map(enrichProduct));
    const [movements, setMovements] = useState(() => getInitialState('inv_movements', INITIAL_MOVEMENTS));
    const [purchases, setPurchases] = useState(() => getInitialState('inv_purchases', INITIAL_PURCHASES));
    const [transfers, setTransfers] = useState(() => getInitialState('inv_transfers', INITIAL_TRANSFERS));
    const [outlets, setOutlets] = useState(() => getInitialState('inv_outlets', inventoryData.outlets));

    // ── Sale Records — Reconciliation log ────────────────────
    const [saleRecords, setSaleRecords] = useState(() => getInitialState('inv_sale_records', INITIAL_SALE_RECORDS));

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('inv_products', JSON.stringify(products));
        localStorage.setItem('inv_movements', JSON.stringify(movements));
        localStorage.setItem('inv_purchases', JSON.stringify(purchases));
        localStorage.setItem('inv_transfers', JSON.stringify(transfers));
        localStorage.setItem('inv_outlets', JSON.stringify(outlets));
        localStorage.setItem('inv_sale_records', JSON.stringify(saleRecords));
    }, [products, movements, purchases, transfers, outlets, saleRecords]);

    // ── Monthly History — 6 months of consumption per product ──
    const MONTHLY_HISTORY = inventoryData.monthlyHistory;

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
    const addProduct = (product) => {
        const barcode = product.barcode || generateEAN13();
        // If legacy `stock` number provided, put all in main
        const stockByOutlet = product.stockByOutlet || {
            'main': Number(product.stock) || 0,
            'outlet-1': 0,
            'outlet-2': 0,
        };
        const raw = { ...product, id: Date.now(), barcode, stockByOutlet };
        setProducts(prev => [enrichProduct(raw), ...prev]);
    };

    // ── Update single product fields ──────────────────────────
    const updateProduct = (id, updates) => {
        setProducts(prev => prev.map(p => {
            if (p.id !== id) return p;
            const merged = { ...p, ...updates };
            return enrichProduct(merged);
        }));
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

    const value = {
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
        }
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};
