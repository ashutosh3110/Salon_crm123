import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddProductForm from '../../components/admin/inventory/AddProductForm';
import { useInventory } from '../../contexts/InventoryContext';
import { ArrowLeft } from 'lucide-react';

export default function AddProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, addProduct, updateProduct } = useInventory();
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        if (id) {
            const found = products.find(p => (p._id || p.id) === id);
            if (found) setEditingProduct(found);
        }
    }, [id, products]);

    const handleSave = async (data) => {
        try {
            if (id || editingProduct) {
                await updateProduct(id || editingProduct.id, data);
            } else {
                await addProduct(data);
            }
            navigate('/admin/inventory/products');
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    return (
        <div className="space-y-6 animate-reveal text-left max-w-[1000px] mx-auto pb-8">
            <div className="flex items-center gap-4 px-1">
                <button 
                    onClick={() => navigate('/admin/inventory/products')}
                    className="p-2 bg-surface border border-border hover:bg-surface-alt transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-left font-mono">
                    <h1 className="text-xl font-black text-text uppercase italic tracking-tight leading-none">
                        {id ? 'Modify SKU' : 'New Asset Entry'}
                    </h1>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">Inventory :: Registry Update Protocol</p>
                </div>
            </div>

            <div className="bg-surface p-8 border border-border shadow-xl">
                <AddProductForm 
                    onSave={handleSave}
                    initialData={editingProduct}
                    onCancel={() => navigate('/admin/inventory/products')}
                />
            </div>
        </div>
    );
}
