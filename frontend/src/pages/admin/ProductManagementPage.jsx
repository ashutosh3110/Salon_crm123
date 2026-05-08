import React from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import ProductManager from '../../components/admin/inventory/ProductManager';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Package } from 'lucide-react';

export default function ProductManagementPage() {
    const navigate = useNavigate();
    const { products, deleteProduct, updateProduct, duplicateProduct } = useInventory();

    return (
        <div className="space-y-6 animate-reveal text-left max-w-[1600px] mx-auto pb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left font-mono">
                    <h1 className="text-xl font-black text-text uppercase italic tracking-tight leading-none">Products Registry</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">Inventory :: Master SKU Management</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button className="flex items-center gap-2 bg-surface border border-border px-4 py-2 text-[9px] font-black text-text-muted hover:bg-surface-alt hover:text-primary transition-all uppercase tracking-widest font-mono shadow-sm">
                        <Download className="w-3.5 h-3.5" /> Export Log
                    </button>
                    <button
                        onClick={() => navigate('/admin/inventory/products/new')}
                        className="flex items-center gap-2 bg-text text-background px-4 py-2 text-[9px] font-black hover:bg-primary hover:text-white transition-all uppercase tracking-widest font-mono shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> New Asset
                    </button>
                </div>
            </div>

            <div className="bg-surface p-6 border border-border min-h-[600px]">
                <ProductManager
                    products={products}
                    onDelete={deleteProduct}
                    onToggleStatus={(id) => {
                        const p = products.find(prod => (prod.id || prod._id) === id);
                        if (p) updateProduct(id, { status: p.status === 'active' ? 'inactive' : 'active' });
                    }}
                    onEdit={(product) => {
                        navigate(`/admin/inventory/products/edit/${product._id || product.id}`);
                    }}
                    onDuplicate={duplicateProduct}
                />
            </div>
        </div>
    );
}
