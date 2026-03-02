import { createContext, useContext, useState, useEffect } from 'react';

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

// ── Outlets / Locations ───────────────────────────────────────
export const OUTLETS = [
    { id: 'main', name: 'Main Storage', short: 'Main', color: 'bg-violet-500', light: 'bg-violet-500/10 text-violet-600', isWarehouse: true },
    { id: 'outlet-1', name: 'Downtown Studio', short: 'Downtown', color: 'bg-primary', light: 'bg-primary/10 text-primary' },
    { id: 'outlet-2', name: 'Bandra Branch', short: 'Bandra', color: 'bg-emerald-500', light: 'bg-emerald-500/10 text-emerald-600' },
];

// Helper: given a product with stockByOutlet, compute total
const totalStock = (stockByOutlet) =>
    Object.values(stockByOutlet || {}).reduce((s, v) => s + v, 0);

// Helper: compute status from total stock vs minStock
const computeStatus = (total, minStock) => {
    if (total <= minStock * 0.5) return 'Critical';
    if (total <= minStock) return 'Low Stock';
    return 'In Stock';
};

// ── Initial Products (with stockByOutlet) ─────────────────────
const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: "L'Oréal Hair Colour - Black",
        sku: 'LOR-HC-001',
        barcode: '8901030123456',
        category: 'Hair Colour',
        brand: "L'Oréal",
        type: 'service_consumable',
        stockByOutlet: { 'main': 80, 'outlet-1': 28, 'outlet-2': 16 },
        minStock: 20,
        unit: 'pcs',
        costPrice: 320,
        price: 450,
        taxRate: 18,
        status: 'In Stock',
        supplier: 'Beauty Hub Supplies',
        reorderQty: 50,
    },
    {
        id: 2,
        name: 'Schwarzkopf Shampoo 500ml',
        sku: 'SCH-SH-002',
        barcode: '8901030234567',
        category: 'Shampoo',
        brand: 'Schwarzkopf',
        type: 'retail',
        stockByOutlet: { 'main': 25, 'outlet-1': 12, 'outlet-2': 8 },
        minStock: 15,
        unit: 'bottles',
        costPrice: 580,
        price: 850,
        taxRate: 18,
        status: 'In Stock',
        supplier: 'Schwarzkopf India',
        reorderQty: 30,
    },
    {
        id: 3,
        name: 'OPI Gel Nail Polish - Red',
        sku: 'OPI-NP-005',
        barcode: '8901030345678',
        category: 'Nail Polish',
        brand: 'OPI',
        type: 'retail',
        stockByOutlet: { 'main': 2, 'outlet-1': 4, 'outlet-2': 2 },
        minStock: 10,
        unit: 'pcs',
        costPrice: 850,
        price: 1200,
        taxRate: 18,
        status: 'Low Stock',
        supplier: 'Lotus Cosmetics',
        reorderQty: 20,
    },
    {
        id: 4,
        name: 'Wella Conditioner 1L',
        sku: 'WEL-CD-003',
        barcode: '8901030456789',
        category: 'Conditioner',
        brand: 'Wella',
        type: 'service_consumable',
        stockByOutlet: { 'main': 6, 'outlet-1': 4, 'outlet-2': 2 },
        minStock: 10,
        unit: 'bottles',
        costPrice: 1100,
        price: 1500,
        taxRate: 18,
        status: 'Low Stock',
        supplier: 'Wella Direct',
        reorderQty: 15,
    },
    {
        id: 5,
        name: 'Matrix Hair Serum',
        sku: 'MAT-HS-009',
        barcode: '8901030567890',
        category: 'Serum',
        brand: 'Matrix',
        type: 'retail',
        stockByOutlet: { 'main': 40, 'outlet-1': 15, 'outlet-2': 10 },
        minStock: 15,
        unit: 'bottles',
        costPrice: 680,
        price: 950,
        taxRate: 18,
        status: 'In Stock',
        supplier: 'Matrix Distribution',
        reorderQty: 25,
    },
    {
        id: 6,
        name: 'Disposable Capes (50 pcs)',
        sku: 'DSP-CP-010',
        barcode: '8901030678901',
        category: 'Consumables',
        brand: 'Generic',
        type: 'service_consumable',
        stockByOutlet: { 'main': 1, 'outlet-1': 1, 'outlet-2': 1 },
        minStock: 5,
        unit: 'packs',
        costPrice: 180,
        price: 300,
        taxRate: 5,
        status: 'Critical',
        supplier: 'Beauty Hub Supplies',
        reorderQty: 10,
    },
    {
        id: 7,
        name: 'Sunscreen SPF 50+',
        sku: 'SUN-SCR-001',
        barcode: '4234567890123',
        category: 'Skin Care',
        brand: 'Biotique',
        type: 'retail',
        stockByOutlet: { 'main': 10, 'outlet-1': 6, 'outlet-2': 4 },
        minStock: 8,
        unit: 'pcs',
        costPrice: 380,
        price: 550,
        taxRate: 18,
        status: 'In Stock',
        supplier: 'Lotus Cosmetics',
        reorderQty: 20,
    },
];

