import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Clock, User } from 'lucide-react';
import api from '../../services/api';

const statusColors = {
    pending: 'bg-yellow-50 text-yellow-600',
    confirmed: 'bg-blue-50 text-blue-600',
    completed: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-600',
    'no-show': 'bg-gray-100 text-gray-500',
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ client: '', service: '', staff: '', appointmentDate: '', duration: 30, notes: '' });
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/bookings');
            // Backend returns { success, data: { results: [], ... } }
            const list = response.data?.data?.results || response.data?.data || response.data || [];
            setBookings(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [cRes, sRes, uRes] = await Promise.all([
                api.get('/clients'),
                api.get('/services'),
                api.get('/users'),
            ]);

            const clientsList = cRes.data?.data?.results || cRes.data?.data || cRes.data || [];
            const servicesList = sRes.data?.data?.results || sRes.data?.data || sRes.data || [];
            const usersList = uRes.data?.data?.results || uRes.data?.data || uRes.data || [];

            setClients(Array.isArray(clientsList) ? clientsList : []);
            setServices(Array.isArray(servicesList) ? servicesList : []);
            setStaff(Array.isArray(usersList) ? usersList : []);
        } catch (err) {
            console.error('Failed to fetch dropdown data:', err);
        }
    };

    useEffect(() => { fetchBookings(); fetchDropdownData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bookings', form);
            setShowModal(false);
            setForm({ client: '', service: '', staff: '', appointmentDate: '', duration: 30, notes: '' });
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating booking');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            fetchBookings();
        } catch (err) {
            alert('Error updating status');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Bookings</h1>
                    <p className="text-sm text-text-secondary mt-1">{bookings.length} total bookings</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Booking
                </button>
            </div>

            {/* Bookings */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20">
                        <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <p className="text-sm text-text-secondary">No bookings yet</p>
                        <p className="text-xs text-text-muted mt-1">Create your first booking to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-surface">
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Client</th>
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Service</th>
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary hidden md:table-cell">Staff</th>
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Date & Time</th>
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Status</th>
                                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b._id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
                                        <td className="px-5 py-3 font-medium text-text">{b.client?.name || 'N/A'}</td>
                                        <td className="px-5 py-3 text-text-secondary">{b.service?.name || 'N/A'}</td>
                                        <td className="px-5 py-3 text-text-secondary hidden md:table-cell">{b.staff?.name || 'N/A'}</td>
                                        <td className="px-5 py-3 text-text-secondary">
                                            {b.appointmentDate ? new Date(b.appointmentDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                                        </td>
                                        <td className="px-5 py-3">
                                            <select
                                                value={b.status}
                                                onChange={(e) => updateStatus(b._id, e.target.value)}
                                                className={`text-xs font-medium px-2 py-1 rounded-md border-0 cursor-pointer ${statusColors[b.status] || 'bg-gray-50 text-gray-500'}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="no-show">No Show</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Edit">
                                                <Edit className="w-4 h-4 text-text-secondary" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* New Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text mb-5">New Booking</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Client *</label>
                                <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                                    <option value="">Select client</option>
                                    {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Service *</label>
                                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                                    <option value="">Select service</option>
                                    {services.map((s) => <option key={s._id} value={s._id}>{s.name} — ₹{s.price}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Staff *</label>
                                <select value={form.staff} onChange={(e) => setForm({ ...form, staff: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                                    <option value="">Select staff</option>
                                    {staff.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Date & Time *</label>
                                <input type="datetime-local" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Duration (minutes)</label>
                                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface transition">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-2.5">Create Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
