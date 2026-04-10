import React, { useState, useMemo, useEffect } from 'react';
/* v1.0.5 - Integrated with Global Variable System & Light Theme Alignment */
import { 
    Package, 
    Scissors, 
    Store, 
    Users, 
    Calendar, 
    CheckCircle2, 
    ChevronRight, 
    Search, 
    Plus,
    Clock,
    User,
    ArrowRight,
    Zap,
    MapPin,
    Smartphone,
    CreditCard
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function NewBookingPage() {
    const { 
        outlets, 
        services, 
        staff, 
        customers, 
        fetchCustomers, 
        addBooking,
        fetchServices,
        fetchStaff
    } = useBusiness();
    
    // Booking State
    const [bookingData, setBookingData] = useState({
        outletId: '',
        serviceId: '',
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        staffId: ''
    });

    const [activeTab, setActiveTab] = useState('service'); // 'product' or 'service'
    const [step, setStep] = useState(1);
    const [showOutletModal, setShowOutletModal] = useState(!bookingData.outletId);

    const [searchTerm, setSearchTerm] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');

    useEffect(() => {
        fetchCustomers?.();
        fetchServices?.();
        fetchStaff?.();
    }, []);

    useEffect(() => {
        if (!bookingData.outletId) {
            setShowOutletModal(true);
        }
    }, [bookingData.outletId]);

    const selectedOutlet = useMemo(() => outlets.find(o => o._id === bookingData.outletId), [outlets, bookingData.outletId]);
    const selectedService = useMemo(() => services.find(s => s._id === bookingData.serviceId), [services, bookingData.serviceId]);
    const selectedCustomer = useMemo(() => customers.find(c => c._id === bookingData.customerId), [customers, bookingData.customerId]);
    const selectedStaff = useMemo(() => staff.find(s => s._id === bookingData.staffId), [staff, bookingData.staffId]);

    // Filtering logic
    const filteredServices = useMemo(() => {
        if (!bookingData.outletId) return [];
        return services.filter(s => {
            // If outletIds is empty or contains the current outlet or explicitly set to 'all'
            if (!s.outletIds || s.outletIds.length === 0) return true;
            if (s.outlet === 'all') return true;
            return s.outletIds.includes(bookingData.outletId);
        });
    }, [services, bookingData.outletId]);

    const filteredStaff = useMemo(() => {
        if (!bookingData.outletId) return [];
        return staff;
    }, [staff, bookingData.outletId]);

    const handleBooking = async () => {
        try {
            if (!bookingData.outletId || !bookingData.serviceId || !bookingData.customerId || !bookingData.date || !bookingData.time) {
                toast.error('ALL FIELDS ARE MANDATORY');
                return;
            }

            const appointmentDate = new Date(`${bookingData.date}T${bookingData.time}`);
            
            await addBooking({
                ...bookingData,
                appointmentDate,
                source: 'admin'
            });

            toast.success('BOOKING CREATED SUCCESSFULLY');
            setStep(1);
            setBookingData({
                outletId: '',
                serviceId: '',
                customerId: '',
                date: new Date().toISOString().split('T')[0],
                time: '12:00',
                staffId: ''
            });
            setShowOutletModal(true);

        } catch (err) {
            toast.error('BOOKING FAILED');
        }
    };

    const renderStepContent = () => {
        switch(step) {
            case 1: 
            case 2: // Select Service (Since 1 is in modal now)
                return (
                    <div className="space-y-8 animate-reveal">
                        <div className="flex items-center justify-between border-b border-border pb-6">
                            <div>
                                <h3 className="text-2xl font-black text-text uppercase tracking-tight">Step 02 :: Service Selection</h3>
                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">Available catalog at {selectedOutlet?.name}</p>
                            </div>
                            <button onClick={() => setShowOutletModal(true)} className="px-5 py-2.5 bg-surface-alt border border-border text-[9px] font-black text-primary uppercase tracking-widest hover:bg-surface transition-all flex items-center gap-2 group">
                                <MapPin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Change Outlet
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                                type="text"
                                placeholder="Search our catalog of services..."
                                className="w-full bg-surface-alt border border-border rounded-none pl-14 pr-4 py-5 text-sm font-bold text-text uppercase tracking-widest focus:border-primary outline-none transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.length === 0 ? (
                                <div className="col-span-full py-32 text-center text-text-muted italic opacity-30 border border-dashed border-border">No services configured for this operational hub.</div>
                            ) : (
                                filteredServices.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                                    <button 
                                        key={s._id}
                                        onClick={() => {
                                            setBookingData({...bookingData, serviceId: s._id});
                                            setStep(3);
                                        }}
                                        className={`group rounded-none border text-left transition-all relative overflow-hidden active:scale-[0.98] flex flex-col ${bookingData.serviceId === s._id ? 'border-primary ring-1 ring-primary shadow-xl' : 'border-border hover:border-primary/40 bg-surface'}`}
                                    >
                                        <div className="h-40 w-full bg-surface-alt relative overflow-hidden border-b border-border">
                                            {s.image ? (
                                                <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Zap className="w-8 h-8" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md border border-border px-3 py-1 text-[9px] font-black text-primary tracking-widest">
                                                ₹{s.price}
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-tight text-text mb-1">{s.name}</h4>
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest line-clamp-1">{s.category}</p>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-text-muted">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[8px] font-bold uppercase tracking-widest">{s.duration} MINS</span>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-all ${bookingData.serviceId === s._id ? 'text-primary' : 'text-text-muted group-hover:translate-x-1'}`} />
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 3: // Select Customer
                return (
                    <div className="space-y-6 animate-reveal">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-text uppercase tracking-tight">Step 03 :: Client Engagement</h3>
                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">Identify the customer for this appointment</p>
                            </div>
                            <button onClick={() => setStep(2)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Back to Services</button>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    className="w-full bg-surface-alt border border-border rounded-none pl-12 pr-4 py-4 text-xs font-bold text-text uppercase tracking-widest focus:border-primary outline-none transition-all"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                />
                            </div>
                            <button className="px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> NEW CLIENT
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {customers.filter(c => 
                                (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) || 
                                (c.phone || '').includes(customerSearch)
                            ).slice(0, 9).map(c => (
                                <button 
                                    key={c._id}
                                    onClick={() => {
                                        setBookingData({...bookingData, customerId: c._id});
                                        setStep(4);
                                    }}
                                    className={`p-4 rounded-none border flex items-center gap-4 transition-all group ${bookingData.customerId === c._id ? 'bg-primary/5 border-primary' : 'bg-surface border-border hover:bg-surface-alt'}`}
                                >
                                    <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${bookingData.customerId === c._id ? 'bg-primary text-white' : 'bg-surface-alt text-text-muted'}`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <h4 className={`text-[10px] font-black uppercase tracking-tight truncate ${bookingData.customerId === c._id ? 'text-text' : 'text-text-secondary'}`}>{c.name || 'Anonymous'}</h4>
                                        <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-text-muted">{c.phone || 'No phone'}</p>
                                    </div>
                                    {bookingData.customerId === c._id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 4: // Time & Staff
                return (
                    <div className="space-y-6 animate-reveal">
                         <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-text uppercase tracking-tight">Step 04 :: Time & Specialist</h3>
                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">Establish availability and assign personnel</p>
                            </div>
                            <button onClick={() => setStep(3)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Change Client</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> Date
                                    </label>
                                    <input 
                                        type="date"
                                        className="w-full bg-surface-alt border border-border rounded-none p-4 text-xs font-black text-text outline-none focus:border-primary transition-all"
                                        value={bookingData.date}
                                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" /> Time
                                    </label>
                                    <input 
                                        type="time"
                                        className="w-full bg-surface-alt border border-border rounded-none p-4 text-xs font-black text-text outline-none focus:border-primary transition-all"
                                        value={bookingData.time}
                                        onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <Scissors className="w-3.5 h-3.5" /> Assign Specialist
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {filteredStaff.map(s => (
                                        <button 
                                            key={s._id}
                                            onClick={() => setBookingData({...bookingData, staffId: s._id})}
                                            className={`p-4 rounded-none border flex items-center gap-4 transition-all ${bookingData.staffId === s._id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-surface-alt border-border hover:bg-surface'}`}
                                        >
                                            <div className="w-10 h-10 rounded-none bg-background flex items-center justify-center text-text-muted overflow-hidden relative border border-border">
                                                {s.profileImage ? <img src={s.profileImage} className="w-full h-full object-cover" /> : <User className="w-5 h-5" />}
                                            </div>
                                            <div className="text-left">
                                                <h4 className={`text-[10px] font-black uppercase tracking-tight ${bookingData.staffId === s._id ? 'text-white' : 'text-text'}`}>{s.name}</h4>
                                                <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${bookingData.staffId === s._id ? 'text-white/70' : 'text-text-muted'}`}>{s.specialization}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setStep(5)}
                            disabled={!bookingData.staffId}
                            className="w-full py-5 bg-primary text-white text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            Review Booking Details
                        </button>
                    </div>
                );
            case 5: // Confirmation
                return (
                    <div className="space-y-8 animate-reveal">
                        <div className="text-center space-y-2">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-none flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-xl">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-text uppercase tracking-tighter">Review Protocol</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Confirm administrative details before finalizing</p>
                        </div>

                        <div className="bg-surface border border-border p-8 rounded-none shadow-2xl space-y-8 max-w-2xl mx-auto border-double border-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Operational Hub</p>
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{selectedOutlet?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Service</p>
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{selectedService?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Time Slot</p>
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{bookingData.date} @ {bookingData.time}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Customer</p>
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{selectedCustomer?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Specialist</p>
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{selectedStaff?.name}</p>
                                    </div>
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Total Amount</p>
                                        <p className="text-2xl font-black text-emerald-600 tracking-tighter">₹{selectedService?.price}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button onClick={() => setStep(4)} className="flex-1 py-4 border border-border text-[10px] font-black text-text-muted uppercase tracking-widest hover:bg-surface-alt transition-all">Back to Edit</button>
                                <button onClick={handleBooking} className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">Confirm & Create Booking</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 lg:p-8 space-y-8 font-black text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-text uppercase tracking-tighter leading-none">New Direct Booking</h1>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mt-3">Administrative Workflow Engine</p>
                </div>
                
                <div className="flex items-center gap-1 bg-surface-alt p-1 border border-border rounded-none shadow-sm">
                    <button 
                        onClick={() => setActiveTab('product')}
                        className={`flex items-center gap-3 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'product' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text'}`}
                    >
                        <Package className="w-4 h-4" /> Product Order
                    </button>
                    <button 
                        onClick={() => setActiveTab('service')}
                        className={`flex items-center gap-3 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'service' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text'}`}
                    >
                        <Scissors className="w-4 h-4" /> Service Booking
                    </button>
                </div>
            </div>

            {activeTab === 'product' ? (
                <div className="bg-surface border border-dashed border-border p-32 flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 rounded-none bg-surface-alt flex items-center justify-center text-text-muted opacity-40">
                         <CreditCard className="w-8 h-8" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[12px] font-black text-text uppercase tracking-[0.4em]">Inventory Not Connected</p>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60">Product booking will be available in the next version.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="hidden lg:block lg:col-span-1 space-y-3">
                        {[
                            {s: 1, l: 'Location hub', i: Store},
                            {s: 2, l: 'Select Service', i: Zap},
                            {s: 3, l: 'Customer', i: Users},
                            {s: 4, l: 'Schedule', i: Clock},
                            {s: 5, l: 'Deployment', i: CheckCircle2}
                        ].map((item) => (
                            <div key={item.s} className={`flex items-center gap-4 transition-all duration-300 p-4 border-l-4 ${step === item.s ? 'border-primary bg-primary/5' : step > item.s ? 'border-emerald-500 opacity-60' : 'border-border opacity-40 grayscale'}`}>
                                <div className={`w-8 h-8 rounded-none flex items-center justify-center transition-all ${step === item.s ? 'bg-primary text-white' : step > item.s ? 'bg-emerald-500 text-white' : 'bg-surface-alt text-text-muted'}`}>
                                    <item.i className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className={`text-[8px] font-black uppercase tracking-widest ${step === item.s ? 'text-primary' : 'text-text-muted'}`}>Phase 0{item.s}</p>
                                    <h4 className={`text-[11px] font-black uppercase ${step === item.s ? 'text-text' : 'text-text-muted'}`}>{item.l}</h4>
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 p-6 bg-surface-alt border border-border">
                            <h5 className="text-[9px] font-black text-primary uppercase tracking-widest mb-3 border-b border-border pb-2">Active Summary</h5>
                            {bookingData.outletId && (
                                <div className="space-y-2">
                                    <p className="text-[8px] font-bold text-text uppercase tracking-tighter">@ {selectedOutlet?.name}</p>
                                    {bookingData.serviceId && <p className="text-[8px] font-bold text-text uppercase tracking-tighter">+ {selectedService?.name}</p>}
                                    {bookingData.customerId && <p className="text-[8px] font-bold text-text uppercase tracking-tighter">{">"} {selectedCustomer?.name}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-surface border border-border p-6 md:p-10 relative overflow-hidden shadow-sm">
                        <div className="relative z-10 min-h-[400px]">
                            {renderStepContent()}
                        </div>
                    </div>
                </div>
            )}

            {/* Outlet Selection Modal */}
            {showOutletModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 font-black">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                    <div className="relative w-full max-w-5xl bg-surface border border-border p-8 lg:p-12 shadow-2xl animate-in zoom-in-95">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border pb-8">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-black text-text uppercase tracking-tighter">Select a Venue</h2>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2">Identify the operation hub for this transaction</p>
                            </div>
                            <MapPin className="hidden md:block w-10 h-10 text-text-muted opacity-20" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {outlets.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-text-muted opacity-40 italic">Scanning systems for active outlets...</div>
                            ) : (
                                outlets.map(o => (
                                    <button 
                                        key={o._id}
                                        onClick={() => {
                                            setBookingData({...bookingData, outletId: o._id});
                                            setShowOutletModal(false);
                                            setStep(2);
                                        }}
                                        className="bg-surface border border-border text-left hover:border-primary group transition-all relative overflow-hidden active:scale-95 shadow-sm hover:shadow-xl flex flex-col"
                                    >
                                        <div className="h-44 w-full bg-surface-alt relative overflow-hidden">
                                            {o.images?.[0] ? (
                                                <img src={o.images[0]} alt={o.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Store className="w-10 h-10" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Open Venue Profile</span>
                                            </div>
                                        </div>

                                        <div className="p-6 relative z-10 flex-1">
                                            <h3 className="text-xl font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors">{o.name}</h3>
                                            <div className="flex items-center gap-2 mt-2 text-text-muted">
                                                <MapPin className="w-3 h-3 text-primary" />
                                                <p className="text-[9px] font-bold uppercase tracking-widest">{o.address?.city} :: {o.phone}</p>
                                            </div>
                                            
                                            <div className="mt-6 flex items-center gap-2 text-[8px] font-black text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                                                SELECT THIS LOCATION <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
