import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Store,
    MapPin,
    Phone,
    Mail,
    Clock,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Users,
    Upload,
    Image as ImageIcon,
    X,
    Truck,
    Activity
} from 'lucide-react';
import { useBusiness } from '../../../contexts/BusinessContext';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';

const DAYS = [
    { label: 'Mon', full: 'Monday' },
    { label: 'Tue', full: 'Tuesday' },
    { label: 'Wed', full: 'Wednesday' },
    { label: 'Thu', full: 'Thursday' },
    { label: 'Fri', full: 'Friday' },
    { label: 'Sat', full: 'Saturday' },
    { label: 'Sun', full: 'Sunday' },
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute === 0 ? '00' : '30';
    return `${displayHour}:${displayMinute} ${ampm}`;
});

export default function OutletForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { outlets, addOutlet, updateOutlet, platformSettings } = useBusiness();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBRHvhhxVDQyYkOryyo2IA19GuDFqsYD30"
    });

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState({ lat: 19.0760, lng: 72.8777 }); // Default: Mumbai

    const reverseGeocode = (lat, lng) => {
        if (!window.google) return;
        
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
                const result = results[0];
                const addressComponents = result.address_components;

                let city = '';
                let pincode = '';
                let state = '';

                addressComponents.forEach(component => {
                    const types = component.types;
                    if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                        city = component.long_name;
                    }
                    if (types.includes('postal_code')) {
                        pincode = component.long_name;
                    }
                    if (types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    }
                });

                setForm(prev => ({
                    ...prev,
                    address: result.formatted_address,
                    city: city || prev.city,
                    pincode: pincode || prev.pincode,
                    state: state || prev.state,
                    latitude: lat,
                    longitude: lng
                }));
            } else {
                console.error("Geocoder failed due to: " + status);
            }
        });
    };

    const onMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        reverseGeocode(lat, lng);
    };

    const onLoad = (mapInstance) => {
        setMap(mapInstance);
    };

    const onUnmount = () => {
        setMap(null);
    };

    const useCurrentLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCenter({ lat: latitude, lng: longitude });
                    reverseGeocode(latitude, longitude);
                    setLoading(false);
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    setLoading(false);
                    alert("Could not get your location. Please ensure GPS is enabled.");
                },
                { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const [form, setForm] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        status: 'active',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        openingTime: '09:00 AM',
        closingTime: '09:00 PM',
        images: [],
        chairs: [],
        beds: [],
        config: {
            bookingSms: true,
            whatsappNotifications: true,
            enableDelivery: false,
            deliveryCharge: 0
        }
    });

    const [imageFiles, setImageFiles] = useState([]); // Store actual File objects

    useEffect(() => {
        if (isEdit) {
            const found = outlets.find(o => o._id === id);
            if (found) {
                setForm({
                    ...found,
                    address: found.address?.street || found.address || '',
                    city: found.address?.city || found.city || '',
                    state: found.address?.state || found.state || '',
                    pincode: found.address?.pincode || found.pincode || '',
                    latitude: found.location?.coordinates?.[1] || found.latitude || null,
                    longitude: found.location?.coordinates?.[0] || found.longitude || null,
                    images: found.images || (found.image ? [found.image] : []),
                    chairs: found.chairs || [],
                    beds: found.beds || [],
                    workingDays: found.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    config: found.config || {
                        bookingSms: true,
                        whatsappNotifications: true,
                        enableDelivery: false,
                        deliveryCharge: 0
                    }
                });
            }
        }
    }, [id, isEdit, outlets]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const digits = value.replace(/\D/g, '');
            if (digits.length <= 10) setForm(prev => ({ ...prev, phone: digits }));
            return;
        }
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDayToggle = (day) => {
        setForm(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    const handleAddChair = () => {
        const nextId = form.chairs.length > 0 ? Math.max(...form.chairs.map(c => c.id)) + 1 : 1;
        setForm(prev => ({
            ...prev,
            chairs: [...prev.chairs, { id: nextId, name: `Chair ${nextId}` }]
        }));
    };

    const handleRemoveChair = (chairId) => {
        setForm(prev => ({
            ...prev,
            chairs: prev.chairs.filter(c => c.id !== chairId)
        }));
    };

    const handleChairNameChange = (chairId, newName) => {
        setForm(prev => ({
            ...prev,
            chairs: prev.chairs.map(c => c.id === chairId ? { ...c, name: newName } : c)
        }));
    };

    const handleAddBed = () => {
        const nextId = form.beds?.length > 0 ? Math.max(...form.beds.map(b => b.id)) + 1 : 1;
        setForm(prev => ({
            ...prev,
            beds: [...(prev.beds || []), { id: nextId, name: `Bed ${nextId}` }]
        }));
    };

    const handleRemoveBed = (bedId) => {
        setForm(prev => ({
            ...prev,
            beds: prev.beds.filter(b => b.id !== bedId)
        }));
    };

    const handleBedNameChange = (bedId, newName) => {
        setForm(prev => ({
            ...prev,
            beds: prev.beds.map(b => b.id === bedId ? { ...b, name: newName } : b)
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        if (form.images.length + files.length > 5) {
            alert("Maximum 5 images allowed.");
            return;
        }

        files.forEach(file => {
            const maxSize = platformSettings?.maxImageSize || 5;
            const unit = platformSettings?.maxImageSizeUnit || 'MB';
            const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
            const threshold = maxSize * multiplier;

            if (file.size > threshold) {
                alert(`File ${file.name} is too large. Max ${maxSize}${unit} allowed.`);
                return;
            }

            setImageFiles(prev => [...prev, file]);

            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({
                    ...prev,
                    images: [...(prev.images || []), reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setForm(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);
            return { ...prev, images: newImages };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (form.phone && form.phone.length !== 10) {
            setError("Contact number must be exactly 10 digits.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const formData = new FormData();
            const existingImages = form.images.filter(img => !img.startsWith('data:'));

            Object.keys(form).forEach(key => {
                if (key === 'images') {
                    existingImages.forEach(img => formData.append('images', img));
                } else if (key === 'config') {
                    formData.append('config', JSON.stringify(form.config));
                } else if (key === 'chairs') {
                    formData.append('chairs', JSON.stringify(form.chairs));
                } else if (key === 'beds') {
                    formData.append('beds', JSON.stringify(form.beds));
                } else if (key === 'workingDays') {
                    form.workingDays.forEach(day => formData.append('workingDays[]', day));
                } else if (form[key] !== null && form[key] !== undefined) {
                    formData.append(key, form[key]);
                }
            });

            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            if (isEdit) {
                await updateOutlet(id, formData);
            } else {
                await addOutlet(formData);
            }
            navigate('/admin/outlets');
        } catch (err) {
            console.error("Outlet save failed:", err);
            setError(err.response?.data?.message || err.message || "Something went wrong while saving the outlet.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 px-4 md:px-0">
            {/* ─── Header Section ─────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/outlets')}
                        className="group w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Outlet Configuration</span>
                        </div>
                        <h1 className="text-4xl font-black text-text tracking-tighter uppercase italic leading-none">
                            {isEdit ? 'Update' : 'Add New'} <span className="text-text-muted opacity-50">Outlet.</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Process Status</p>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Ready to Save</p>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="h-14 px-8 rounded-2xl bg-text text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-text/10 hover:bg-primary hover:shadow-primary/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Save Changes' : 'Create Outlet'}
                    </button>
                </div>
            </div>

            {/* ─── Main Form Grid ────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Basic Info, Resources, Logic & Timing */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Salon Identity Card */}
                    <div className="relative group overflow-hidden bg-white border border-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-700">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Store className="w-6 h-6 text-primary" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-text tracking-tighter uppercase italic">General Identity</h2>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Core brand information for this location</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Outlet Name <span className="text-primary">*</span></label>
                                    <input
                                        name="name"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Wapixo Salon - Mumbai Main"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-border text-sm font-bold text-text focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Contact Number <span className="text-primary">*</span></label>
                                    <input
                                        name="phone"
                                        required
                                        type="tel"
                                        maxLength={10}
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit number"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Official Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="outlet@wapixo.com"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources Card (Stations) */}
                    <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-700">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <Users className="w-6 h-6 text-purple-500" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-text tracking-tighter uppercase italic">Resource Setup</h2>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Chairs and Beds configuration</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={handleAddChair} className="px-5 py-2.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-white transition-all">
                                    + Chair
                                </button>
                                <button type="button" onClick={handleAddBed} className="px-5 py-2.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                                    + Bed
                                </button>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Styling Chairs</span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                                    <span className="text-[10px] font-bold text-text-muted bg-slate-50 px-3 py-1 rounded-full border border-border">{form.chairs.length} Slots</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {form.chairs.map((chair) => (
                                        <div key={chair.id} className="relative p-5 bg-slate-50 rounded-2xl border border-border group hover:border-primary/50 hover:bg-white hover:shadow-xl transition-all duration-500">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-[10px] font-black text-primary">{chair.id}</div>
                                                <input value={chair.name} onChange={(e) => handleChairNameChange(chair.id, e.target.value)} className="flex-1 bg-transparent border-none text-sm font-black text-text outline-none uppercase italic" />
                                                <button type="button" onClick={() => handleRemoveChair(chair.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Service Beds</span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-emerald-600/20 to-transparent" />
                                    <span className="text-[10px] font-bold text-text-muted bg-slate-50 px-3 py-1 rounded-full border border-border">{(form.beds || []).length} Slots</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(form.beds || []).map((bed) => (
                                        <div key={bed.id} className="relative p-5 bg-slate-50 rounded-2xl border border-border group hover:border-emerald-500/50 hover:bg-white hover:shadow-xl transition-all duration-500">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-[10px] font-black text-emerald-600">{bed.id}</div>
                                                <input value={bed.name} onChange={(e) => handleBedNameChange(bed.id, e.target.value)} className="flex-1 bg-transparent border-none text-sm font-black text-text outline-none uppercase italic" />
                                                <button type="button" onClick={() => handleRemoveBed(bed.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Logic Card (Moved to Left) */}
                    <div className="bg-text text-white border border-text rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-xl bg-white/10 text-primary">
                                <Activity className="w-4 h-4" />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Logic</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Status</label>
                                <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
                                    <button type="button" onClick={() => setForm({ ...form, status: 'active' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${form.status === 'active' ? 'bg-primary text-white shadow-lg' : 'text-white/40'}`}>Live</button>
                                    <button type="button" onClick={() => setForm({ ...form, status: 'inactive' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${form.status === 'inactive' ? 'bg-rose-500 text-white shadow-lg' : 'text-white/40'}`}>Offline</button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-blue-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Home Delivery</span>
                                    </div>
                                    <button type="button" onClick={() => setForm({ ...form, config: { ...form.config, enableDelivery: !form.config?.enableDelivery } })} className={`w-10 h-5 rounded-full relative transition-all ${form.config?.enableDelivery ? 'bg-blue-500' : 'bg-white/20'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${form.config?.enableDelivery ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                                {form.config?.enableDelivery && (
                                    <input type="number" value={form.config?.deliveryCharge || 0} onChange={(e) => setForm({ ...form, config: { ...form.config, deliveryCharge: Number(e.target.value) } })} placeholder="Fee (₹)" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shift Dynamics Card (Moved to Left) */}
                    <div className="bg-slate-50 border border-border rounded-[2.5rem] p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
                        <div className="relative z-10 space-y-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><Clock className="w-6 h-6" /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-text tracking-tighter uppercase italic">Shift Dynamics</h2>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Global timing rules</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select name="openingTime" value={form.openingTime} onChange={handleChange} className="bg-white border border-border rounded-xl px-4 py-2 text-xs font-black text-text outline-none">
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <select name="closingTime" value={form.closingTime} onChange={handleChange} className="bg-white border border-border rounded-xl px-4 py-2 text-xs font-black text-text outline-none">
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                {DAYS.map(day => {
                                    const isActive = (form.workingDays || []).includes(day.full);
                                    return (
                                        <button key={day.full} type="button" onClick={() => handleDayToggle(day.full)} className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${isActive ? 'bg-text text-white shadow-xl scale-105' : 'bg-white border border-border text-text-muted'}`}>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : ''}`}>{day.label}</span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-slate-200'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visuals & Location */}
                <div className="space-y-8">
                    {/* Visual Media Card */}
                    <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary"><ImageIcon className="w-4 h-4" /></div>
                            <h2 className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Visual Gallery</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {(form.images || []).map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-sm">
                                    <img src={img.startsWith('data:') || img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`} alt={`Outlet ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-3 h-3" /></button>
                                </div>
                            ))}
                            {(form.images?.length || 0) < 5 && (
                                <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-border/60 bg-slate-50 hover:bg-white cursor-pointer group relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform"><Upload className="w-5 h-5" /></div>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mt-3">Add Media</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Geography & Map Card */}
                    <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600"><MapPin className="w-4 h-4" /></div>
                                <h2 className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Geotagging</h2>
                            </div>
                            <button type="button" onClick={useCurrentLocation} className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm">Auto Fix</button>
                        </div>
                        <div className="space-y-6">
                            <textarea name="address" required rows="2" value={form.address} onChange={handleChange} placeholder="Address" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-border text-sm font-bold text-text focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none" />
                            <div className="grid grid-cols-2 gap-3">
                                <input name="city" required value={form.city} onChange={handleChange} placeholder="City" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-border text-sm font-bold focus:bg-white outline-none" />
                                <input name="pincode" required value={form.pincode} onChange={handleChange} placeholder="Pincode" maxLength="6" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-border text-sm font-bold focus:bg-white outline-none" />
                            </div>
                            <div className="relative rounded-[1.5rem] overflow-hidden border border-border h-48 bg-slate-100">
                                {isLoaded ? (
                                    <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={form.latitude ? { lat: form.latitude, lng: form.longitude } : center} zoom={15} onClick={onMapClick} options={{ disableDefaultUI: true, zoomControl: true }}>
                                        {(form.latitude && form.longitude) && <MarkerF position={{ lat: form.latitude, lng: form.longitude }} draggable={true} onDragEnd={onMapClick} />}
                                    </GoogleMap>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[10px] font-black text-text-muted uppercase">Loading Map...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {error && (
                <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-center gap-4 animate-in shake duration-500">
                    <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20"><AlertCircle className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-black text-rose-500 uppercase tracking-widest">Configuration Error</p>
                        <p className="text-[11px] font-bold text-rose-500/70">{error}</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-center pt-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="px-10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
        </div>
    );
}
