import { useState, useEffect } from 'react';
import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useApi } from '../../../hooks/useApi';
import {
    HiOutlineCreditCard,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineShoppingCart,
    HiOutlineTrash,
    HiOutlineCash,
} from 'react-icons/hi';

const POSPage = () => {
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('services');
    const { get, loading } = useApi();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const [svcData, prodData] = await Promise.all([
                get('/services', null, { silent: true }).catch(() => ({ data: [] })),
                get('/products', null, { silent: true }).catch(() => ({ data: [] })),
            ]);
            setServices(svcData?.services || svcData?.data || []);
            setProducts(prodData?.products || prodData?.data || []);
        } catch { }
    };

    const addToCart = (item, type) => {
        const existing = cart.find((c) => c._id === item._id);
        if (existing) {
            setCart(cart.map((c) => c._id === item._id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { ...item, qty: 1, type }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter((c) => c._id !== id));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

    const currentItems = activeTab === 'services' ? services : products;

    return (
        <ModulePage title="Point of Sale" description="Create bills and process payments" icon={HiOutlineCreditCard}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Item Selection */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        {['services', 'products'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer ${activeTab === tab
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'bg-white dark:bg-white/5 border border-border-light dark:border-border-dark text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-white/5 border border-border-light dark:border-border-dark text-text-primary dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentItems
                            .filter((item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item) => (
                                <Card
                                    key={item._id}
                                    hover
                                    padding="sm"
                                    onClick={() => addToCart(item, activeTab === 'services' ? 'service' : 'product')}
                                    className="cursor-pointer"
                                >
                                    <p className="text-sm font-medium text-text-primary dark:text-white truncate">{item.name}</p>
                                    <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">{item.category || 'General'}</p>
                                    <p className="text-sm font-bold text-primary mt-2">₹{item.price || 0}</p>
                                </Card>
                            ))}
                        {currentItems.length === 0 && (
                            <div className="col-span-full text-center py-8 text-text-secondary dark:text-gray-400 text-sm">
                                No {activeTab} found. Add some from the {activeTab} module.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right - Cart / Bill */}
                <div>
                    <Card className="sticky top-20">
                        <div className="flex items-center gap-2 mb-4">
                            <HiOutlineShoppingCart className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-text-primary dark:text-white">Current Bill</h3>
                            <Badge color="primary">{cart.length}</Badge>
                        </div>

                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-sm text-text-secondary dark:text-gray-400">
                                <p>No items added yet</p>
                                <p className="text-xs mt-1">Click on services or products to add</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary dark:text-white truncate">{item.name}</p>
                                            <p className="text-xs text-text-secondary dark:text-gray-400">{item.qty} × ₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-text-primary dark:text-white">₹{(item.price || 0) * item.qty}</span>
                                            <button onClick={() => removeFromCart(item._id)} className="p-1 text-red-400 hover:text-red-500 cursor-pointer">
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total & Pay */}
                        <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                            <div className="flex justify-between text-lg font-bold text-text-primary dark:text-white mb-4">
                                <span>Total</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            <Button fullWidth size="lg" icon={HiOutlineCash} disabled={cart.length === 0}>
                                Process Payment
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </ModulePage>
    );
};

export default POSPage;
