import { useState, useEffect, useRef } from 'react';
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
import CustomDropdown from '../../common/CustomDropdown';

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
    const displayHour = String(hour % 12 || 12).padStart(2, '0');
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
    const imageInputRef = useRef(null);

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
        <div className="max-w-5xl mx-auto space-y-3 animate-reveal pb-20 px-4 md:px-0 text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/outlets')}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-text hover:text-black transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#B4912B]" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Outlet Configuration</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                            {isEdit ? 'Update' : 'Add New'} <span className="text-[#B4912B]">Outlet</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Form Grid */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                    {/* Left Column: Basic Info, Resources, Logic & Timing */}
                    <div className="lg:col-span-2 space-y-3">

                        {/* Salon Identity Card */}
                        <div className="bg-surface border border-amber-200/60 dark:border-amber-500/10 rounded-2xl p-4 shadow-sm">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                                        <Store className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">General Identity</h2>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Core brand information for this location</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider">Outlet Name <span className="text-slate-800 dark:text-slate-400">*</span></label>
                                        <input
                                            name="name"
                                            required
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Wapixo Salon - Mumbai Main"
                                            className="w-full px-5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:border-amber-300 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider pl-2">Contact Number <span className="text-slate-800 dark:text-slate-400">*</span></label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input
                                                name="phone"
                                                required
                                                type="tel"
                                                maxLength={10}
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="10-digit number"
                                                className="w-full !pl-10 pr-5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:border-amber-300 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider pl-2">Official Email</label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input
                                                name="email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="outlet@wapixo.com"
                                                className="w-full !pl-10 pr-5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:border-amber-300 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resources Card (Stations) */}
                        <div className="bg-surface border border-blue-200/60 dark:border-blue-500/10 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Resource Setup</h2>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chairs and Beds configuration</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div role="button" onClick={handleAddChair} className="px-5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-all cursor-pointer shadow-sm">
                                        + Chair
                                    </div>
                                    <div role="button" onClick={handleAddBed} className="px-5 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-200 dark:border-blue-500/20 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm">
                                        + Bed
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Chairs Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Styling Chairs</span>
                                        <div className="h-px flex-1 bg-blue-100 dark:bg-blue-900/30" />
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-xl">{form.chairs.length} Slots</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {form.chairs.map((chair) => (
                                            <div key={chair.id} className="relative p-2 pl-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 shadow-sm">{chair.id}</div>
                                                    <input value={chair.name} onChange={(e) => handleChairNameChange(chair.id, e.target.value)} className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none focus:border-transparent !border-none !shadow-none text-[11px] text-slate-700 dark:text-slate-300 uppercase" />
                                                </div>
                                                <div role="button" onClick={() => handleRemoveChair(chair.id)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl cursor-pointer mr-1"><X className="w-4 h-4" /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Beds Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Service Beds</span>
                                        <div className="h-px flex-1 bg-blue-100 dark:bg-blue-900/30" />
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-xl">{(form.beds || []).length} Slots</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(form.beds || []).map((bed) => (
                                            <div key={bed.id} className="relative p-2 pl-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 shadow-sm">{bed.id}</div>
                                                    <input value={bed.name} onChange={(e) => handleBedNameChange(bed.id, e.target.value)} className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none focus:border-transparent !border-none !shadow-none text-[11px] text-slate-700 dark:text-slate-300 uppercase" />
                                                </div>
                                                <div role="button" onClick={() => handleRemoveBed(bed.id)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl cursor-pointer mr-1"><X className="w-4 h-4" /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operational Logic Card */}
                        <div className="bg-surface border border-orange-200/60 dark:border-orange-500/10 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-550 bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Operational Logic</h2>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Configure status and services</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider">Active Status</label>
                                    <div className="flex gap-2">
                                        <div
                                            role="button"
                                            onClick={() => setForm({ ...form, status: 'active' })}
                                            className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-all border ${form.status === 'active' ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/30 text-orange-600 dark:text-orange-400 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-750'}`}
                                        >
                                            Live
                                        </div>
                                        <div
                                            role="button"
                                            onClick={() => setForm({ ...form, status: 'inactive' })}
                                            className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-all border ${form.status === 'inactive' ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/30 text-orange-600 dark:text-orange-400 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-750'}`}
                                        >
                                            Offline
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4 md:mt-0">
                                    <label className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider">Home Delivery</label>
                                    <div className="flex items-center justify-between h-[38px] px-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-750 dark:text-slate-300 uppercase tracking-wider">Enable Delivery</span>
                                        </div>
                                        <div
                                            onClick={() => setForm({ ...form, config: { ...form.config, enableDelivery: !form.config?.enableDelivery } })}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${form.config?.enableDelivery ? 'bg-[#B4912B]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${form.config?.enableDelivery ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </div>
                                    </div>
                                    {form.config?.enableDelivery && (
                                        <input type="number" value={form.config?.deliveryCharge || 0} onChange={(e) => setForm({ ...form, config: { ...form.config, deliveryCharge: Number(e.target.value) } })} placeholder="Fee (₹)" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold outline-none mt-2" />
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Shift Dynamics */}
                        <div className="bg-surface rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

                            {/* Header */}
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#B8860B] flex items-center justify-center shadow-lg shadow-[#D4A373]/20">
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-black text-slate-900 dark:text-white">
                                                Shift Dynamics
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Configure working schedule & operational hours
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 flex items-center gap-2 border border-slate-200 dark:border-slate-700">

                                            <div className="w-[120px]">
                                                <CustomDropdown
                                                    value={form.openingTime}
                                                    onChange={(val) =>
                                                        setForm({ ...form, openingTime: val })
                                                    }
                                                    options={TIME_SLOTS.map(t => ({
                                                        label: t,
                                                        value: t
                                                    }))}
                                                />
                                            </div>

                                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-black border border-slate-200 dark:border-slate-700">
                                                →
                                            </div>

                                            <div className="w-[120px]">
                                                <CustomDropdown
                                                    value={form.closingTime}
                                                    onChange={(val) =>
                                                        setForm({ ...form, closingTime: val })
                                                    }
                                                    options={TIME_SLOTS.map(t => ({
                                                        label: t,
                                                        value: t
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shift Summary */}
                            <div className="px-5 py-4 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between flex-wrap gap-3">

                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                            Working Hours
                                        </p>

                                        <h3 className="font-black text-slate-900 dark:text-white">
                                            {form.openingTime} - {form.closingTime}
                                        </h3>
                                    </div>

                                    <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/30">
                                        <span className="text-xs font-bold text-[#B8860B] dark:text-[#D4A373]">
                                            {(form.workingDays || []).length} Active Days
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Working Days */}
                            <div className="p-5">

                                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
                                    Working Days
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">

                                    {DAYS.map(day => {
                                        const isActive =
                                            (form.workingDays || []).includes(day.full);

                                        return (
                                            <button
                                                key={day.full}
                                                type="button"
                                                onClick={() => handleDayToggle(day.full)}
                                                className={`
                            relative overflow-hidden
                            h-20 rounded-2xl border
                            transition-all duration-300
                            group
                            ${isActive
                                                        ? "bg-gradient-to-br from-[#D4A373] to-[#B8860B] border-transparent shadow-lg shadow-[#D4A373]/20 scale-[1.02]"
                                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-[#D4A373]"
                                                    }
                        `}
                                            >
                                                <div className="flex flex-col items-center justify-center h-full gap-2">

                                                    <span
                                                        className={`
                                    text-sm font-black uppercase
                                    ${isActive
                                                                ? "text-white"
                                                                : "text-slate-700 dark:text-slate-300"
                                                            }
                                `}
                                                    >
                                                        {day.label}
                                                    </span>

                                                    <div
                                                        className={`
                                    w-2 h-2 rounded-full
                                    ${isActive
                                                                ? "bg-white"
                                                                : "bg-slate-300"
                                                            }
                                `}
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals & Location */}
                    <div className="space-y-3">
                        {/* Visual Media Card */}
                        <div className="bg-surface border border-purple-200/60 dark:border-purple-500/10 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Visual Gallery</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {(form.images || []).map((img, idx) => (
                                    <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group shadow-sm">
                                        <img src={img.startsWith('data:') || img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`} alt={`Outlet ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-xl text-[9px] font-black text-slate-800 dark:text-white shadow-sm flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3 text-green-500" /> Outlet {idx}
                                        </div>
                                        <div role="button" onClick={() => removeImage(idx)} className="absolute top-3 right-3 p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><X className="w-3.5 h-3.5 text-rose-500" /></div>
                                    </div>
                                ))}
                                {(form.images?.length || 0) < 5 && (
                                    <div
                                        role="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center w-full h-full aspect-[4/3] rounded-2xl border border-dashed border-purple-300 dark:border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 cursor-pointer transition-colors shadow-sm"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
                                                <Upload className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <p className="text-[9px] font-black text-slate-800 dark:text-white uppercase tracking-wider mt-3">Add Media</p>
                                        </div>
                                        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Geography & Map Card */}
                        <div className="bg-surface border border-emerald-200/60 dark:border-emerald-500/10 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Geotagging</h2>
                                </div>
                                <div role="button" onClick={useCurrentLocation} className="shrink-0 whitespace-nowrap text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-all cursor-pointer">Auto Locate</div>
                            </div>
                            <div className="space-y-3">
                                <textarea name="address" required rows="2" value={form.address} onChange={handleChange} placeholder="Full Address" className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:border-emerald-300 outline-none transition-all resize-none shadow-sm" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input name="city" required value={form.city} onChange={handleChange} placeholder="City / Division" className="w-full px-5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:border-emerald-300 outline-none shadow-sm" />
                                    <input name="pincode" required value={form.pincode} onChange={handleChange} placeholder="Pincode" maxLength="6" className="w-full px-5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:border-emerald-300 outline-none shadow-sm" />
                                </div>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 bg-slate-100 dark:bg-slate-800 shadow-sm mt-2">
                                    {isLoaded ? (
                                        <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={form.latitude ? { lat: form.latitude, lng: form.longitude } : center} zoom={15} onClick={onMapClick} options={{ disableDefaultUI: true, zoomControl: true }}>
                                            {(form.latitude && form.longitude) && <MarkerF position={{ lat: form.latitude, lng: form.longitude }} draggable={true} onDragEnd={onMapClick} />}
                                        </GoogleMap>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xs font-bold text-slate-400 uppercase">Loading Map...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
                    <div
                        role="button"
                        onClick={() => navigate('/admin/outlets')}
                        className="h-10 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm bg-white dark:bg-slate-800"
                    >
                        Cancel
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-10 px-8 rounded-xl bg-[#B4912B] text-white text-[11px] font-black uppercase tracking-wider shadow-md hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 border border-[#9c7d24]"
                    >
                        {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5 text-white" />}
                        {isEdit ? 'Save Changes' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
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
