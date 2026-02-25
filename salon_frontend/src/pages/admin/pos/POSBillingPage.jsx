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
                <div className="bg-surface rounded-none border border-border shadow-xl p-10 max-w-md w-full text-center space-y-8">
                    <div className="w-24 h-24 rounded-none bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto transform rotate-45">
                        <Check className="w-12 h-12 text-emerald-600 -rotate-45" />
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
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 px-6 py-4 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all flex items-center justify-center gap-3"
                        >
                            <Receipt className="w-4 h-4 opacity-40" /> Print Manifest
                        </button>
                        <button
                            onClick={handleNewBill}
                            className="flex-1 px-6 py-4 rounded-none bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-dark shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-3"
                        >
                            <Plus className="w-4 h-4" /> Reset Terminal
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
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-none animate-spin" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Initialising terminal interface...</p>
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight flex items-center gap-4">
                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-none"><Zap className="w-6 h-6 text-primary" /></div>
                        Retail Terminal
                    </h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Real-time inventory & transaction sync active</p>
                </div>
                {cart.length > 0 && (
                    <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 bg-primary/5 rounded-none border border-primary/20 shadow-sm">
                        <ShoppingCart className="w-4 h-4 text-primary opacity-60" />
                        <span className="text-[11px] font-black text-primary uppercase tracking-widest">{cart.length} UNITS</span>
                        <div className="w-px h-3 bg-primary/20" />
                        <span className="text-[11px] font-black text-text uppercase tracking-widest">₹{subTotal.toLocaleString()}</span>
                    </div>
                )}
            </div>

            {/* Split Layout */}
            <div className="flex flex-col lg:flex-row gap-5">
                {/* ═══ LEFT PANEL — Item Selection ═══ */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Tab Switcher */}
                    <div className="flex items-center gap-2 bg-surface-alt rounded-none p-1.5 border border-border">
                        <button
                            onClick={() => { setActiveTab('services'); setSelectedCategory('All'); setSearchItem(''); }}
                            className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'services' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text hover:bg-surface'}`}
                        >
                            <Scissors className="w-4 h-4" /> Service Modules
                        </button>
                        <button
                            onClick={() => { setActiveTab('products'); setSelectedCategory('All'); setSearchItem(''); }}
                            className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text hover:bg-surface'}`}
                        >
                            <Package className="w-4 h-4" /> Physical Stocks
                        </button>
                    </div>

                    {/* Search + Categories */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchItem}
                                onChange={(e) => setSearchItem(e.target.value)}
                                placeholder={`Scan for ${activeTab} identifier...`}
                                className="w-full pl-12 pr-4 py-3.5 rounded-none border border-border bg-surface-alt text-[10px] font-black uppercase tracking-[0.2em] focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/40"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2.5 rounded-none text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${selectedCategory === cat
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-surface border-border text-text-muted hover:border-primary/40 hover:text-primary'
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
                            <div className="col-span-full text-center py-20 border border-dashed border-border rounded-none bg-surface-alt/30">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">No matching entities found in database</p>
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
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-10 h-10 rounded-none flex items-center justify-center border transition-all ${inCart ? 'bg-primary text-white border-primary' : 'bg-surface-alt text-text-muted border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20'}`}>
                                                {activeTab === 'services' ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                            </div>
                                            {inCart && (
                                                <span className="text-[9px] font-black bg-primary text-white px-2 py-1 rounded-none uppercase tracking-widest shadow-lg shadow-primary/20 leading-none">
                                                    QTY {inCart.quantity}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-black text-text uppercase tracking-widest leading-normal mb-3 line-clamp-2 min-h-[2.4em]">{item.name}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-xl font-black text-primary tracking-tight">₹{item.price?.toLocaleString()}</span>
                                            {item.duration && (
                                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest bg-surface-alt px-2 py-1 border border-border">{item.duration} Min Slot</span>
                                            )}
                                        </div>
                                        {item.category && (
                                            <span className="text-[8px] font-black text-text-muted mt-3 block uppercase tracking-widest opacity-40">{item.category} Registry</span>
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
                    <div className="bg-surface rounded-none border border-border p-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="text-[10px] font-black text-text-muted flex items-center gap-3 uppercase tracking-[0.2em]">
                                <User className="w-3.5 h-3.5 text-primary" /> Entity Identification
                            </h3>
                            {selectedClient && (
                                <button onClick={() => { setSelectedClient(null); setSearchClient(''); }} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                                    Release
                                </button>
                            )}
                        </div>
                        {selectedClient ? (
                            <div className="flex items-center gap-5 bg-surface-alt rounded-none border border-border p-5 group transition-all">
                                <div className="w-12 h-12 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                                    <User className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-text uppercase tracking-tight truncate">{selectedClient.name}</p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{selectedClient.phone} • REGISTRY ACTIVE</p>
                                </div>
                                {loyaltyBalance > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-none">
                                        <Star className="w-3.5 h-3.5 text-yellow-600" />
                                        <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">{loyaltyBalance} PTS</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchClient}
                                    onChange={(e) => { setSearchClient(e.target.value); setShowClientDropdown(true); }}
                                    onFocus={() => setShowClientDropdown(true)}
                                    placeholder="Input entity identifier..."
                                    className="w-full pl-12 pr-4 py-3.5 rounded-none border border-border bg-surface-alt text-[10px] font-black uppercase tracking-[0.2em] focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/40"
                                />
                                {showClientDropdown && (
                                    <div className="absolute z-50 top-full mt-2 w-full bg-surface border border-border rounded-none shadow-2xl divide-y divide-border overflow-hidden">
                                        {filteredClients.map(c => (
                                            <button
                                                key={c._id}
                                                onClick={() => { setSelectedClient(c); setShowClientDropdown(false); setSearchClient(''); }}
                                                className="w-full text-left px-5 py-4 hover:bg-surface-alt transition-all flex items-center gap-4 group"
                                            >
                                                <div className="w-9 h-9 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-black text-text uppercase tracking-tight truncate">{c.name}</p>
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{c.phone}</p>
                                                </div>
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => { setShowClientDropdown(false); setShowNewClient(true); }}
                                            className="w-full text-left px-5 py-4 hover:bg-primary transition-all flex items-center gap-3 text-primary hover:text-white font-black text-[10px] uppercase tracking-[0.2em]"
                                        >
                                            <UserPlus className="w-4 h-4" /> Initialize New Entity Record
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* New Client Inline Form */}
                        {showNewClient && (
                            <form onSubmit={handleCreateClient} className="bg-surface-alt rounded-none border border-border p-5 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <p className="text-[10px] font-black text-text uppercase tracking-[0.2em] border-b border-border pb-2 mb-4">Draft Entity Profile</p>
                                <input required value={newClientForm.name} onChange={e => setNewClientForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Entity Name *" className="w-full px-4 py-3 rounded-none border border-border bg-surface text-[10px] font-black uppercase tracking-[0.2em] focus:ring-2 focus:ring-primary/20 outline-none" />
                                <input required value={newClientForm.phone} onChange={e => setNewClientForm(p => ({ ...p, phone: e.target.value }))} placeholder="Mobile Descriptor *" className="w-full px-4 py-3 rounded-none border border-border bg-surface text-[10px] font-black uppercase tracking-[0.2em] focus:ring-2 focus:ring-primary/20 outline-none" />
                                <input value={newClientForm.email} onChange={e => setNewClientForm(p => ({ ...p, email: e.target.value }))} placeholder="Digital Mailbox" className="w-full px-4 py-3 rounded-none border border-border bg-surface text-[10px] font-black uppercase tracking-[0.2em] focus:ring-2 focus:ring-primary/20 outline-none" />
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className="flex-1 py-3 rounded-none bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all">Commit Record</button>
                                    <button type="button" onClick={() => setShowNewClient(false)} className="px-6 py-3 rounded-none border border-border bg-surface text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                </div>
                            </form>
                        )}

                        {/* Outlet Selector */}
                        <div className="flex items-center gap-4 bg-surface-alt p-4 border border-border rounded-none">
                            <Store className="w-4 h-4 text-primary/60" />
                            <select
                                value={selectedOutlet?._id || ''}
                                onChange={(e) => setSelectedOutlet(outlets.find(o => o._id === e.target.value))}
                                className="flex-1 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] outline-none cursor-pointer"
                            >
                                {outlets.map(o => (
                                    <option key={o._id} value={o._id}>{o.name} NODE</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-alt/50">
                            <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em] flex items-center gap-3">
                                <ShoppingCart className="w-3.5 h-3.5 text-primary" /> Transmission Buffer
                            </h3>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                                    Purge
                                </button>
                            )}
                        </div>

                        <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
                            {cart.length === 0 ? (
                                <div className="py-16 text-center bg-surface-alt/20">
                                    <ShoppingCart className="w-10 h-10 text-text-muted/20 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Awaiting input stream...</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="px-6 py-5 space-y-4 hover:bg-surface-alt/50 transition-all group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-none border ${item.type === 'service' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                        {item.type === 'service' ? 'SRV' : 'PRD'}
                                                    </span>
                                                    <p className="text-[11px] font-black text-text uppercase tracking-widest truncate">{item.name}</p>
                                                </div>
                                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest opacity-60">₹{item.price.toLocaleString()} × {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-black text-text tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 pt-1">
                                            {/* Stylist (for services) */}
                                            {item.type === 'service' ? (
                                                <div className="flex-1 max-w-[180px] relative">
                                                    <select
                                                        value={item.stylistId || ''}
                                                        onChange={(e) => assignStylist(index, e.target.value || null)}
                                                        className="w-full text-[10px] font-black uppercase tracking-[0.1em] py-2 px-3 pr-8 rounded-none border border-border bg-surface outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary/40 transition-all"
                                                    >
                                                        <option value="">No Operator</option>
                                                        {staff.map(s => (
                                                            <option key={s._id} value={s._id}>{s.name.toUpperCase()}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                                                </div>
                                            ) : <div />}
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-1 bg-surface border border-border p-1">
                                                <button onClick={() => updateQuantity(index, -1)} className="w-8 h-8 rounded-none flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-10 text-center text-[11px] font-black">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(index, 1)} className="w-8 h-8 rounded-none flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <div className="w-px h-6 bg-border mx-1" />
                                                <button onClick={() => removeFromCart(index)} className="w-8 h-8 rounded-none flex items-center justify-center text-text-muted hover:text-white hover:bg-red-500 transition-all">
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
                        <div className="bg-surface rounded-none border border-border p-6 space-y-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                            {/* Promotion Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted flex items-center gap-2 uppercase tracking-[0.2em]">
                                    <Tag className="w-3.5 h-3.5 text-primary" /> Protocol Incentive
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedPromotion?._id || ''}
                                        onChange={(e) => setSelectedPromotion(promotions.find(p => p._id === e.target.value) || null)}
                                        className="w-full text-[10px] font-black uppercase tracking-[0.1em] py-3.5 px-4 pr-10 rounded-none border border-border bg-surface-alt outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary/40 transition-all"
                                    >
                                        <option value="">Decline Promotion</option>
                                        {promotions.map(p => (
                                            <option key={p._id} value={p._id}>{p.name.toUpperCase()} (EXECUTE {p.discountType === 'percentage' ? `${p.discountValue}%` : `₹${p.discountValue}`})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Loyalty Points */}
                                {selectedClient && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted flex items-center gap-2 uppercase tracking-[0.2em]">
                                            <Star className="w-3.5 h-3.5 text-yellow-500" /> Points Credit
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={loyaltyBalance}
                                            value={useLoyaltyPoints}
                                            onChange={(e) => setUseLoyaltyPoints(Math.min(Number(e.target.value), loyaltyBalance))}
                                            placeholder={`MAX ${loyaltyBalance}`}
                                            className="w-full text-[10px] font-black uppercase tracking-[0.2em] py-3.5 px-4 rounded-none border border-border bg-surface-alt outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                                        />
                                    </div>
                                )}

                                {/* Tax */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Surcharge %</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={taxPercent}
                                        onChange={(e) => setTaxPercent(Number(e.target.value))}
                                        className="w-full text-[10px] font-black uppercase tracking-[0.2em] py-3.5 px-4 rounded-none border border-border bg-surface-alt outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-surface-alt p-5 border border-border space-y-3">
                                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                    <span>Raw Pulse subtotal</span>
                                    <span>₹{subTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                    <span>System Surcharge ({taxPercent}%)</span>
                                    <span className="text-text">+₹{taxAmount.toLocaleString()}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/5 p-2 border border-emerald-500/10">
                                        <span>Incentive applied</span>
                                        <span>-₹{totalDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-black pt-3 border-t border-border uppercase tracking-tight">
                                    <span className="text-text/40 text-xs mt-1">Total Payload</span>
                                    <span className="text-primary">₹{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Select Auth Protocol</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {paymentMethods.map(pm => (
                                        <button
                                            key={pm.id}
                                            onClick={() => setPaymentMethod(pm.id)}
                                            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-none border transition-all ${paymentMethod === pm.id
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 z-10'
                                                : 'border-border bg-surface text-text-muted hover:border-primary/40'
                                                }`}
                                        >
                                            <pm.icon className="w-4 h-4" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{pm.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut || !selectedClient || cart.length === 0}
                                className="w-full py-5 rounded-none bg-primary text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-2xl shadow-primary/40 active:scale-[0.98] mt-4"
                            >
                                {checkingOut ? (
                                    <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-none animate-spin" /> Committing...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Initialize Charge [₹{grandTotal.toLocaleString()}]</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
