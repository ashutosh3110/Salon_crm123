import { useState, useEffect, useMemo } from 'react';
import {
    Search, ShoppingCart, Plus, Minus, X, Trash2,
    CreditCard, Banknote, Smartphone, Ban, Receipt,
    Tag, Gift, Star, User, UserPlus, Store,
    Scissors, Package, Check, ChevronDown, Loader2,
    Sparkles, Zap
} from 'lucide-react';
import mockApi from '../../../services/mock/mockApi';

export default function POSBillingPage() {
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [staff, setStaff] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [taxPercent, setTaxPercent] = useState(18);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(0);
    const [loyaltyBalance, setLoyaltyBalance] = useState(0);

    const [activeTab, setActiveTab] = useState('services');
    const [searchItem, setSearchItem] = useState('');
    const [searchClient, setSearchClient] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [checkingOut, setCheckingOut] = useState(false);
    const [successInvoice, setSuccessInvoice] = useState(null);
    const [showNewClient, setShowNewClient] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', gender: 'female' });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [sRes, pRes, cRes, oRes, uRes, prRes] = await Promise.all([
                    mockApi.get('/services').catch(() => ({ data: [] })),
                    mockApi.get('/products').catch(() => ({ data: [] })),
                    mockApi.get('/clients').catch(() => ({ data: [] })),
                    mockApi.get('/outlets').catch(() => ({ data: [] })),
                    mockApi.get('/users').catch(() => ({ data: [] })),
                    mockApi.get('/promotions/active').catch(() => ({ data: [] })),
                ]);
                const extract = (res) => res?.data?.data?.results || res?.data?.results || res?.data?.data || res?.data || [];
                setServices(Array.isArray(extract(sRes)) ? extract(sRes) : []);
                setProducts(Array.isArray(extract(pRes)) ? extract(pRes) : []);
                setClients(Array.isArray(extract(cRes)) ? extract(cRes) : []);
                setOutlets(Array.isArray(extract(oRes)) ? extract(oRes) : []);
                setStaff(Array.isArray(extract(uRes)) ? extract(uRes) : []);
                setPromotions(Array.isArray(extract(prRes)) ? extract(prRes) : []);
            } catch (err) {
                console.error('Failed to fetch POS data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        if (outlets.length > 0 && !selectedOutlet) {
            setSelectedOutlet(outlets[0]);
        }
    }, [outlets]);

    useEffect(() => {
        if (selectedClient?._id) {
            mockApi.get(`/loyalty/wallet/${selectedClient._id}`)
                .then(res => {
                    const pts = res?.data?.data?.points || res?.data?.points || selectedClient?.loyaltyPoints || 0;
                    setLoyaltyBalance(pts);
                })
                .catch(() => setLoyaltyBalance(selectedClient?.loyaltyPoints || 0));
        } else {
            setLoyaltyBalance(0);
        }
        setUseLoyaltyPoints(0);
    }, [selectedClient]);

    const categories = useMemo(() => {
        const items = activeTab === 'services' ? services : products;
        const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
        return ['All', ...cats];
    }, [activeTab, services, products]);

    const filteredItems = useMemo(() => {
        const items = activeTab === 'services' ? services : products;
        return items.filter(item => {
            const matchSearch = item.name?.toLowerCase().includes(searchItem.toLowerCase());
            const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchStatus = (item.status === 'active' || !item.status);
            return matchSearch && matchCategory && matchStatus;
        });
    }, [activeTab, services, products, searchItem, selectedCategory]);

    const filteredClients = useMemo(() => {
        if (!searchClient) return clients.slice(0, 8);
        return clients.filter(c =>
            c.name?.toLowerCase().includes(searchClient.toLowerCase()) ||
            c.phone?.includes(searchClient) ||
            c.email?.toLowerCase().includes(searchClient.toLowerCase())
        );
    }, [clients, searchClient]);

    const addToCart = (item) => {
        const type = activeTab === 'services' ? 'service' : 'product';
        const existing = cart.find(c => c.itemId === item._id && c.type === type);
        if (existing) {
            setCart(cart.map(c =>
                c.itemId === item._id && c.type === type
                    ? { ...c, quantity: c.quantity + 1 }
                    : c
            ));
        } else {
            setCart([...cart, {
                type,
                itemId: item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                stylistId: null,
                duration: item.duration || null,
            }]);
        }
    };

    const updateQuantity = (index, delta) => {
        setCart(cart.map((item, i) => {
            if (i !== index) return item;
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
        }));
    };

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const assignStylist = (index, stylistId) => {
        setCart(cart.map((item, i) =>
            i === index ? { ...item, stylistId } : item
        ));
    };

    const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAmount = Math.round(subTotal * (taxPercent / 100));
    const loyaltyDiscount = useLoyaltyPoints;
    const promoDiscount = selectedPromotion
        ? selectedPromotion.discountType === 'percentage'
            ? Math.round(subTotal * (selectedPromotion.discountValue / 100))
            : selectedPromotion.discountValue || 0
        : 0;
    const totalDiscount = loyaltyDiscount + promoDiscount;
    const grandTotal = Math.max(0, subTotal + taxAmount - totalDiscount);

    const handleCreateClient = async (e) => {
        e.preventDefault();
        try {
            const res = await mockApi.post('/clients', newClientForm);
            const newClient = res?.data?.data || res?.data;
            setClients(prev => [newClient, ...prev]);
            setSelectedClient(newClient);
            setShowNewClient(false);
            setSearchClient('');
            setNewClientForm({ name: '', phone: '', email: '', gender: 'female' });
        } catch (err) {
            alert('Error creating client');
        }
    };

    const handleCheckout = async () => {
        if (!selectedClient) { alert('Please select a client'); return; }
        if (!selectedOutlet) { alert('Please select an outlet'); return; }
        if (cart.length === 0) { alert('Cart is empty'); return; }

        setCheckingOut(true);
        try {
            const payload = {
                clientId: selectedClient._id,
                outletId: selectedOutlet._id,
                items: cart.map(item => ({
                    type: item.type,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    ...(item.stylistId && { stylistId: item.stylistId }),
                })),
                paymentMethod,
                tax: taxAmount,
                useLoyaltyPoints,
                ...(selectedPromotion && { promotionId: selectedPromotion._id }),
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                total: grandTotal,
                createdAt: new Date().toISOString()
            };

            const res = await mockApi.post('/pos/checkout', payload);
            const invoice = res?.data?.data || res?.data;
            setSuccessInvoice(invoice);
        } catch (err) {
            alert('Checkout failed.');
        } finally {
            setCheckingOut(false);
        }
    };

    const handleNewBill = () => {
        setCart([]);
        setSelectedClient(null);
        setPaymentMethod('cash');
        setSelectedPromotion(null);
        setUseLoyaltyPoints(0);
        setSuccessInvoice(null);
        setSearchClient('');
        setSearchItem('');
    };

    const paymentMethods = [
        { id: 'cash', label: 'Cash', icon: Banknote },
        { id: 'card', label: 'Card', icon: CreditCard },
        { id: 'online', label: 'UPI', icon: Smartphone },
        { id: 'unpaid', label: 'Unpaid', icon: Ban },
    ];

    if (successInvoice) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
                <div className="bg-surface border border-border p-10 max-w-md w-full text-center space-y-8">
                    <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto transform rotate-45">
                        <Check className="w-12 h-12 text-emerald-600 -rotate-45" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text uppercase italic tracking-tighter">Payment Success</h2>
                        <p className="text-text-secondary mt-2 text-xs font-bold uppercase tracking-widest opacity-60">Verified Mock Invoice Generated</p>
                    </div>
                    <div className="bg-surface border border-border p-4 space-y-3">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                            <span className="text-text-secondary">Doc No.</span>
                            <span className="text-primary">{successInvoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                            <span className="text-text-secondary">Total Charge</span>
                            <span className="text-text">₹{successInvoice.total?.toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={handleNewBill} className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all">
                        Start New Bill
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-text-muted">Loading Terminal...</div>;

    return (
        <div className="animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="text-left font-black">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tighter flex items-center gap-4">
                        <Zap className="w-7 h-7 text-primary" /> POS Terminal
                    </h1>
                    <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.25em]">Offline Deployment Protocol Active</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div className="flex gap-2 p-1.5 bg-surface-alt border border-border">
                        <button onClick={() => setActiveTab('services')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'services' ? 'bg-primary text-white' : 'text-text-muted hover:bg-white'}`}>Services</button>
                        <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'products' ? 'bg-primary text-white' : 'text-text-muted hover:bg-white'}`}>Products</button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" value={searchItem} onChange={(e) => setSearchItem(e.target.value)} placeholder="Search identifier..." className="w-full pl-12 pr-4 py-4 border border-border bg-surface text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredItems.map(item => (
                            <button key={item._id} onClick={() => addToCart(item)} className="text-left p-6 border border-border bg-white hover:border-primary transition-colors flex flex-col justify-between group">
                                <p className="text-[12px] font-black text-text uppercase italic tracking-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">{item.name}</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-xl font-black text-text">₹{item.price}</span>
                                    <Plus className="w-4 h-4 text-primary opacity-20 group-hover:opacity-100" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-[450px] space-y-6 text-left">
                    <div className="bg-white border border-border p-6 space-y-4 shadow-sm text-left">
                        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 italic">Entity Verification</p>
                        {selectedClient ? (
                            <div className="p-4 border border-primary bg-primary/5 flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-[13px] font-black text-text uppercase tracking-tight">{selectedClient.name}</p>
                                    <p className="text-[10px] font-bold text-text-muted tracking-widest mt-1">{selectedClient.phone}</p>
                                </div>
                                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-primary/10 transition-colors"><X className="w-4 h-4 text-primary" /></button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input type="text" value={searchClient} onChange={(e) => {setSearchClient(e.target.value); setShowClientDropdown(true)}} placeholder="Client Name/Phone..." className="w-full p-4 border border-border text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all" />
                                {showClientDropdown && searchClient && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-border z-10 shadow-xl divide-y divide-border">
                                        {filteredClients.map(c => (
                                            <button key={c._id} onClick={() => {setSelectedClient(c); setShowClientDropdown(false)}} className="w-full p-4 text-left hover:bg-surface-alt transition-colors">
                                                <p className="text-[11px] font-black text-text uppercase">{c.name}</p>
                                                <p className="text-[10px] text-text-muted">{c.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-border overflow-hidden text-left h-full flex flex-col min-h-[400px]">
                        <div className="p-4 border-b border-border bg-surface-alt/50 text-left">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Transaction Buffer ({cart.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-border text-left">
                            {cart.map((item, index) => (
                                <div key={index} className="p-5 flex items-start justify-between group transition-colors hover:bg-surface-alt/30 text-left">
                                    <div className="flex-1 text-left">
                                        <p className="text-[11px] font-black text-text uppercase italic tracking-tight">{item.name}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-1 border border-border p-1">
                                                <button onClick={() => updateQuantity(index, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-primary hover:text-white"><Minus className="w-3 h-3" /></button>
                                                <span className="w-8 text-center text-[10px] font-black">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(index, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-primary hover:text-white"><Plus className="w-3 h-3" /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(index)} className="text-rose-500 opacity-20 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-text">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-surface-alt border-t border-border space-y-4 text-left">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest opacity-40">
                                <span>Subtotal Buffer</span>
                                <span>₹{subTotal}</span>
                            </div>
                            <div className="flex items-center justify-between text-2xl font-black uppercase tracking-tighter">
                                <span>Total Payload</span>
                                <span className="text-primary">₹{grandTotal}</span>
                            </div>
                            <button onClick={handleCheckout} disabled={checkingOut || !selectedClient || cart.length === 0} className="w-full py-5 bg-text text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all disabled:opacity-20 flex items-center justify-center gap-3">
                                {checkingOut ? 'Committing...' : 'Initialize Charge'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
