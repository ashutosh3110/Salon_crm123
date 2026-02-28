import { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};

const INITIAL_PRODUCTS = [
    { id: 1, name: "L'Oréal Hair Colour - Black", sku: 'LOR-HC-001', category: 'Hair Colour', brand: "L'Oréal", stock: 124, minStock: 20, unit: 'pcs', price: 450, status: 'In Stock' },
    { id: 2, name: 'Schwarzkopf Shampoo 500ml', sku: 'SCH-SH-002', category: 'Shampoo', brand: 'Schwarzkopf', stock: 45, minStock: 15, unit: 'bottles', price: 850, status: 'In Stock' },
    { id: 3, name: 'OPI Gel Nail Polish - Red', sku: 'OPI-NP-005', category: 'Nail Polish', brand: 'OPI', stock: 8, minStock: 10, unit: 'pcs', price: 1200, status: 'Low Stock' },
    { id: 4, name: 'Wella Conditioner 1L', sku: 'WEL-CD-003', category: 'Conditioner', brand: 'Wella', stock: 12, minStock: 10, unit: 'bottles', price: 1500, status: 'In Stock' },
    { id: 5, name: 'Matrix Hair Serum', sku: 'MAT-HS-009', category: 'Serum', brand: 'Matrix', stock: 65, minStock: 15, unit: 'bottles', price: 950, status: 'In Stock' },
    { id: 6, name: 'Disposable Capes (50 pcs)', sku: 'DSP-CP-010', category: 'Consumables', brand: 'Generic', stock: 3, minStock: 5, unit: 'packs', price: 300, status: 'Critical' },
];

const INITIAL_MOVEMENTS = [
    { id: 1, type: 'in', product: 'Matrix Hair Serum', qty: 20, source: 'Beauty Hub Supplies', time: 'Today' },
    { id: 2, type: 'out', product: "L'Oréal Hair Colour", qty: 3, source: 'Service Usage', time: 'Today' },
    { id: 3, type: 'transfer', product: 'Schwarzkopf Shampoo', qty: 5, source: 'Outlet 1 → Outlet 2', time: 'Yesterday' },
];

const INITIAL_PURCHASES = [
    { id: 'PUR001', supplier: 'Beauty Hub Supplies', date: 'Feb 22, 2024', amount: 12500, items: 8, status: 'Received' },
    { id: 'PUR002', supplier: 'Lotus Cosmetics', date: 'Feb 20, 2024', amount: 8900, items: 12, status: 'Received' },
    { id: 'PUR003', supplier: 'Matrix Distribution', date: 'Feb 18, 2024', amount: 15200, items: 5, status: 'Pending' },
];

export const InventoryProvider = ({ children }) => {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [movements, setMovements] = useState(INITIAL_MOVEMENTS);
    const [purchases, setPurchases] = useState(INITIAL_PURCHASES);

    // Refresh statuses whenever products change
    useEffect(() => {
        setProducts(prev => prev.map(p => {
            let status = 'In Stock';
            if (p.stock <= p.minStock * 0.5) status = 'Critical';
            else if (p.stock <= p.minStock) status = 'Low Stock';
            return { ...p, status };
        }));
    }, []);

    const addProduct = (product) => {
        setProducts(prev => [{ ...product, id: Date.now() }, ...prev]);
    };

    const updateStock = (sku, qty, type, source) => {
        const product = products.find(p => p.sku === sku);
        if (!product) return false;

        setProducts(prev => prev.map(p => {
            if (p.sku === sku) {
                const newStock = type === 'in' ? p.stock + qty : p.stock - qty;
                let status = 'In Stock';
                if (newStock <= p.minStock * 0.5) status = 'Critical';
                else if (newStock <= p.minStock) status = 'Low Stock';
                return { ...p, stock: Math.max(0, newStock), status };
            }
            return p;
        }));

        const newMovement = {
            id: Date.now(),
            type,
            product: product.name,
            qty,
            source,
            time: 'Just now'
        };
        setMovements(prev => [newMovement, ...prev]);
        return true;
    };

    const addPurchase = (purchase) => {
        setPurchases(prev => [{ ...purchase, id: `PUR${Date.now().toString().slice(-4)}` }, ...prev]);
    };

    const value = {
        products,
        movements,
        purchases,
        addProduct,
        updateStock,
        addPurchase,
        lowStockItems: products.filter(p => p.stock <= p.minStock),
        stats: {
            totalProducts: products.length,
            lowStockCount: products.filter(p => p.stock <= p.minStock).length,
            pendingOrders: purchases.filter(p => p.status === 'Pending').length,
            totalValue: products.reduce((acc, p) => acc + (p.stock * p.price), 0)
        }
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};
