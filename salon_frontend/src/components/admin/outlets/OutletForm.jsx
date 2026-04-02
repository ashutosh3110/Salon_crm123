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
    X
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
    const { outlets, addOutlet, updateOutlet } = useBusiness();
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

    const reverseGeocode = async (lat, lng) => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBRHvhhxVDQyYkOryyo2IA19GuDFqsYD30";
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
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
            }
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
        }
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
        latitude: null,
        longitude: null
    });

    useEffect(() => {
        if (isEdit) {
            const found = outlets.find(o => o._id === id);
            if (found) {
                setForm({
                    ...form,
                    ...found,
                    images: found.images || (found.image ? [found.image] : []),
                    chairs: found.chairs || []
                });
            }
        }
    }, [id, isEdit, outlets]);

    const handleChange = (e) => {
        const { name, value } = e.target;
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
    
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Max 2MB allowed.`);
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setForm(prev => ({ 
                        ...prev, 
                        images: [...(prev.images || []), reader.result] 
                    }));
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const removeImage = (index) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Simulate network delay
        setTimeout(() => {
            if (isEdit) {
                updateOutlet(id, form);
            } else {
                addOutlet(form);
            }
            setSaving(false);
            navigate('/admin/outlets');
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/outlets')}
                        className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text-secondary transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-text uppercase">{isEdit ? 'Update Salon' : 'Add New Salon'}</h1>
                        <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest opacity-60">Add a new location to your business.</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image & Basic Information */}
                    <div className="bg-white p-7 rounded-[32px] border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <h2 className="text-xs font-bold text-text uppercase tracking-widest">Salon Identity</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Salon Photos (Max 5)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(form.images || []).map((img, idx) => (
                                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border group">
                                            <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-rose-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {(form.images?.length || 0) < 5 && (
                                        <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border bg-slate-50 hover:bg-white hover:border-primary/40 transition-all cursor-pointer group">
                                            <div className="p-2 rounded-full bg-primary/5 text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                                <Upload className="w-4 h-4" />
                                            </div>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1">Add Photo</p>
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Store className="w-4 h-4" />
                            </div>
                            <h2 className="text-xs font-bold text-text uppercase tracking-widest">Salon Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Salon Name <span className="text-rose-500">*</span></label>
                                <input
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Grace & Glamour - Mumbai"
                                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Phone Number <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            name="phone"
                                            required
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="outlet@salon.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>



                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Salon Status</label>
                                <div className="flex p-1 bg-slate-50 rounded-2xl border border-border w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, status: 'active' })}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${form.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-text-muted hover:text-text'}`}
                                    >
                                        Live
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, status: 'inactive' })}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${form.status === 'inactive' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-text-muted hover:text-text'}`}
                                    >
                                        Standby
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white p-7 rounded-[32px] border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                            <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <h2 className="text-xs font-bold text-text uppercase tracking-widest">Location Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Full Address <span className="text-rose-500">*</span></label>
                                <p className="text-[10px] text-text-muted">Used for nearby search — customers within 3 km will see this outlet</p>
                                <textarea
                                    name="address"
                                    required
                                    rows="1"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Shop No, Building, Area Details..."
                                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none min-h-[45px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">City</label>
                                    <input
                                        name="city"
                                        required
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Mumbai"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Pincode</label>
                                    <input
                                        name="pincode"
                                        required
                                        value={form.pincode}
                                        onChange={handleChange}
                                        placeholder="Pincode"
                                        maxLength="6"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Map Section */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Pin Location on Map</label>
                                    <button 
                                        type="button"
                                        onClick={useCurrentLocation}
                                        className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg hover:bg-primary/10 transition-all"
                                    >
                                        Use Current Location
                                    </button>
                                </div>
                                <div className="h-[200px] w-full rounded-2xl overflow-hidden border border-border bg-slate-50 relative group">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={form.latitude ? { lat: form.latitude, lng: form.longitude } : center}
                                            zoom={15}
                                            onClick={onMapClick}
                                            onLoad={onLoad}
                                            onUnmount={onUnmount}
                                            options={{
                                                disableDefaultUI: true,
                                                zoomControl: true,
                                            }}
                                        >
                                            {(form.latitude && form.longitude) && (
                                                <MarkerF 
                                                    position={{ lat: form.latitude, lng: form.longitude }}
                                                    draggable={true}
                                                    onDragEnd={onMapClick}
                                                />
                                            )}
                                        </GoogleMap>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-[10px] font-bold text-text-muted uppercase italic">
                                            Loading Map System...
                                        </div>
                                    )}
                                </div>
                                {form.latitude && (
                                    <div className="flex gap-4 px-1">
                                        <div className="flex-1">
                                            <p className="text-[8px] text-text-muted uppercase font-bold">Latitude</p>
                                            <p className="text-[10px] font-bold text-text">{form.latitude.toFixed(6)}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[8px] text-text-muted uppercase font-bold">Longitude</p>
                                            <p className="text-[10px] font-bold text-text">{form.longitude.toFixed(6)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <p className="text-[9px] text-blue-800 font-bold leading-relaxed">
                                    * Pinning on the map helps customers find you more easily in the "Nearby" search.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chair Management */}
                    <div className="bg-white p-7 rounded-[32px] border border-border shadow-sm space-y-6 md:col-span-2">
                        <div className="flex items-center justify-between pb-3 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-50 text-purple-500">
                                    <Users className="w-4 h-4" />
                                </div>
                                <h2 className="text-xs font-bold text-text uppercase tracking-widest">Chair / Station Management</h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddChair}
                                className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all"
                            >
                                + Add Station
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {form.chairs.map((chair) => (
                                <div key={chair.id} className="p-4 bg-slate-50 rounded-2xl border border-border flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-[10px] font-black text-text-muted">
                                        {chair.id}
                                    </div>
                                    <input
                                        value={chair.name}
                                        onChange={(e) => handleChairNameChange(chair.id, e.target.value)}
                                        placeholder="Station Name"
                                        className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 p-0 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveChair(chair.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {form.chairs.length === 0 && (
                                <div className="col-span-full py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-border">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">No stations configured for this outlet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operational Hours */}
                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl md:col-span-2 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                                        <Clock className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Working Hours</h3>
                                </div>
                                <h4 className="text-xl font-bold">Timing Rules</h4>
                                <p className="text-[10px] text-white/40 leading-relaxed font-bold tracking-tighter uppercase">Set opening and closing times for this salon.</p>

                                <div className="space-y-4 pt-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase">Opening Time</label>
                                        <select
                                            name="openingTime"
                                            value={form.openingTime}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none appearance-none"
                                        >
                                            {TIME_SLOTS.map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase">Closing Time</label>
                                        <select
                                            name="closingTime"
                                            value={form.closingTime}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none appearance-none"
                                        >
                                            {TIME_SLOTS.map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-2/3 space-y-4">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-4">Working Days</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                    {DAYS.map(day => (
                                        <button
                                            key={day.full}
                                            type="button"
                                            onClick={() => handleDayToggle(day.full)}
                                            className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${form.workingDays.includes(day.full)
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 border border-white/20'
                                                : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase">Hours Confirmed</p>
                                        <p className="text-[9px] text-white/40 font-bold">The booking system will follow these hours.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* decoration */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all pointer-events-none" />
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-[10px] font-bold uppercase tracking-widest">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 p-6 bg-slate-50 rounded-3xl border border-border">
                    <p className="text-[10px] text-text-muted font-bold uppercase hidden sm:block">
                        Please check all details before saving.
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/outlets')}
                            className="flex-1 sm:flex-none px-8 py-3 rounded-2xl text-xs font-bold text-text-secondary hover:bg-white transition-all border border-transparent hover:border-border"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 sm:flex-none flex items-center gap-2 px-10 py-3 rounded-2xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEdit ? 'Save Changes' : 'Create Salon'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