// Enrich: add computed `stock` (total) to every product
const enrichProduct = (p) => {
    const stock = totalStock(p.stockByOutlet);
    return { ...p, stock, status: computeStatus(stock, p.minStock) };
};

const INITIAL_MOVEMENTS = [
    { id: 1, type: 'in', product: 'Matrix Hair Serum', qty: 20, source: 'Beauty Hub Supplies', outlet: 'main', time: 'Today' },
    { id: 2, type: 'out', product: "L'Oréal Hair Colour", qty: 3, source: 'Service Usage', outlet: 'outlet-1', time: 'Today' },
    { id: 3, type: 'transfer', product: 'Schwarzkopf Shampoo', qty: 5, source: 'main → outlet-2', outlet: null, time: 'Yesterday' },
];

const INITIAL_PURCHASES = [
    { id: 'PUR001', supplier: 'Beauty Hub Supplies', date: 'Feb 22, 2024', amount: 12500, items: 8, status: 'Received' },
    { id: 'PUR002', supplier: 'Lotus Cosmetics', date: 'Feb 20, 2024', amount: 8900, items: 12, status: 'Received' },
    { id: 'PUR003', supplier: 'Matrix Distribution', date: 'Feb 18, 2024', amount: 15200, items: 5, status: 'Pending' },
];

// ── Transfer history ──────────────────────────────────────────
const INITIAL_TRANSFERS = [
    { id: 'TR089', productName: "L'Oréal Hair Colour", sku: 'LOR-HC-001', qty: 12, from: 'main', to: 'outlet-1', date: 'Today, 2:30 PM', status: 'Completed', reason: 'Low Stock Replenishment' },
    { id: 'TR088', productName: 'Schwarzkopf Shampoo', sku: 'SCH-SH-002', qty: 5, from: 'main', to: 'outlet-2', date: 'Yesterday', status: 'Completed', reason: 'Stock Balancing' },
];

