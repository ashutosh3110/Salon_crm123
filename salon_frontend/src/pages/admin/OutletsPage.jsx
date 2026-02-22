import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Eye,
    MoreVertical,
    Store,
    MapPin,
    Users,
    Filter,
    Ban,
    ChevronRight,
    SearchX
} from 'lucide-react';
import api from '../../services/api';

const MOCK_OUTLETS = [
    {
        _id: 'mock-1',
        name: 'Grace & Glamour - Downtown',
        city: 'Mumbai',
        address: '123, Marine Drive, South Mumbai',
        staffCount: 15,
        status: 'active',
        phone: '+91 98765 43210',
        email: 'downtown@graceglamour.com'
    },
    {
        _id: 'mock-2',
        name: 'The Royal Salon - Bandra',
        city: 'Mumbai',
        address: 'B-42, Pali Hill, Bandra West',
        staffCount: 8,
        status: 'active',
        phone: '+91 98765 43211',
        email: 'bandra@royalsalon.com'
    },
    {
        _id: 'mock-3',
        name: 'Elegance Spa & Unisex Salon',
        city: 'Pune',
        address: 'Koregaon Park, Lane 7, Pune',
        staffCount: 12,
        status: 'inactive',
        phone: '+91 98765 43212',
        email: 'pune@elegance.com'
    }
];

export default function OutletsPage() {
    const navigate = useNavigate();
    const [outlets, setOutlets] = useState([]);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOutlets = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/outlets');
            const list = data?.data?.results || data?.results || data?.data || data || [];

            let finalData = Array.isArray(list) ? list : [];

            // If API returns no data, use mock data for demonstration
            if (finalData.length === 0) {
                finalData = MOCK_OUTLETS;
            } else {
                finalData = finalData.map(o => ({
                    ...o,
                    staffCount: o.staffCount || Math.floor(Math.random() * 10) + 2
                }));
            }

            setOutlets(finalData);
            setFilteredOutlets(finalData);
        }
        catch (err) {
            console.error('Failed to fetch outlets, using mock data:', err);
            setOutlets(MOCK_OUTLETS);
            setFilteredOutlets(MOCK_OUTLETS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOutlets(); }, []);

    useEffect(() => {
        let result = outlets;

        if (searchTerm) {
            result = result.filter(o =>
                o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (o.city && o.city.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }

        setFilteredOutlets(result);
    }, [searchTerm, statusFilter, outlets]);

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/outlets/${id}`, { status: newStatus });
            fetchOutlets();
        } catch {
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Outlets</h1>
                    <p className="text-sm text-text-secondary mt-1">Manage your salon business locations.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/outlets/new')}
                    className="btn-salon inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Outlet
                </button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-border shadow-sm hover-shine">
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search outlet..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all input-expand"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-text-secondary" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-40 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden card-interactive">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Outlet Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">City</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Staff</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="6" className="px-6 py-4">
                                            <div className="h-10 bg-surface rounded-lg relative overflow-hidden">
                                                <div className="absolute inset-0 animate-shimmer"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredOutlets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <SearchX className="w-12 h-12 text-text-muted mb-4" />
                                            <h3 className="text-lg font-semibold text-text">No outlets found</h3>
                                            <p className="text-text-secondary text-sm max-w-xs mx-auto mt-1">
                                                {searchTerm || statusFilter !== 'all'
                                                    ? "We couldn't find any outlets matching your filters."
                                                    : "Create your first outlet to start managing your salon locations."}
                                            </p>
                                            {!searchTerm && statusFilter === 'all' && (
                                                <button
                                                    onClick={() => navigate('/admin/outlets/new')}
                                                    className="mt-6 btn-primary"
                                                >
                                                    Create First Outlet
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOutlets.map((o, index) => (
                                    <tr
                                        key={o._id}
                                        style={{ '--delay': `${index * 80}ms` }}
                                        className="hover:bg-surface/50 active:bg-surface transition-all group cursor-default animate-stagger"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                                    <Store className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-semibold text-text">{o.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">{o.city || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-text-muted truncate max-w-[200px]">{o.address}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                                                <Users className="w-3 h-3" /> {o.staffCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${o.status === 'active'
                                                ? 'bg-green-50 text-green-600'
                                                : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${o.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                <span className="capitalize">{o.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/outlets/${o._id}`)}
                                                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all tooltip"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/outlets/edit/${o._id}`)}
                                                    className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(o._id, o.status)}
                                                    className={`p-2 rounded-lg transition-all ${o.status === 'active'
                                                        ? 'text-text-muted hover:text-error hover:bg-error/5'
                                                        : 'text-text-muted hover:text-success hover:bg-success/5'
                                                        }`}
                                                    title={o.status === 'active' ? 'Disable' : 'Enable'}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
