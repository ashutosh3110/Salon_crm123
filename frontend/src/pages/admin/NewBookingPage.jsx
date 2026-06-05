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
    Smartphone,
    X,
    UserPlus
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
        
        if (path.includes('wapixo.com/uploads') && !path.includes('api.wapixo.com/uploads')) {
            path = path.replace('wapixo.com/uploads', 'api.wapixo.com/uploads');
        }
        
        if (path.startsWith('http')) return path;
        const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL.replace(/\/api\//, '/');
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
        staffId: [], // Array for multiple staff
        date: '',
        time: '',
        customerId: '',
    });

    const [activeMembership, setActiveMembership] = useState(null);
    const [fetchingMembership, setFetchingMembership] = useState(false);

    const { platformSettings, fetchPlatformSettings } = useBusiness();

    useEffect(() => {
        if (!platformSettings) fetchPlatformSettings?.();
    }, [platformSettings, fetchPlatformSettings]);

    const [availableSlots, setAvailableSlots] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    useEffect(() => {
        const fetchSlots = async () => {
            // For now, if multiple staff are selected, we fetch slots for the FIRST one
            // Ideally, the backend should handle multiple staff IDs and return common slots
            const primaryStaffId = Array.isArray(selection.staffId) ? selection.staffId[0] : selection.staffId;

            if (!primaryStaffId || !selection.serviceId || !selection.date || primaryStaffId === 'any') {
                setAvailableSlots([]);
                return;
            }
            setFetchingSlots(true);
            try {
                const res = await api.get('/bookings/available-slots', {
                    params: {
                        staffId: primaryStaffId,
                        serviceId: selection.serviceId,
                        date: selection.date
                    }
                });
                setAvailableSlots(res.data?.data || []);
            } catch (err) {
                console.error('Failed to fetch slots', err);
            } finally {
                setFetchingSlots(false);
            }
        };
        fetchSlots();
    }, [selection.staffId, selection.serviceId, selection.date]);

    // Fetch Membership when customer changes
    useEffect(() => {
        const fetchMembership = async () => {
            if (!selection.customerId) {
                setActiveMembership(null);
                return;
            }
            setFetchingMembership(true);
            try {
                const res = await api.get('/loyalty/membership/active', {
                    params: { customerId: selection.customerId }
                });
                setActiveMembership(res.data?.data || null);
            } catch (err) {
                console.error('Failed to fetch membership', err);
                setActiveMembership(null);
            } finally {
                setFetchingMembership(false);
            }
        };
        fetchMembership();
    }, [selection.customerId]);

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
        email: '',
        dob: '',
        anniversary: '',
        appliedReferralCode: ''
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
    const selectedStaffList = useMemo(() => {
        const ids = Array.isArray(selection.staffId) ? selection.staffId : [selection.staffId];
        return staff.filter(s => ids.includes(s._id));
    }, [staff, selection.staffId]);
    const selectedCustomer = useMemo(() => customers.find(c => c._id === selection.customerId), [customers, selection.customerId]);

    const filteredServices = useMemo(() => {
        const term = searchTerms.service.trim().toLowerCase();
        return services.filter(s => {
            const matchesOutlet = !s.outletIds || s.outletIds.length === 0 || s.outletIds.includes(selection.outletId);
            const matchesSearch = s.name.toLowerCase().includes(term);
            return matchesOutlet && matchesSearch;
        });
    }, [services, selection.outletId, searchTerms.service]);

    const filteredStaff = useMemo(() => {
        const term = searchTerms.staff.trim().toLowerCase();
        return staff.filter(s => {
            const staffOutletId = s.outletId?._id || s.outletId;
            const matchesOutlet = !staffOutletId || staffOutletId === selection.outletId;
            const matchesSearch = s.name.toLowerCase().includes(term);
            const roleLower = (s.role || '').toLowerCase();
            const isExcludedRole = ['admin', 'accountant', 'receptionist'].includes(roleLower);
            return !isExcludedRole && matchesOutlet && matchesSearch && s.status !== 'inactive';
        });
    }, [staff, selection.outletId, searchTerms.staff]);

    const filteredCustomers = useMemo(() => {
        const term = searchTerms.customer.trim().toLowerCase();
        return customers.filter(c => 
            (c.name || '').toLowerCase().includes(term) || 
            (c.phone || '').includes(term)
        );
    }, [customers, searchTerms.customer]);

    // Price Calculations
    const priceCalculation = useMemo(() => {
        if (!selectedService) return { original: 0, discount: 0, subtotal: 0, tax: 0, total: 0 };
        
        const original = selectedService.price || 0;
        let discount = 0;

        if (activeMembership && activeMembership.planId) {
            const plan = activeMembership.planId;
            if (plan.serviceDiscountType === 'percentage') {
                discount = Math.round(original * (plan.serviceDiscountValue / 100));
            } else {
                discount = Math.min(original, plan.serviceDiscountValue);
            }
        }

        const subtotal = original - discount;
        const gstRate = platformSettings?.serviceGst || 18;
        const tax = Math.round(subtotal * (gstRate / 100));
        const total = subtotal + tax;

        return { original, discount, subtotal, tax, total, gstRate };
    }, [selectedService, activeMembership, platformSettings]);

    // Reset pagination on search
    useEffect(() => {
        setCustomerPage(1);
    }, [searchTerms.customer]);

    // Pagination Logic
    const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage);
    const paginatedCustomers = filteredCustomers.slice((customerPage - 1) * customersPerPage, customerPage * customersPerPage);

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (clientForm.phone.length !== 10) return toast.error('Phone number must be exactly 10 digits');
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
            setClientForm({ name: '', phone: '', email: '', dob: '', anniversary: '', appliedReferralCode: '' });
        } catch (err) {
            toast(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleFinalBooking = async () => {
        if (!selection.customerId) {
            toast('Please select a customer');
            return;
        }

        setLoading(true);
        try {
            const appointmentDate = new Date(`${selection.date}T${selection.time}`);
            
            await addBooking({
                outletId: selection.outletId,
                serviceId: selection.serviceId,
                clientId: selection.customerId,
                staffId: selection.staffId,
                appointmentDate,
                time: selection.time,
                duration: selectedService?.duration || 30,
                totalPrice: priceCalculation.total,
                taxAmount: priceCalculation.tax,
                discountAmount: priceCalculation.discount,
                source: 'admin'
            });

            toast.success('Booking created successfully');
            navigate('/admin/bookings');
        } catch (err) {
            toast(err.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const steps = [
        { id: 1, title: 'Select Outlet', icon: MapPin },
        { id: 2, title: 'Select Service', icon: Scissors },
        { id: 3, title: 'Select Staff', icon: User },
        { id: 4, title: 'Select Date & Time', icon: Clock },
        { id: 5, title: 'Confirm Details', icon: Users },
        { id: 6, title: 'Complete Booking', icon: CheckCircle2 },
    ];

    return (
        <div className="min-h-screen bg-background pb-20 font-black text-left">
            {/* Header and Stepper */}
            <div className="bg-white p-6 lg:px-10 lg:py-8 sticky top-0 z-[50] shadow-sm space-y-10">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                        New Booking
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Administrative Access</p>
                </div>

                <div className="flex items-start justify-center max-w-5xl mx-auto w-full">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex flex-col items-center relative flex-1">
                            <div className="flex items-center w-full">
                                {/* Left Line */}
                                <div className={`h-[2px] flex-1 ${i === 0 ? 'bg-transparent' : step >= s.id ? 'bg-[#D4A373]' : 'bg-slate-200'}`} />
                                
                                {/* Circle */}
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-[11px] font-bold transition-all z-10 shrink-0 ${step === s.id ? 'bg-[#D4A373] text-white shadow-md' : step > s.id ? 'bg-[#D4A373] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                                </div>
                                
                                {/* Right Line */}
                                <div className={`h-[2px] flex-1 ${i === steps.length - 1 ? 'bg-transparent' : step > s.id ? 'bg-[#D4A373]' : 'bg-slate-200'}`} />
                            </div>
                            
                            {/* Label */}
                            <span className={`text-[9px] font-bold uppercase mt-3 text-center max-w-[80px] leading-tight ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 lg:p-10 animate-reveal">
                
                {/* Step 1: Outlet Selection */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                                    <Store className="w-5 h-5 text-[#D4A373]" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Step 01: Select Outlet</h2>
                                    <p className="text-[11px] text-slate-500 italic mt-1">Choose the branch (outlet) where the booking will be created.</p>
                                </div>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    className="w-full bg-white border border-slate-200 p-3 pl-10 text-[11px] outline-none rounded-2xl shadow-sm focus:border-slate-300 transition-all placeholder:text-slate-400"
                                    placeholder="Search outlets..."
                                    value={searchTerms.outlet}
                                    onChange={(e) => setSearchTerms({...searchTerms, outlet: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {outlets.filter(o => o.name.toLowerCase().includes(searchTerms.outlet.trim().toLowerCase())).map(o => (
                                <div 
                                    key={o._id}
                                    onClick={() => {
                                        setSelection({...selection, outletId: o._id});
                                        nextStep();
                                    }}
                                    className={`group relative bg-white border transition-all cursor-pointer overflow-hidden rounded-2xl shadow-sm flex flex-col ${selection.outletId === o._id ? 'border-[#D4A373] shadow-md ring-1 ring-[#D4A373]' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                                >
                                    <div className="h-48 relative overflow-hidden bg-slate-900">
                                        <img src={getImageUrl(o.images?.[0]) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                                        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
                                            Active
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-[13px] font-bold text-slate-900 uppercase">{o.name}</h3>
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1">
                                                    {o.address?.city ? `${o.address.city} DIVISION, ` : ''}{o.address?.state || 'UTTAR PRADESH'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="h-[1px] w-full bg-slate-100 mb-4" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider">View Branch Details</span>
                                                <ArrowRight className="w-4 h-4 text-[#D4A373] group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Banner */}
                        <div className="mt-8 p-6 bg-amber-50/50 border border-amber-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-amber-100">
                                    <Store className="w-5 h-5 text-[#D4A373]" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-bold text-slate-900">Can't find the outlet?</h4>
                                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Make sure the outlet is active and available for bookings.</p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/admin/outlets')} className="px-6 py-2.5 bg-white border border-[#D4A373] text-[#D4A373] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#D4A373] hover:text-white transition-all flex items-center gap-2 shrink-0">
                                Manage Outlets <ArrowRight className="w-3.5 h-3.5" />
                            </button>
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
                                    className="w-full bg-surface-alt border border-border p-4 pl-12 text-[10px] font-black uppercase outline-none rounded-2xl shadow-sm focus:border-primary transition-all"
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
                                    className={`group relative bg-surface border transition-all cursor-pointer overflow-hidden flex flex-col rounded-2xl shadow-sm ${selection.serviceId === s._id ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border hover:border-text hover:shadow-md'}`}
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
                                        <div className="absolute top-4 left-4 bg-primary text-white p-1.5 rounded-xl shadow-sm">
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
                                    className="w-full bg-surface-alt border border-border p-4 pl-12 text-[10px] font-black uppercase outline-none rounded-2xl shadow-sm focus:border-primary transition-all"
                                    placeholder="Search Staff..."
                                    value={searchTerms.staff}
                                    onChange={(e) => setSearchTerms({...searchTerms, staff: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredStaff.length > 0 ? (
                                filteredStaff.map(s => {
                                    const isSelected = selection.staffId.includes(s._id);
                                    return (
                                        <div 
                                            key={s._id}
                                            onClick={() => {
                                                const newStaffIds = isSelected 
                                                    ? selection.staffId.filter(id => id !== s._id)
                                                    : [...selection.staffId, s._id];
                                                setSelection({...selection, staffId: newStaffIds});
                                            }}
                                            className={`group p-8 bg-surface border cursor-pointer transition-all text-center relative rounded-2xl shadow-sm ${isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-105 z-10' : 'border-border hover:border-text opacity-70 hover:opacity-100 hover:shadow-md'}`}
                                        >
                                            <div className="w-24 h-24 mx-auto bg-surface-alt border-4 border-surface shadow-sm mb-6 overflow-hidden rounded-xl flex items-center justify-center transition-all group-hover:border-primary">
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
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 bg-primary text-white p-1.5 rounded-xl shadow-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-16 bg-surface border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
                                    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Users className="w-8 h-8 text-primary opacity-40" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-text uppercase italic tracking-tighter">No staff available in this outlet</h3>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">You need to add staff to this outlet to take bookings</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selection.staffId.length > 0 && (
                            <div className="flex justify-end pt-10">
                                <button 
                                    onClick={nextStep}
                                    className="px-12 py-5 bg-text text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-[0_0_15px_rgba(var(--color-primary),0.3)] hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)] rounded-2xl flex items-center gap-4 group italic"
                                >
                                    Continue to Schedule <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        )}
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
                                <div className="grid grid-cols-7 gap-2 bg-surface p-6 border border-border rounded-2xl shadow-sm">
                                    {[...Array(14)].map((_, i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + i);
                                        const isSelected = selection.date === d.toISOString().split('T')[0];
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelection({...selection, date: d.toISOString().split('T')[0]})}
                                                className={`flex flex-col items-center justify-center p-3 border transition-all rounded-2xl ${isSelected ? 'bg-primary border-primary text-white scale-110 shadow-lg ring-2 ring-primary/20' : 'bg-surface border-border hover:border-text text-text hover:shadow-md'}`}
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
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-surface p-6 border border-border rounded-2xl shadow-sm overflow-y-auto max-h-[350px]">
                                    {(() => {
                                        if (!selection.date) return <p className="col-span-full text-[10px] text-text-muted uppercase text-center py-10 font-black italic">Select a date first</p>;
                                        
                                        if (fetchingSlots) return <p className="col-span-full text-[10px] text-primary uppercase text-center py-10 font-black italic animate-pulse">Calculating available slots...</p>;

                                        // If "Any Staff", show default slots (could be improved later to aggregate all staff)
                                        if (selection.staffId === 'any') {
                                            return ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'].map(t => (
                                                <button key={t} onClick={() => setSelection({...selection, time: t})} className={`p-4 text-xs font-black font-mono border transition-all rounded-xl ${selection.time === t ? 'bg-primary border-primary text-white shadow-md ring-2 ring-primary/20' : 'bg-surface-alt border-border hover:border-text text-text-muted hover:text-text hover:shadow-sm'}`}>{t}</button>
                                            ));
                                        }

                                        if (availableSlots.length === 0) return <p className="col-span-full text-[10px] text-rose-500 uppercase text-center py-10 font-black italic">No slots available for this selection</p>;

                                        return availableSlots.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setSelection({...selection, time: t})}
                                                className={`p-4 text-xs font-black font-mono border transition-all rounded-xl ${selection.time === t ? 'bg-primary border-primary text-white shadow-md ring-2 ring-primary/20' : 'bg-surface-alt border-border hover:border-text text-text-muted hover:text-text hover:shadow-sm'}`}
                                            >
                                                {t}
                                            </button>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-8">
                            <button 
                                onClick={nextStep}
                                disabled={!selection.date || !selection.time}
                                className="px-12 py-5 bg-text text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-[0_0_15px_rgba(var(--color-primary),0.3)] hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)] rounded-2xl disabled:grayscale disabled:opacity-30 flex items-center gap-4 group italic"
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
                                    className="w-full bg-surface-alt border border-border p-4 pl-12 text-[10px] font-black uppercase outline-none rounded-2xl shadow-sm focus:border-primary transition-all"
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
                                    className={`p-6 bg-surface border cursor-pointer transition-all flex items-center gap-4 group rounded-2xl shadow-sm ${selection.customerId === c._id ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20' : 'border-border hover:border-text hover:shadow-md'}`}
                                >
                                    <div className={`w-12 h-12 flex items-center justify-center text-xl font-black italic border transition-all shrink-0 rounded-2xl ${selection.customerId === c._id ? 'bg-primary text-white border-primary shadow-inner' : 'bg-surface-alt text-text-muted border-border'}`}>
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
                                    className="p-2 border border-border rounded-xl disabled:opacity-20 hover:border-primary hover:bg-surface-alt transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-[10px] font-black font-mono uppercase tracking-widest">
                                    Page {customerPage} of {totalCustomerPages}
                                </span>
                                <button 
                                    disabled={customerPage === totalCustomerPages}
                                    onClick={() => setCustomerPage(p => p + 1)}
                                    className="p-2 border border-border rounded-xl disabled:opacity-20 hover:border-primary hover:bg-surface-alt transition-all shadow-sm"
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
                                className="flex items-center gap-3 px-10 py-4 bg-surface text-primary border border-primary text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all shadow-md italic"
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
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                <Shield className="w-10 h-10" />
                            </div>
                            <h2 className="text-4xl font-black text-text uppercase italic tracking-tighter font-mono">Confirm Booking</h2>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] italic">Review your selection before finalizing</p>
                        </div>

                        <div className="bg-surface border border-border rounded-2xl shadow-sm p-10 grid grid-cols-1 md:grid-cols-2 gap-12 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45 border border-primary/10 rounded-2xl" />
                            
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
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStaffList.length > 0 ? selectedStaffList.map(s => (
                                            <h4 key={s._id} className="text-sm font-black text-text uppercase italic tracking-tight bg-surface-alt px-2 py-1 border border-border">{s.name}</h4>
                                        )) : <h4 className="text-xl font-black text-text uppercase italic tracking-tight">Any</h4>}
                                    </div>
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
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xl font-black text-text uppercase italic tracking-tight">{selectedCustomer?.name}</h4>
                                        {activeMembership && (
                                            <span className="text-[8px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-amber-200">
                                                {activeMembership.planId?.name} Member
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-text-muted font-mono tracking-tighter mt-1 opacity-60 italic">{maskPhone(selectedCustomer?.phone, user?.role)}</p>
                                </div>
                                <div className="pt-6 border-t border-border space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <span>Base Price</span>
                                        <span>₹{priceCalculation.original}</span>
                                    </div>
                                    {priceCalculation.discount > 0 && (
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                            <span>Member Discount</span>
                                            <span>- ₹{priceCalculation.discount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <span>GST ({priceCalculation.gstRate}%)</span>
                                        <span>+ ₹{priceCalculation.tax}</span>
                                    </div>
                                    <div className="pt-3 border-t border-border flex items-end justify-between">
                                        <div>
                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em] font-mono italic">Final Total</p>
                                            <p className="text-4xl font-black text-emerald-600 tracking-tighter font-mono italic">₹{priceCalculation.total}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <button 
                                onClick={prevStep}
                                className="flex-1 py-6 bg-surface border-2 border-border text-[11px] font-black text-text-muted uppercase tracking-[0.4em] hover:bg-surface-alt transition-all rounded-2xl italic"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleFinalBooking}
                                disabled={loading}
                                className="flex-[2] py-6 bg-text text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-primary transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group italic"
                            >
                                {loading ? 'Processing...' : 'Confirm Booking'} <Zap className="w-5 h-5 group-hover:scale-125 transition-all text-primary" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Customer Registration Modal */}
                {showCustomerModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowCustomerModal(false)}>
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-y-auto max-h-[90vh] hide-scrollbar animate-in slide-in-from-top-4 duration-300 border border-slate-200/50" onClick={(e) => e.stopPropagation()}>
                            <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase flex items-center gap-2 tracking-widest">
                                    <UserPlus className="w-4 h-4 text-slate-800" /> Add Customer
                                </h4>
                                <button type="button" onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleAddCustomer}>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Customer Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. John Doe"
                                            value={clientForm.name}
                                            onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-black text-slate-900 outline-none rounded-xl placeholder:text-slate-400 focus:border-slate-400 transition-colors uppercase"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="10-digit mobile"
                                            value={clientForm.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setClientForm({...clientForm, phone: val});
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-black text-slate-900 outline-none rounded-xl placeholder:text-slate-400 focus:border-slate-400 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email (Optional)</label>
                                        <input
                                            type="email"
                                            placeholder="e.g. email@example.com"
                                            value={clientForm.email}
                                            onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-black text-slate-900 outline-none rounded-xl placeholder:text-slate-400 focus:border-slate-400 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Referral Code (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. WAP-XXXXXX"
                                            value={clientForm.appliedReferralCode || ''}
                                            onChange={(e) => setClientForm({...clientForm, appliedReferralCode: e.target.value.toUpperCase().trim()})}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-black text-slate-900 outline-none rounded-xl placeholder:text-slate-400 focus:border-slate-400 transition-colors uppercase"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Birth Date</label>
                                            <input
                                                type="date"
                                                max={new Date().toISOString().split('T')[0]}
                                                value={clientForm.dob}
                                                onChange={(e) => setClientForm({...clientForm, dob: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-black text-slate-900 outline-none rounded-xl focus:border-slate-400 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Anniversary</label>
                                            <input
                                                type="date"
                                                max={new Date().toISOString().split('T')[0]}
                                                value={clientForm.anniversary}
                                                onChange={(e) => setClientForm({...clientForm, anniversary: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-black text-slate-900 outline-none rounded-xl focus:border-slate-400 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCustomerModal(false)} 
                                        className="flex-1 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 rounded-xl bg-white hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 py-3 text-[11px] font-black text-white uppercase tracking-widest bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-lg shadow-slate-800/10"
                                    >
                                        Save & Continue
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
