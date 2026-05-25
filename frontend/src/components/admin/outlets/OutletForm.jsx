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
    const { outlets, addOutlet, updateOutlet, platformSettings, fetchOutlets } = useBusiness();
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
            enableDelivery: false,
            deliveryCharge: 0
        }
    });

    const [imageFiles, setImageFiles] = useState([]); // Store actual File objects

    useEffect(() => {
        if (!outlets || outlets.length === 0) {
            fetchOutlets?.();
        }
    }, []);

    useEffect(() => {
        if (isEdit && outlets && outlets.length > 0) {
            const found = outlets.find(o => String(o._id) === String(id));
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

            const EXCLUDED_FIELDS = ['likes', 'likedBy', '_id', '__v', 'createdAt', 'updatedAt', 'salonId'];

            Object.keys(form).forEach(key => {
                if (EXCLUDED_FIELDS.includes(key)) return;

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
        <div className="max-w-5xl mx-auto space-y-8 animate-reveal pb-20 px-4 md:px-0 text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/outlets')}
                        className="group w-11 h-11 rounded-lg bg-white border border-border flex items-center justify-center text-text-muted hover:text-black hover:border-black transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                            <span className="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">Outlet Configuration</span>
                        </div>
                        <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none">
                            {isEdit ? 'Update' : 'Add New'} <span className="text-text-muted opacity-50">Outlet</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Form Grid */}
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Basic Info, Resources, Logic & Timing */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Salon Identity Card */}
                        <div className="relative overflow-hidden bg-white border border-border rounded-xl p-6 shadow-sm hover:border-black transition-all duration-300">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                        <Store className="w-5 h-5 text-text-muted" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-text uppercase tracking-tight">General Identity</h2>
                                        <p className="text-xs text-text-muted uppercase tracking-wider">Core brand information for this location</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Outlet Name <span className="text-rose-500">*</span></label>
                                        <input
                                            name="name"
                                            required
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Wapixo Salon - Mumbai Main"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-border text-sm font-bold text-text focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Contact Number <span className="text-rose-500">*</span></label>
                                        <input
                                            name="phone"
                                            required
                                            type="tel"
                                            maxLength={10}
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit number"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-border text-sm font-bold text-text focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Official Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="outlet@wapixo.com"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-border text-sm font-bold text-text focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resources Card (Stations) */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:border-black transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                        <Users className="w-5 h-5 text-text-muted" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-text uppercase tracking-tight">Resource Setup</h2>
                                        <p className="text-xs text-text-muted uppercase tracking-wider">Chairs and Beds configuration</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div role="button" onClick={handleAddChair} className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-all cursor-pointer">
                                        + Chair
                                    </div>
                                    <div role="button" onClick={handleAddBed} className="px-4 py-2 bg-neutral-100 text-black text-xs font-bold uppercase tracking-wider border border-border rounded-lg hover:bg-neutral-200 transition-all cursor-pointer">
                                        + Bed
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Chairs Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-text uppercase tracking-wider">Styling Chairs</span>
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs font-bold text-text-muted bg-slate-50 px-3 py-1 rounded-full border border-border">{form.chairs.length} Slots</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {form.chairs.map((chair) => (
                                            <div key={chair.id} className="relative p-4 bg-slate-50 rounded-lg border border-border flex items-center justify-between group hover:border-black hover:bg-white transition-all">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-xs font-bold text-text-muted">{chair.id}</div>
                                                    <input value={chair.name} onChange={(e) => handleChairNameChange(chair.id, e.target.value)} className="flex-1 bg-transparent border-none text-sm font-bold text-text outline-none uppercase" />
                                                </div>
                                                <div role="button" onClick={() => handleRemoveChair(chair.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"><X className="w-4 h-4" /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Beds Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-text uppercase tracking-wider">Service Beds</span>
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs font-bold text-text-muted bg-slate-50 px-3 py-1 rounded-full border border-border">{(form.beds || []).length} Slots</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(form.beds || []).map((bed) => (
                                            <div key={bed.id} className="relative p-4 bg-slate-50 rounded-lg border border-border flex items-center justify-between group hover:border-black hover:bg-white transition-all">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-xs font-bold text-text-muted">{bed.id}</div>
                                                    <input value={bed.name} onChange={(e) => handleBedNameChange(bed.id, e.target.value)} className="flex-1 bg-transparent border-none text-sm font-bold text-text outline-none uppercase" />
                                                </div>
                                                <div role="button" onClick={() => handleRemoveBed(bed.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"><X className="w-4 h-4" /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operational Logic Card */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:border-black transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-text-muted" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">Operational Logic</h2>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">Configure status and services</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Status</label>
                                    <div className="flex p-1 bg-slate-100 rounded-lg border border-border">
                                        <div
                                            role="button"
                                            onClick={() => setForm({ ...form, status: 'active' })}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${form.status === 'active' ? 'bg-black text-white shadow-sm' : 'text-text-muted hover:bg-slate-200'}`}
                                        >
                                            Live
                                        </div>
                                        <div
                                            role="button"
                                            onClick={() => setForm({ ...form, status: 'inactive' })}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${form.status === 'inactive' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:bg-slate-200'}`}
                                        >
                                            Offline
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-text-muted" />
                                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Home Delivery</span>
                                        </div>
                                        <div
                                            onClick={() => setForm({ ...form, config: { ...form.config, enableDelivery: !form.config?.enableDelivery } })}
                                            className={`w-12 h-6 rounded-full p-0.5 cursor-pointer transition-all duration-300 flex items-center justify-start ${form.config?.enableDelivery ? 'bg-black border border-black' : 'bg-slate-300 border border-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${form.config?.enableDelivery ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                    {form.config?.enableDelivery && (
                                        <input type="number" value={form.config?.deliveryCharge || 0} onChange={(e) => setForm({ ...form, config: { ...form.config, deliveryCharge: Number(e.target.value) } })} placeholder="Fee (₹)" className="w-full bg-slate-50 border border-border rounded-lg px-4 py-3 text-sm font-bold outline-none" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Shift Dynamics Card */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:border-black transition-all duration-300">
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-text-muted" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-text uppercase tracking-tight">Shift Dynamics</h2>
                                            <p className="text-xs text-text-muted uppercase tracking-wider">Global timing rules</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select name="openingTime" value={form.openingTime} onChange={handleChange} className="bg-white border border-border rounded-lg px-3 py-2 text-xs font-bold text-text outline-none focus:border-black">
                                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <span className="text-xs text-text-muted">to</span>
                                        <select name="closingTime" value={form.closingTime} onChange={handleChange} className="bg-white border border-border rounded-lg px-3 py-2 text-xs font-bold text-text outline-none focus:border-black">
                                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {DAYS.map(day => {
                                        const isActive = (form.workingDays || []).includes(day.full);
                                        return (
                                            <div
                                                key={day.full}
                                                role="button"
                                                onClick={() => handleDayToggle(day.full)}
                                                className={`py-3 rounded-lg flex flex-col items-center gap-1.5 transition-all cursor-pointer ${isActive ? 'bg-black text-white shadow-sm' : 'bg-slate-50 border border-border text-text-muted hover:bg-slate-200'}`}
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{day.label}</span>
                                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300'}`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals & Location */}
                    <div className="space-y-6">
                        {/* Visual Media Card */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:border-black transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-text-muted" />
                                </div>
                                <h2 className="text-lg font-black text-text uppercase tracking-tight">Visual Gallery</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {(form.images || []).map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border group shadow-sm">
                                        <img src={img.startsWith('data:') || img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`} alt={`Outlet ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                        <div role="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><X className="w-3.5 h-3.5" /></div>
                                    </div>
                                ))}
                                {(form.images?.length || 0) < 5 && (
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-border bg-slate-50 hover:bg-white cursor-pointer group relative overflow-hidden transition-colors">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-text-muted flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all"><Upload className="w-4 h-4" /></div>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-2">Add Media</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Geography & Map Card */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:border-black transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-text-muted" />
                                    </div>
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">Geotagging</h2>
                                </div>
                                <div role="button" onClick={useCurrentLocation} className="text-[10px] font-bold text-black uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border border-border hover:bg-black hover:text-white transition-all cursor-pointer">Auto Locate</div>
                            </div>
                            <div className="space-y-4">
                                <textarea name="address" required rows="2" value={form.address} onChange={handleChange} placeholder="Full Address" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-border text-sm font-bold text-text focus:bg-white outline-none transition-all resize-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input name="city" required value={form.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-border text-sm font-bold focus:bg-white outline-none" />
                                    <input name="pincode" required value={form.pincode} onChange={handleChange} placeholder="Pincode" maxLength="6" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-border text-sm font-bold focus:bg-white outline-none" />
                                </div>
                                <div className="relative rounded-lg overflow-hidden border border-border h-48 bg-slate-100">
                                    {isLoaded ? (
                                        <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={form.latitude ? { lat: form.latitude, lng: form.longitude } : center} zoom={15} onClick={onMapClick} options={{ disableDefaultUI: true, zoomControl: true }}>
                                            {(form.latitude && form.longitude) && <MarkerF position={{ lat: form.latitude, lng: form.longitude }} draggable={true} onDragEnd={onMapClick} />}
                                        </GoogleMap>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xs font-bold text-text-muted uppercase">Loading Map...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                    <div
                        role="button"
                        onClick={() => navigate('/admin/outlets')}
                        className="h-12 px-6 rounded-lg border border-slate-200 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-black hover:border-black flex items-center justify-center transition-all cursor-pointer bg-white"
                    >
                        Cancel
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-12 px-8 rounded-lg bg-black text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-neutral-800 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Save Changes' : 'Create Outlet'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0"><AlertCircle className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Configuration Error</p>
                        <p className="text-xs text-rose-500/80">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
