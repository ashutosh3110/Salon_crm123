import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddProductForm from '../../components/admin/inventory/AddProductForm';
import { useInventory } from '../../contexts/InventoryContext';

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
        <div className="animate-reveal pb-8">
            <AddProductForm 
                onSave={handleSave}
                initialData={editingProduct}
                onCancel={() => navigate('/admin/inventory/products')}
            />
        </div>
    );
}
