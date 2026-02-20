import { useState, useEffect } from 'react';
import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import EmptyState from '../../../components/ui/EmptyState';
import { useApi } from '../../../hooks/useApi';
import { HiOutlineShoppingBag, HiOutlinePlus } from 'react-icons/hi';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', sku: '', category: '', stock: '' });
    const { get, post, loading } = useApi();

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const data = await get('/products', null, { silent: true });
            setProducts(data?.products || data?.data || []);
        } catch { }
    };

    const handleAdd = async () => {
        try {
            await post('/products', { ...newProduct, price: Number(newProduct.price), stock: Number(newProduct.stock) }, { successMessage: 'Product added!' });
            setShowAddModal(false);
            setNewProduct({ name: '', price: '', sku: '', category: '', stock: '' });
            fetchProducts();
        } catch { }
    };

    return (
        <ModulePage title="Products" description="Manage retail products and inventory" icon={HiOutlineShoppingBag}>
            <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary dark:text-gray-400">{products.length} products</p>
                <Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>Add Product</Button>
            </div>

            {products.length === 0 ? (
                <EmptyState icon={HiOutlineShoppingBag} title="No products yet" description="Add products to sell at your salon"
                    action={<Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>Add Product</Button>} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((prod) => (
                        <Card key={prod._id} hover padding="md">
                            <div className="flex items-start justify-between mb-2">
                                <Badge size="sm" color="blue">{prod.category || 'General'}</Badge>
                                {prod.stock !== undefined && (
                                    <Badge size="sm" color={prod.stock > 10 ? 'emerald' : prod.stock > 0 ? 'amber' : 'red'}>
                                        Stock: {prod.stock}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-text-primary dark:text-white mt-2">{prod.name}</p>
                            {prod.sku && <p className="text-xs text-gray-400">SKU: {prod.sku}</p>}
                            <p className="text-lg font-bold text-primary mt-2">₹{prod.price}</p>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product"
                footer={<><Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button><Button onClick={handleAdd} loading={loading}>Add Product</Button></>}>
                <div className="space-y-4">
                    <Input label="Product Name" placeholder="e.g. Shampoo" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Price (₹)" type="number" placeholder="250" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                        <Input label="Stock" type="number" placeholder="100" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                    </div>
                    <Input label="SKU / Barcode" placeholder="PROD-001" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
                    <Input label="Category" placeholder="Hair Care, Skin Care..." value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
                </div>
            </Modal>
        </ModulePage>
    );
};

export default ProductListPage;