export const InventoryProvider = ({ children }) => {
    const [products, setProducts] = useState(() => INITIAL_PRODUCTS.map(enrichProduct));
    const [movements, setMovements] = useState(INITIAL_MOVEMENTS);
    const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
    const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);

    // ── Sale Records — Reconciliation log ────────────────────
    // subType: 'retail_sale' | 'service_usage' | 'wastage' | 'return'
    const [saleRecords, setSaleRecords] = useState([
        { id: 'SR001', invoiceId: 'INV-3482', productName: 'Schwarzkopf Shampoo 500ml', sku: 'SCH-SH-002', subType: 'retail_sale', qty: 2, unitPrice: 850, total: 1700, staffId: null, outletId: 'outlet-1', date: 'Feb 28, 2026' },
        { id: 'SR002', invoiceId: 'INV-3480', productName: "L'Oréal Hair Colour - Black", sku: 'LOR-HC-001', subType: 'service_usage', qty: 3, unitPrice: 450, total: 1350, staffId: 'u1', outletId: 'outlet-1', date: 'Feb 28, 2026' },
        { id: 'SR003', invoiceId: 'INV-3479', productName: 'OPI Gel Nail Polish - Red', sku: 'OPI-NP-005', subType: 'retail_sale', qty: 1, unitPrice: 1200, total: 1200, staffId: null, outletId: 'outlet-2', date: 'Feb 27, 2026' },
        { id: 'SR004', invoiceId: 'INV-3478', productName: 'Wella Conditioner 1L', sku: 'WEL-CD-003', subType: 'service_usage', qty: 2, unitPrice: 1500, total: 3000, staffId: 'u2', outletId: 'outlet-1', date: 'Feb 27, 2026' },
        { id: 'SR005', invoiceId: 'INV-3477', productName: 'Matrix Hair Serum', sku: 'MAT-HS-009', subType: 'retail_sale', qty: 3, unitPrice: 950, total: 2850, staffId: null, outletId: 'outlet-2', date: 'Feb 26, 2026' },
        { id: 'SR006', invoiceId: 'INV-3476', productName: 'Sunscreen SPF 50+', sku: 'SUN-SCR-001', subType: 'retail_sale', qty: 4, unitPrice: 550, total: 2200, staffId: null, outletId: 'outlet-1', date: 'Feb 26, 2026' },
        { id: 'SR007', invoiceId: 'INV-3475', productName: "L'Oréal Hair Colour - Black", sku: 'LOR-HC-001', subType: 'service_usage', qty: 5, unitPrice: 450, total: 2250, staffId: 'u3', outletId: 'outlet-2', date: 'Feb 25, 2026' },
        { id: 'SR008', invoiceId: 'INV-3474', productName: 'Schwarzkopf Shampoo 500ml', sku: 'SCH-SH-002', subType: 'service_usage', qty: 1, unitPrice: 850, total: 850, staffId: 'u1', outletId: 'outlet-1', date: 'Feb 25, 2026' },
    ]);

    // ── Monthly History — 6 months of consumption per product ──
    const MONTHLY_HISTORY = [
        { month: 'Sep 2025', sku: 'LOR-HC-001', actual: 18 },
        { month: 'Oct 2025', sku: 'LOR-HC-001', actual: 22 },
        { month: 'Nov 2025', sku: 'LOR-HC-001', actual: 25 },
        { month: 'Dec 2025', sku: 'LOR-HC-001', actual: 30 },
        { month: 'Jan 2026', sku: 'LOR-HC-001', actual: 28 },
        { month: 'Feb 2026', sku: 'LOR-HC-001', actual: 8 },

        { month: 'Sep 2025', sku: 'SCH-SH-002', actual: 12 },
        { month: 'Oct 2025', sku: 'SCH-SH-002', actual: 10 },
        { month: 'Nov 2025', sku: 'SCH-SH-002', actual: 15 },
        { month: 'Dec 2025', sku: 'SCH-SH-002', actual: 18 },
        { month: 'Jan 2026', sku: 'SCH-SH-002', actual: 14 },
        { month: 'Feb 2026', sku: 'SCH-SH-002', actual: 3 },

        { month: 'Sep 2025', sku: 'OPI-NP-005', actual: 4 },
        { month: 'Oct 2025', sku: 'OPI-NP-005', actual: 6 },
        { month: 'Nov 2025', sku: 'OPI-NP-005', actual: 5 },
        { month: 'Dec 2025', sku: 'OPI-NP-005', actual: 8 },
        { month: 'Jan 2026', sku: 'OPI-NP-005', actual: 7 },
        { month: 'Feb 2026', sku: 'OPI-NP-005', actual: 1 },

        { month: 'Sep 2025', sku: 'WEL-CD-003', actual: 8 },
        { month: 'Oct 2025', sku: 'WEL-CD-003', actual: 9 },
        { month: 'Nov 2025', sku: 'WEL-CD-003', actual: 7 },
        { month: 'Dec 2025', sku: 'WEL-CD-003', actual: 12 },
        { month: 'Jan 2026', sku: 'WEL-CD-003', actual: 10 },
        { month: 'Feb 2026', sku: 'WEL-CD-003', actual: 2 },

        { month: 'Sep 2025', sku: 'MAT-HS-009', actual: 20 },
        { month: 'Oct 2025', sku: 'MAT-HS-009', actual: 24 },
        { month: 'Nov 2025', sku: 'MAT-HS-009', actual: 22 },
        { month: 'Dec 2025', sku: 'MAT-HS-009', actual: 28 },
        { month: 'Jan 2026', sku: 'MAT-HS-009', actual: 26 },
        { month: 'Feb 2026', sku: 'MAT-HS-009', actual: 3 },

        { month: 'Sep 2025', sku: 'SUN-SCR-001', actual: 10 },
        { month: 'Oct 2025', sku: 'SUN-SCR-001', actual: 12 },
        { month: 'Nov 2025', sku: 'SUN-SCR-001', actual: 9 },
        { month: 'Dec 2025', sku: 'SUN-SCR-001', actual: 14 },
        { month: 'Jan 2026', sku: 'SUN-SCR-001', actual: 11 },
        { month: 'Feb 2026', sku: 'SUN-SCR-001', actual: 4 },
    ];

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

        const fromName = OUTLETS.find(o => o.id === fromOutlet)?.name || fromOutlet;
        const toName = OUTLETS.find(o => o.id === toOutlet)?.name || toOutlet;
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

    // ── Add purchase order ────────────────────────────────────
    const addPurchase = (purchase) => {
        setPurchases(prev => [{ ...purchase, id: `PUR${Date.now().toString().slice(-4)}` }, ...prev]);
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
            return outletStock > 0 && outletStock <= Math.ceil(p.minStock / OUTLETS.length);
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
        outlets: OUTLETS,
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
        stats: {
            totalProducts: products.length,
            lowStockCount: lowStockItems.length,
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
