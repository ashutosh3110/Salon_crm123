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
    CheckCircle2
} from 'lucide-react';
import api from '../../../services/api';

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
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [subscriptionError, setSubscriptionError] = useState(false);

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
    });

    useEffect(() => {
        if (isEdit) {
            const fetchOutlet = async () => {
                try {
                    const { data } = await api.get(`/outlets/${id}`);
                    const outlet = data.data || data;
                    setForm({
                        name: outlet.name || '',
                        address: outlet.address || '',
                        city: outlet.city || '',
                        state: outlet.state || '',
                        pincode: outlet.pincode || '',
                        phone: outlet.phone || '',
                        email: outlet.email || '',
                        status: outlet.status || 'active',
                        workingDays: outlet.workingDays?.map(d => d.day) || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        openingTime: outlet.workingHours?.[0]?.openTime || '09:00 AM',
                        closingTime: outlet.workingHours?.[0]?.closeTime || '09:00 PM',
                    });
                } catch (err) {
                    setError('Failed to load outlet details');
                } finally {
                    setLoading(false);
                }
            };
            fetchOutlet();
        }
    }, [id, isEdit]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSubscriptionError(false);

        try {
            const payload = {
                ...form,
                workingHours: form.workingDays.map(day => ({
                    day,
                    isOpen: true,
                    openTime: form.openingTime,
                    closeTime: form.closingTime
                }))
            };

            if (isEdit) {
                await api.patch(`/outlets/${id}`, payload);
            } else {
                await api.post('/outlets', payload);
            }
            navigate('/admin/outlets');
        } catch (err) {
            const status = err.response?.status;
            const errorCode = err.response?.data?.errorCode;

            if (status === 403 && errorCode === 'SUBSCRIPTION_LIMIT_REACHED') {
                setSubscriptionError(true);
            } else {
                setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
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
                        <h1 className="text-2xl font-bold text-text tracking-tight">{isEdit ? 'Edit Outlet' : 'Add New Outlet'}</h1>
                        <p className="text-sm text-text-secondary mt-1">Configure your business location details.</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <Store className="w-4 h-4 text-primary" />
                            <h2 className="font-semibold text-text">Basic Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text-secondary">Outlet Name *</label>
                                <input
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Downtown Salon & Spa"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text-secondary">Contact Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        name="phone"
                                        required
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text-secondary">Email Address (Optional)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="outlet@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <label className="text-sm font-medium text-text-secondary block mb-2">Status</label>
                                <div className="flex gap-4">
                                    {['active', 'inactive'].map(status => (
                                        <label key={status} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={status}
                                                checked={form.status === status}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-primary border-border focus:ring-primary/30"
                                            />
                                            <span className={`text-sm capitalize ${form.status === status ? 'text-text font-semibold' : 'text-text-secondary group-hover:text-text'}`}>
                                                {status}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <MapPin className="w-4 h-4 text-primary" />
                            <h2 className="font-semibold text-text">Location Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text-secondary">Full Address *</label>
                                <textarea
                                    name="address"
                                    required
                                    rows="1"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="House/Street, Landmark"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary">City *</label>
                                    <input
                                        name="city"
                                        required
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary">State *</label>
                                    <input
                                        name="state"
                                        required
                                        value={form.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 w-1/2">
                                <label className="text-sm font-medium text-text-secondary">Pincode *</label>
                                <input
                                    name="pincode"
                                    required
                                    value={form.pincode}
                                    onChange={handleChange}
                                    placeholder="600001"
                                    maxLength="6"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Operational Hours */}
                    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5 md:col-span-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <Clock className="w-4 h-4 text-primary" />
                            <h2 className="font-semibold text-text">Working Hours</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                    <Calendar className="w-4 h-4" /> Working Days
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <button
                                            key={day.full}
                                            type="button"
                                            onClick={() => handleDayToggle(day.full)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.workingDays.includes(day.full)
                                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                    : 'bg-surface border border-border text-text-secondary hover:bg-secondary'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary">Opening Time</label>
                                    <select
                                        name="openingTime"
                                        value={form.openingTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition appearance-none"
                                    >
                                        {TIME_SLOTS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary">Closing Time</label>
                                    <select
                                        name="closingTime"
                                        value={form.closingTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition appearance-none"
                                    >
                                        {TIME_SLOTS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/outlets')}
                        className="px-6 py-2.5 rounded-xl font-semibold text-text-secondary hover:bg-surface-alt transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEdit ? 'Update Outlet' : 'Save Outlet'}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Custom Subscription Modal */}
            {subscriptionError && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSubscriptionError(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 transform">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6">
                                <AlertCircle className="w-10 h-10 text-error" />
                            </div>
                            <h3 className="text-2xl font-bold text-text">Limit Reached!</h3>
                            <p className="text-text-secondary mt-3 leading-relaxed">
                                Your subscription limit for outlets has been reached. Please upgrade your plan to add more locations.
                            </p>
                            <div className="w-full space-y-3 mt-8">
                                <button
                                    onClick={() => navigate('/admin/billing/upgrade')}
                                    className="w-full btn-primary py-3 rounded-2xl shadow-lg shadow-primary/20"
                                >
                                    Upgrade Now
                                </button>
                                <button
                                    onClick={() => setSubscriptionError(false)}
                                    className="w-full py-3 text-text-secondary font-semibold hover:text-text transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
