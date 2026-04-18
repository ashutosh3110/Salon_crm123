import React, { useState, useMemo, useEffect } from 'react';
import { 
    Store, 
    Scissors, 
    User, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    ChevronRight, 
    ChevronLeft,
    Search, 
    Plus,
    XCircle,
    ArrowRight,
    MapPin,
    Zap,
    Shield,
    Users,
    Phone,
    Mail,
    Smartphone
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, default as api } from '../../services/api';

export default function NewBookingPage() {
    const navigate = useNavigate();
    const { 
        outlets, 
        services, 
        staff, 
        customers, 
        fetchCustomers, 
        addBooking,
        fetchServices,
        fetchStaff,
        fetchOutlets
    } = useBusiness();
    
    const { user } = useAuth();
    
    // Image URL Resolver
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = API_BASE_URL.replace('/api', '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };
    
    // Workflow State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    
    // Selection State
    const [selection, setSelection] = useState({
        outletId: '',
        serviceId: '',
        staffId: '',
        date: '',
        time: '',
        customerId: '',
    });

    // Search/Filter States
    const [searchTerms, setSearchTerms] = useState({
        outlet: '',
        service: '',
        staff: '',
        customer: ''
    });

    // Pagination State
    const [customerPage, setCustomerPage] = useState(1);
    const customersPerPage = 6;

    // New Customer Form State
    const [clientForm, setClientForm] = useState({
        name: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([
                fetchOutlets?.(),
                fetchCustomers?.(1, 1000),
                fetchServices?.(),
                fetchStaff?.()
            ]);
            setLoading(false);
        };
        init();
    }, []);

    // Derived Data
    const selectedOutlet = useMemo(() => outlets.find(o => o._id === selection.outletId), [outlets, selection.outletId]);
    const selectedService = useMemo(() => services.find(s => s._id === selection.serviceId), [services, selection.serviceId]);
    const selectedStaff = useMemo(() => staff.find(s => s._id === selection.staffId), [staff, selection.staffId]);
    const selectedCustomer = useMemo(() => customers.find(c => c._id === selection.customerId), [customers, selection.customerId]);

    const filteredServices = useMemo(() => {
        if (!selection.outletId) return [];
        return services.filter(s => {
            const matchesOutlet = !s.outletIds || s.outletIds.length === 0 || s.outletIds.includes(selection.outletId);
            const matchesSearch = s.name.toLowerCase().includes(searchTerms.service.toLowerCase());
            return matchesOutlet && matchesSearch;
        });
    }, [services, selection.outletId, searchTerms.service]);

    const filteredStaff = useMemo(() => {
        if (!selection.outletId) return [];
        return staff.filter(s => {
            const isStylist = (s.role || '').toLowerCase().includes('styl');
            const matchesOutlet = !s.outletId || s.outletId === selection.outletId;
            const matchesSearch = s.name.toLowerCase().includes(searchTerms.staff.toLowerCase());
            return isStylist && matchesOutlet && matchesSearch;
        });
    }, [staff, selection.outletId, searchTerms.staff]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => 
            (c.name || '').toLowerCase().includes(searchTerms.customer.toLowerCase()) || 
            (c.phone || '').includes(searchTerms.customer)
        );
    }, [customers, searchTerms.customer]);

    // Reset pagination on search
    useEffect(() => {
        setCustomerPage(1);
    }, [searchTerms.customer]);

    // Pagination Logic
    const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage);
    const paginatedCustomers = filteredCustomers.slice((customerPage - 1) * customersPerPage, customerPage * customersPerPage);

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/clients', {
                ...clientForm,
                salonId: user?.salonId || selectedOutlet?.salonId
            });
            
            toast.success('Customer added');
            await fetchCustomers?.(1, 1000);
            setSelection({...selection, customerId: response.data?.data?._id || response.data?._id});
            setShowCustomerModal(false);
            setStep(6);
        } catch (err) {
            toast(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleFinalBooking = async () => {
        if (!selection.customerId) {
            toast('Please select a customer');
            return;
        }

        try {
            const appointmentDate = new Date(`${selection.date}T${selection.time}`);
            
            await addBooking({
                outletId: selection.outletId,
                serviceId: selection.serviceId,
                clientId: selection.customerId,
                staffId: selection.staffId,
                appointmentDate,
                price: selectedService?.price,
                source: 'admin'
            });

            toast.success('Booking created successfully');
            navigate('/admin/bookings');
        } catch (err) {
            toast(err.message || 'Booking failed');
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const steps = [
        { id: 1, title: 'Outlet', icon: MapPin },
        { id: 2, title: 'Service', icon: Scissors },
        { id: 3, title: 'Staff', icon: User },
        { id: 4, title: 'Schedule', icon: Clock },
        { id: 5, title: 'Customer', icon: Users },
        { id: 6, title: 'Confirm', icon: CheckCircle2 },
    ];

    return (
        <div className="min-h-screen bg-background pb-20 font-black text-left">
            {/* Top Bar */}
            <div className="bg-surface border-b border-border p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sticky top-0 z-[50] shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase italic tracking-tighter leading-none font-mono">
                        New Booking
                    </h1>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mt-2 italic">Administrative Access</p>
                </div>

                <div className="flex items-center gap-2">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`w-8 h-8 flex items-center justify-center text-[10px] border-2 transition-all ${step === s.id ? 'bg-primary border-primary text-white shadow-lg' : step > s.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-surface border-border text-text-muted opacity-40'}`}>
                                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-4 h-[2px] ${step > s.id ? 'bg-emerald-500' : 'bg-border'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 lg:p-10 animate-reveal">
                
                {/* Step 1: Outlet Selection */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
                            <div className="text-left">
                                <h2 className="text-3xl font-black text-text uppercase italic tracking-tight font-mono">Step 01 : Select Outlet</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Choose the branch for booking</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    className="w-full bg-surface-alt border border-border p-4 pl-12 text-[10px] font-black uppercase outline-none focus:border-primary transition-all"
                                    placeholder="Search Outlets..."
                                    value={searchTerms.outlet}
                                    onChange={(e) => setSearchTerms({...searchTerms, outlet: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {outlets.filter(o => o.name.toLowerCase().includes(searchTerms.outlet.toLowerCase())).map(o => (
                                <div 
                                    key={o._id}
                                    onClick={() => {
                                        setSelection({...selection, outletId: o._id});
                                        nextStep();
                                    }}
                                    className={`group relative bg-surface border-2 transition-all cursor-pointer overflow-hidden ${selection.outletId === o._id ? 'border-primary shadow-2xl' : 'border-border hover:border-text'}`}
                                >
                                    <div className="h-48 bg-surface-alt relative overflow-hidden">
                                        <img src={getImageUrl(o.images?.[0]) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                                            <h3 className="text-xl font-black text-white uppercase italic truncate">{o.name}</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-black text-text-muted uppercase leading-relaxed font-mono">
                                                {o.address?.city || 'Location'}, {o.address?.state || ''}
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-border flex items-center justify-between">
                                            <span className="text-[10px] font-black text-text uppercase tracking-widest opacity-60 italic">Branch Details</span>
                                            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                    {selection.outletId === o._id && (
                                        <div className="absolute top-4 right-4 bg-primary text-white p-1">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Service Selection */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
                            <div className="text-left">
                                <button onClick={prevStep} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-4 hover:underline italic">
                                    <ChevronLeft className="w-3 h-3" /> Back to Outlet
                                </button>
                                <h2 className="text-3xl font-black text-text uppercase italic tracking-tight font-mono">Step 02 : Select Service</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Available services at {selectedOutlet?.name}</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    className="w-full bg-surface-alt border border-border p-4 pl-12 text-[10px] font-black uppercase outline-none focus:border-primary transition-all"
                                    placeholder="Search Services..."
                                    value={searchTerms.service}
                                    onChange={(e) => setSearchTerms({...searchTerms, service: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredServices.map(s => (
                                <div 
                                    key={s._id}
                                    onClick={() => {
                                        setSelection({...selection, serviceId: s._id});
                                        nextStep();
                                    }}
                                    className={`group relative bg-surface border-2 transition-all cursor-pointer overflow-hidden flex flex-col ${selection.serviceId === s._id ? 'border-primary shadow-2xl' : 'border-border hover:border-text'}`}
                                >
                                    <div className="h-40 bg-surface-alt relative overflow-hidden border-b border-border">
                                        {s.image ? (
                                            <img src={getImageUrl(s.image)} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <Zap className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1 italic">{s.category || 'General'}</p>
                                            <h3 className="text-sm font-black text-text uppercase italic tracking-tight">{s.name}</h3>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-text-muted">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-black font-mono">{s.duration || 30} MIN</span>
                                                </div>
                                                <p className="text-xl font-black text-primary font-mono italic">₹{s.price}</p>
                                            </div>
                                            <ArrowRight className={`w-5 h-5 transition-all ${selection.serviceId === s._id ? 'text-primary' : 'text-text-muted group-hover:translate-x-2'}`} />
                                        </div>
                                    </div>
                                    {selection.serviceId === s._id && (
                                        <div className="absolute top-4 left-4 bg-primary text-white p-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Staff Selection */}
                {step === 3 && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
                            <div className="text-left">
                                <button onClick={prevStep} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-4 hover:underline italic">
                                    <ChevronLeft className="w-3 h-3" /> Back to Service
                                </button>
                                <h2 className="text-3xl font-black text-text uppercase italic tracking-tight font-mono">Step 03 : Select Staff</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Specialists for {selectedService?.name}</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    className="w-full bg-surface-alt border border-border p-4 pl-12 text-[10px] font-black uppercase outline-none focus:border-primary transition-all"
                                    placeholder="Search Staff..."
                                    value={searchTerms.staff}
                                    onChange={(e) => setSearchTerms({...searchTerms, staff: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredStaff.map(s => (
                                <div 
                                    key={s._id}
                                    onClick={() => {
                                        setSelection({...selection, staffId: s._id});
                                        nextStep();
                                    }}
                                    className={`group p-8 bg-surface border-2 cursor-pointer transition-all text-center relative ${selection.staffId === s._id ? 'border-primary shadow-2xl scale-105 z-10' : 'border-border hover:border-text opacity-70 hover:opacity-100'}`}
                                >
                                    <div className="w-24 h-24 mx-auto bg-surface-alt border-4 border-border mb-6 overflow-hidden flex items-center justify-center transition-all group-hover:border-primary">
                                        {s.avatar ? (
                                            <img src={getImageUrl(s.avatar)} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-text-muted" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-black text-text uppercase italic tracking-tight leading-none mb-2">{s.name}</h3>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">{s.specialization || 'Specialist'}</p>
                                    
                                    <div className="mt-8 pt-4 border-t border-border flex items-center justify-center gap-4 text-text-muted opacity-60">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <p className="text-[9px] font-black uppercase">Available</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div 
                                onClick={() => {
                                    setSelection({...selection, staffId: 'any'});
                                    nextStep();
                                }}
                                className={`group p-8 bg-surface-alt border-2 border-dashed border-border cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-surface ${selection.staffId === 'any' ? 'border-primary bg-primary/5' : ''}`}
                            >
                                <Users className="w-10 h-10 text-text-muted opacity-40" />
                                <div>
                                    <h3 className="text-sm font-black text-text uppercase italic">Any Staff</h3>
                                    <p className="text-[8px] font-black text-text-muted uppercase mt-1">Auto-Assign</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Schedule Selection */}
                {step === 4 && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
                            <div className="text-left">
                                <button onClick={prevStep} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-4 hover:underline italic">
                                    <ChevronLeft className="w-3 h-3" /> Back to Staff
                                </button>
                                <h2 className="text-3xl font-black text-text uppercase italic tracking-tight font-mono">Step 04 : Select Schedule</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Pick date and time</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-2 italic">
                                    <Calendar className="w-4 h-4 text-primary" /> Select Date
                                </label>
                                <div className="grid grid-cols-7 gap-2 bg-surface p-6 border-2 border-border">
                                    {[...Array(14)].map((_, i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + i);
                                        const isSelected = selection.date === d.toISOString().split('T')[0];
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelection({...selection, date: d.toISOString().split('T')[0]})}
                                                className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${isSelected ? 'bg-primary border-primary text-white scale-110 shadow-lg' : 'bg-surface border-border hover:border-text text-text'}`}
                                            >
                                                <span className="text-[8px] font-black opacity-60 uppercase">{d.toLocaleDateString([], { weekday: 'short' })}</span>
                                                <span className="text-lg font-black font-mono">{d.getDate()}</span>
                                                <span className="text-[8px] font-black uppercase opacity-60">{d.toLocaleDateString([], { month: 'short' })}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-2 italic">
                                    <Clock className="w-4 h-4 text-primary" /> Select Time
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-surface p-6 border-2 border-border overflow-y-auto max-h-[350px]">
                                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'].map(t => (
                                        <button
                                            key={t}
                                            disabled={!selection.date}
                                            onClick={() => setSelection({...selection, time: t})}
                                            className={`p-4 text-xs font-black font-mono border-2 transition-all ${selection.time === t ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface-alt border-border hover:border-text text-text-muted hover:text-text disabled:opacity-20'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-8">
                            <button 
                                onClick={nextStep}
                                disabled={!selection.date || !selection.time}
                                className="px-12 py-5 bg-text text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-2xl shadow-primary/20 disabled:grayscale disabled:opacity-30 flex items-center gap-4 group italic"
                            >
                                Next : Select Customer <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Customer Identification */}
                {step === 5 && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
                            <div className="text-left">
                                <button onClick={prevStep} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-4 hover:underline italic">
                                    <ChevronLeft className="w-3 h-3" /> Back to Schedule
                                </button>
                                <h2 className="text-3xl font-black text-text uppercase italic tracking-tight font-mono">Step 05 : Select Customer</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Choose buyer for this appointment</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    className="w-full bg-surface-alt border border-border p-4 pl-12 text-[10px] font-black uppercase outline-none focus:border-primary transition-all"
                                    placeholder="Search Phone or Name..."
                                    value={searchTerms.customer}
                                    onChange={(e) => setSearchTerms({...searchTerms, customer: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                            {paginatedCustomers.map(c => (
                                <div 
                                    key={c._id}
                                    onClick={() => {
                                        setSelection({...selection, customerId: c._id});
                                        nextStep();
                                    }}
                                    className={`p-6 bg-surface border-2 cursor-pointer transition-all flex items-center gap-4 group ${selection.customerId === c._id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-text'}`}
                                >
                                    <div className={`w-12 h-12 flex items-center justify-center text-xl font-black italic border-2 transition-all shrink-0 ${selection.customerId === c._id ? 'bg-primary text-white border-primary' : 'bg-surface-alt text-text-muted border-border'}`}>
                                        {c.name?.[0] || '?'}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <h3 className="text-[11px] font-black uppercase italic truncate">{c.name || 'New Customer'}</h3>
                                        <div className="flex items-center gap-2 mt-1 opacity-60">
                                            <Smartphone className="w-3 h-3 text-primary" />
                                            <p className="text-[9px] font-black font-mono tracking-tighter">{maskPhone(c.phone, user?.role)}</p>
                                        </div>
                                    </div>
                                    {selection.customerId === c._id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                </div>
                            ))}
                        </div>

                        {totalCustomerPages > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
                                <button 
                                    disabled={customerPage === 1}
                                    onClick={() => setCustomerPage(p => p - 1)}
                                    className="p-2 border-2 border-border disabled:opacity-20 hover:border-primary transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-[10px] font-black font-mono uppercase tracking-widest">
                                    Page {customerPage} of {totalCustomerPages}
                                </span>
                                <button 
                                    disabled={customerPage === totalCustomerPages}
                                    onClick={() => setCustomerPage(p => p + 1)}
                                    className="p-2 border-2 border-border disabled:opacity-20 hover:border-primary transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="pt-8 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4 w-full">
                                <div className="h-[1px] bg-border flex-1" />
                                <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.5em]">External Entry</span>
                                <div className="h-[1px] bg-border flex-1" />
                            </div>
                            <button 
                                onClick={() => setShowCustomerModal(true)}
                                className="flex items-center gap-3 px-10 py-4 bg-surface text-primary border-2 border-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/10 italic"
                            >
                                <Plus className="w-4 h-4" /> Add New Customer
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 6: Confirmation Protocol */}
                {step === 6 && (
                    <div className="max-w-4xl mx-auto space-y-10 animate-reveal">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
                                <Shield className="w-10 h-10" />
                            </div>
                            <h2 className="text-4xl font-black text-text uppercase italic tracking-tighter font-mono">Confirm Booking</h2>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] italic">Review your selection before finalizing</p>
                        </div>

                        <div className="bg-surface border-4 border-double border-border p-10 grid grid-cols-1 md:grid-cols-2 gap-12 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45 border border-primary/10" />
                            
                            <div className="space-y-8 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] font-mono">Outlet</p>
                                    <h4 className="text-xl font-black text-text uppercase italic tracking-tight">{selectedOutlet?.name}</h4>
                                    <p className="text-[9px] font-black text-text-muted uppercase opacity-60 italic">{selectedOutlet?.address?.city || 'Location'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] font-mono">Service</p>
                                    <h4 className="text-xl font-black text-text uppercase italic tracking-tight">{selectedService?.name}</h4>
                                    <p className="text-[9px] font-black text-text-muted uppercase opacity-60 italic">{selectedService?.duration} Min</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] font-mono">Staff</p>
                                    <h4 className="text-xl font-black text-text uppercase italic tracking-tight">{selectedStaff?.name || 'Any'}</h4>
                                </div>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] font-mono">Date & Time</p>
                                    <h4 className="text-xl font-black text-text uppercase italic tracking-tight">{selection.date}</h4>
                                    <h4 className="text-3xl font-black text-primary tracking-tighter font-mono leading-none mt-2">{selection.time}</h4>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] font-mono">Customer</p>
                                    <h4 className="text-xl font-black text-text uppercase italic tracking-tight">{selectedCustomer?.name}</h4>
                                    <p className="text-[10px] font-black text-text-muted font-mono tracking-tighter mt-1 opacity-60 italic">{maskPhone(selectedCustomer?.phone, user?.role)}</p>
                                </div>
                                <div className="pt-6 border-t border-border flex items-end justify-between">
                                    <div>
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em] font-mono italic">Total Price</p>
                                        <p className="text-4xl font-black text-emerald-600 tracking-tighter font-mono italic">₹{selectedService?.price}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <button 
                                onClick={prevStep}
                                className="flex-1 py-6 bg-surface border-2 border-border text-[11px] font-black text-text-muted uppercase tracking-[0.4em] hover:bg-surface-alt transition-all italic"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleFinalBooking}
                                className="flex-[2] py-6 bg-text text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group italic"
                            >
                                Create Booking <Zap className="w-5 h-5 group-hover:scale-125 transition-all text-primary" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Customer Registration Modal */}
                {showCustomerModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                        <div className="bg-surface w-full max-w-lg border-2 border-text shadow-2xl animate-reveal">
                            <div className="p-8 border-b border-border flex justify-between items-center bg-surface-alt">
                                <div>
                                    <h3 className="text-xl font-black text-text uppercase italic tracking-tighter font-mono">Add Customer</h3>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">New client details</p>
                                </div>
                                <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-surface transition-all">
                                    <XCircle className="w-6 h-6 text-text-muted" />
                                </button>
                            </div>
                            <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text uppercase tracking-widest">Name</label>
                                    <input 
                                        required
                                        className="w-full bg-surface-alt border border-border p-4 text-[11px] font-black uppercase tracking-tight outline-none focus:border-primary transition-all"
                                        placeholder="Enter customer name..."
                                        value={clientForm.name}
                                        onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text uppercase tracking-widest">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input 
                                            required
                                            className="w-full bg-surface-alt border border-border p-4 pl-12 text-[11px] font-black uppercase tracking-tight outline-none focus:border-primary transition-all"
                                            placeholder="Enter phone..."
                                            value={clientForm.phone}
                                            onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text uppercase tracking-widest">Email (Optional)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input 
                                            type="email"
                                            className="w-full bg-surface-alt border border-border p-4 pl-12 text-[11px] font-black uppercase tracking-tight outline-none focus:border-primary transition-all"
                                            placeholder="Enter email..."
                                            value={clientForm.email}
                                            onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-5 bg-text text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-4 italic"
                                >
                                    Save & Continue <Zap className="w-4 h-4 text-primary" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
