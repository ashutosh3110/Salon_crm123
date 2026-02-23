import { useState, useEffect, useMemo } from 'react';
import {
    Search, ShoppingCart, Plus, Minus, X, Trash2,
    CreditCard, Banknote, Smartphone, Ban, Receipt,
    Tag, Gift, Star, User, UserPlus, Store,
    Scissors, Package, Check, ChevronDown, Loader2,
    Sparkles, Zap
} from 'lucide-react';
import api from '../../../services/api';

export default function POSBillingPage() {
    // ─── Data State ────────────────────────────────────────
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [staff, setStaff] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    // ─── Cart State ────────────────────────────────────────
    const [cart, setCart] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [taxPercent, setTaxPercent] = useState(18);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(0);
    const [loyaltyBalance, setLoyaltyBalance] = useState(0);

    // ─── UI State ──────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('services');
    const [searchItem, setSearchItem] = useState('');
    const [searchClient, setSearchClient] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [checkingOut, setCheckingOut] = useState(false);
    const [successInvoice, setSuccessInvoice] = useState(null);
    const [showNewClient, setShowNewClient] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', gender: 'female' });

    // ─── Fetch Data ────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [sRes, pRes, cRes, oRes, uRes, prRes] = await Promise.all([
                    api.get('/services').catch(() => ({ data: [] })),
                    api.get('/products').catch(() => ({ data: [] })),
                    api.get('/clients').catch(() => ({ data: [] })),
                    api.get('/outlets').catch(() => ({ data: [] })),
                    api.get('/users').catch(() => ({ data: [] })),
                    api.get('/promotions/active').catch(() => ({ data: [] })),
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

    // Auto-select first outlet
    useEffect(() => {
        if (outlets.length > 0 && !selectedOutlet) {
            setSelectedOutlet(outlets[0]);
        }
    }, [outlets]);

    // Fetch loyalty balance when client changes
    useEffect(() => {
        if (selectedClient?._id) {
            api.get(`/loyalty/wallet/${selectedClient._id}`)
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

    // ─── Categories ────────────────────────────────────────
    const categories = useMemo(() => {
        const items = activeTab === 'services' ? services : products;
        const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
        return ['All', ...cats];
    }, [activeTab, services, products]);

    // ─── Filtered Items ────────────────────────────────────
    const filteredItems = useMemo(() => {
        const items = activeTab === 'services' ? services : products;
        return items.filter(item => {
            const matchSearch = item.name?.toLowerCase().includes(searchItem.toLowerCase());
            const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchStatus = item.status === 'active';
            return matchSearch && matchCategory && matchStatus;
        });
    }, [activeTab, services, products, searchItem, selectedCategory]);

    // ─── Client Search ─────────────────────────────────────
    const filteredClients = useMemo(() => {
        if (!searchClient) return clients.slice(0, 8);
        return clients.filter(c =>
            c.name?.toLowerCase().includes(searchClient.toLowerCase()) ||
            c.phone?.includes(searchClient) ||
            c.email?.toLowerCase().includes(searchClient.toLowerCase())
        );
    }, [clients, searchClient]);

    // ─── Cart Operations ───────────────────────────────────
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

    // ─── Calculations ──────────────────────────────────────
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

    // ─── Create New Client ─────────────────────────────────
    const handleCreateClient = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/clients', newClientForm);
            const newClient = res?.data?.data || res?.data;
            setClients(prev => [newClient, ...prev]);
            setSelectedClient(newClient);
            setShowNewClient(false);
            setSearchClient('');
            setNewClientForm({ name: '', phone: '', email: '', gender: 'female' });
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating client');
        }
    };

    // ─── Checkout ──────────────────────────────────────────
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
            };

            const res = await api.post('/pos/checkout', payload);
            const invoice = res?.data?.data || res?.data;
            setSuccessInvoice(invoice);
        } catch (err) {
            alert(err.response?.data?.message || 'Checkout failed. Please try again.');
        } finally {
            setCheckingOut(false);
        }
    };

    // ─── Reset After Success ───────────────────────────────
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

    // ─── Payment Method Config ─────────────────────────────
    const paymentMethods = [
        { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-600 bg-green-50 border-green-200' },
        { id: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { id: 'online', label: 'UPI', icon: Smartphone, color: 'text-purple-600 bg-purple-50 border-purple-200' },
        { id: 'unpaid', label: 'Unpaid', icon: Ban, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    ];

    // ═══════════════════════════════════════════════════════
    // ─── SUCCESS SCREEN ────────────────────────────────────
    // ═══════════════════════════════════════════════════════
    if (successInvoice) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
                <div className="bg-white rounded-3xl border border-border shadow-xl p-8 max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text">Payment Successful!</h2>
                        <p className="text-text-secondary mt-2">Invoice created successfully.</p>
                    </div>
                    <div className="bg-surface rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Invoice No.</span>
                            <span className="font-bold text-primary">{successInvoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Amount Paid</span>
                            <span className="font-bold text-text">₹{successInvoice.total?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Payment Method</span>
                            <span className="font-medium text-text capitalize">{successInvoice.paymentMethod}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 px-4 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface transition-colors flex items-center justify-center gap-2"
                        >
                            <Receipt className="w-4 h-4" /> Print
                        </button>
                        <button
                            onClick={handleNewBill}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> New Bill
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    // ─── LOADING STATE ─────────────────────────────────────
    // ═══════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-text-secondary text-sm font-medium">Loading POS Terminal...</p>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    // ─── MAIN POS LAYOUT ───────────────────────────────────
    // ═══════════════════════════════════════════════════════
    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2">
                        <Zap className="w-6 h-6 text-primary" /> Quick Billing
                    </h1>
                    <p className="text-sm text-text-secondary mt-0.5">Fast checkout for walk-ins and appointments.</p>
                </div>
                {cart.length > 0 && (
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/20">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary">{cart.length} items</span>
                        <span className="text-sm text-text-secondary">• ₹{subTotal.toLocaleString()}</span>
                    </div>
                )}
            </div>

            {/* Split Layout */}
            <div className="flex flex-col lg:flex-row gap-5">
                {/* ═══ LEFT PANEL — Item Selection ═══ */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Tab Switcher */}
                    <div className="flex items-center gap-2 bg-surface rounded-xl p-1">
                        <button
                            onClick={() => { setActiveTab('services'); setSelectedCategory('All'); setSearchItem(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'services' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text'}`}
                        >
                            <Scissors className="w-4 h-4" /> Services
                        </button>
                        <button
                            onClick={() => { setActiveTab('products'); setSelectedCategory('All'); setSearchItem(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'products' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text'}`}
                        >
                            <Package className="w-4 h-4" /> Products
                        </button>
                    </div>

                    {/* Search + Categories */}
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                value={searchItem}
                                onChange={(e) => setSearchItem(e.target.value)}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white border border-border text-text-secondary hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Item Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-text-muted text-sm">
                                No {activeTab} found.
                            </div>
                        ) : (
                            filteredItems.map(item => {
                                const inCart = cart.find(c => c.itemId === item._id && c.type === (activeTab === 'services' ? 'service' : 'product'));
                                return (
                                    <button
                                        key={item._id}
                                        onClick={() => addToCart(item)}
                                        className={`text-left p-4 rounded-2xl border transition-all hover:shadow-md active:scale-[0.98] group ${inCart
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                            : 'border-border bg-white hover:border-primary/40'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inCart ? 'bg-primary text-white' : 'bg-surface text-text-muted group-hover:bg-primary/10 group-hover:text-primary'} transition-colors`}>
                                                {activeTab === 'services' ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                            </div>
                                            {inCart && (
                                                <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
                                                    ×{inCart.quantity}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-text leading-tight line-clamp-2">{item.name}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-base font-bold text-primary">₹{item.price?.toLocaleString()}</span>
                                            {item.duration && (
                                                <span className="text-[10px] text-text-muted font-medium">{item.duration}min</span>
                                            )}
                                        </div>
                                        {item.category && (
                                            <span className="text-[10px] text-text-muted mt-1 block">{item.category}</span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT PANEL — Cart & Checkout ═══ */}
                <div className="w-full lg:w-[420px] shrink-0 space-y-4">
                    {/* Client Selector */}
                    <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-text flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" /> Client
                            </h3>
                            {selectedClient && (
                                <button onClick={() => { setSelectedClient(null); setSearchClient(''); }} className="text-[10px] text-text-muted hover:text-red-500 transition-colors">
                                    Clear
                                </button>
                            )}
                        </div>
                        {selectedClient ? (
                            <div className="flex items-center gap-3 bg-surface rounded-xl p-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text truncate">{selectedClient.name}</p>
                                    <p className="text-[11px] text-text-muted">{selectedClient.phone}</p>
                                </div>
                                {loyaltyBalance > 0 && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        <span className="text-[10px] font-bold text-yellow-700">{loyaltyBalance} pts</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    value={searchClient}
                                    onChange={(e) => { setSearchClient(e.target.value); setShowClientDropdown(true); }}
                                    onFocus={() => setShowClientDropdown(true)}
                                    placeholder="Search by name, phone, or email..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                {showClientDropdown && (
                                    <div className="absolute z-50 top-full mt-1 w-full bg-white border border-border rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                        {filteredClients.map(c => (
                                            <button
                                                key={c._id}
                                                onClick={() => { setSelectedClient(c); setShowClientDropdown(false); setSearchClient(''); }}
                                                className="w-full text-left px-4 py-3 hover:bg-surface transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-text truncate">{c.name}</p>
                                                    <p className="text-[11px] text-text-muted">{c.phone}</p>
                                                </div>
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => { setShowClientDropdown(false); setShowNewClient(true); }}
                                            className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-center gap-2 text-primary font-semibold text-sm"
                                        >
                                            <UserPlus className="w-4 h-4" /> Add New Client
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* New Client Inline Form */}
                        {showNewClient && (
                            <form onSubmit={handleCreateClient} className="bg-surface rounded-xl p-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <p className="text-xs font-bold text-text mb-1">Quick Add Client</p>
                                <input required value={newClientForm.name} onChange={e => setNewClientForm(p => ({ ...p, name: e.target.value }))} placeholder="Name *" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                <input required value={newClientForm.phone} onChange={e => setNewClientForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone *" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                <input value={newClientForm.email} onChange={e => setNewClientForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">Save</button>
                                    <button type="button" onClick={() => setShowNewClient(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-white transition-colors">Cancel</button>
                                </div>
                            </form>
                        )}

                        {/* Outlet Selector */}
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-text-muted" />
                            <select
                                value={selectedOutlet?._id || ''}
                                onChange={(e) => setSelectedOutlet(outlets.find(o => o._id === e.target.value))}
                                className="flex-1 text-sm py-1.5 px-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {outlets.map(o => (
                                    <option key={o._id} value={o._id}>{o.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="bg-white rounded-2xl border border-border overflow-hidden">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-bold text-text flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-primary" /> Cart
                            </h3>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-[10px] text-text-muted hover:text-red-500 transition-colors">
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="max-h-[280px] overflow-y-auto divide-y divide-border/50">
                            {cart.length === 0 ? (
                                <div className="py-10 text-center">
                                    <ShoppingCart className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
                                    <p className="text-sm text-text-muted">Tap items to add to cart</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="px-4 py-3 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${item.type === 'service' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {item.type === 'service' ? 'SRV' : 'PRD'}
                                                    </span>
                                                    <p className="text-sm font-semibold text-text truncate">{item.name}</p>
                                                </div>
                                                <p className="text-xs text-text-muted mt-0.5">₹{item.price.toLocaleString()} × {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-bold text-text whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            {/* Stylist (for services) */}
                                            {item.type === 'service' ? (
                                                <select
                                                    value={item.stylistId || ''}
                                                    onChange={(e) => assignStylist(index, e.target.value || null)}
                                                    className="text-[11px] py-1 px-2 rounded-lg border border-border bg-surface flex-1 max-w-[160px] focus:outline-none"
                                                >
                                                    <option value="">No stylist</option>
                                                    {staff.map(s => (
                                                        <option key={s._id} value={s._id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            ) : <div />}
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => updateQuantity(index, -1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition-colors">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(index, 1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition-colors">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => removeFromCart(index)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors ml-1">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Summary, Discounts, Payment */}
                    {cart.length > 0 && (
                        <div className="bg-white rounded-2xl border border-border p-4 space-y-4">
                            {/* Promotion Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                                    <Tag className="w-3.5 h-3.5" /> Apply Promotion
                                </label>
                                <select
                                    value={selectedPromotion?._id || ''}
                                    onChange={(e) => setSelectedPromotion(promotions.find(p => p._id === e.target.value) || null)}
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">No promotion</option>
                                    {promotions.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} ({p.discountType === 'percentage' ? `${p.discountValue}%` : `₹${p.discountValue}`})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Loyalty Points */}
                            {selectedClient && loyaltyBalance > 0 && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-yellow-500" /> Use Loyalty Points (Available: {loyaltyBalance})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={loyaltyBalance}
                                        value={useLoyaltyPoints}
                                        onChange={(e) => setUseLoyaltyPoints(Math.min(Number(e.target.value), loyaltyBalance))}
                                        className="w-full text-sm py-2 px-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            )}

                            {/* Tax */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary">Tax %</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={taxPercent}
                                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Totals */}
                            <div className="border-t border-border pt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Subtotal</span>
                                    <span className="font-medium text-text">₹{subTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Tax ({taxPercent}%)</span>
                                    <span className="font-medium text-text">+₹{taxAmount.toLocaleString()}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600">Discount</span>
                                        <span className="font-medium text-green-600">-₹{totalDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed border-border">
                                    <span className="text-text">Grand Total</span>
                                    <span className="text-primary">₹{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary">Payment Method</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {paymentMethods.map(pm => (
                                        <button
                                            key={pm.id}
                                            onClick={() => setPaymentMethod(pm.id)}
                                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${paymentMethod === pm.id
                                                ? pm.color + ' ring-1 ring-offset-1 shadow-sm'
                                                : 'border-border bg-white text-text-secondary hover:bg-surface'
                                                }`}
                                        >
                                            <pm.icon className="w-4 h-4" />
                                            {pm.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut || !selectedClient || cart.length === 0}
                                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
                            >
                                {checkingOut ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Charge ₹{grandTotal.toLocaleString()}</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
