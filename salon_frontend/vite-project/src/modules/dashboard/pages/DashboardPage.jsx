import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/charts/StatCard';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../config/constants';
import {
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineUsers,
    HiOutlineShoppingBag,
    HiOutlineTrendingUp,
    HiOutlineClock,
    HiOutlineClipboardCheck,
    HiOutlineExclamation,
} from 'react-icons/hi';

// Super Admin Dashboard
const SuperAdminDashboard = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Platform Overview</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">Monitor your entire SaaS platform</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Salons" value="124" change="12%" changeType="positive" icon={HiOutlineShoppingBag} iconColor="primary" />
            <StatCard title="Active Subscriptions" value="98" change="8%" changeType="positive" icon={HiOutlineClipboardCheck} iconColor="emerald" />
            <StatCard title="Platform Revenue" value="₹4.2L" change="15%" changeType="positive" icon={HiOutlineCurrencyDollar} iconColor="blue" />
            <StatCard title="Total Users" value="1,240" change="5%" changeType="positive" icon={HiOutlineUsers} iconColor="purple" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Recent Tenant Registrations</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Glamour Studio', plan: 'Premium', date: 'Today' },
                        { name: 'Style Hub', plan: 'Basic', date: 'Yesterday' },
                        { name: 'Beauty Point', plan: 'Free', date: '2 days ago' },
                    ].map((t) => (
                        <div key={t.name} className="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark last:border-0">
                            <div>
                                <p className="text-sm font-medium text-text-primary dark:text-white">{t.name}</p>
                                <p className="text-xs text-text-secondary dark:text-gray-400">{t.date}</p>
                            </div>
                            <Badge color={t.plan === 'Premium' ? 'purple' : t.plan === 'Basic' ? 'blue' : 'gray'}>{t.plan}</Badge>
                        </div>
                    ))}
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Subscription Distribution</h3>
                <div className="space-y-4">
                    {[
                        { plan: 'Enterprise', count: 12, percentage: 12, color: 'bg-purple-500' },
                        { plan: 'Premium', count: 34, percentage: 35, color: 'bg-primary' },
                        { plan: 'Basic', count: 52, percentage: 53, color: 'bg-blue-500' },
                        { plan: 'Free', count: 26, percentage: 26, color: 'bg-gray-400' },
                    ].map((s) => (
                        <div key={s.plan}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-text-primary dark:text-gray-300 font-medium">{s.plan}</span>
                                <span className="text-text-secondary dark:text-gray-400">{s.count} salons</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2">
                                <div className={`${s.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${s.percentage}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

// Salon Owner Dashboard
const OwnerDashboard = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Salon Dashboard</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">Today's overview of your salon operations</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Today's Revenue" value="₹12,450" change="18%" changeType="positive" icon={HiOutlineCurrencyDollar} iconColor="emerald" />
            <StatCard title="Appointments" value="24" change="3" changeType="positive" icon={HiOutlineCalendar} iconColor="blue" subtitle="5 remaining" />
            <StatCard title="Walk-ins" value="8" icon={HiOutlineUsers} iconColor="purple" subtitle="3 in queue" />
            <StatCard title="Products Sold" value="15" change="22%" changeType="positive" icon={HiOutlineShoppingBag} iconColor="amber" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Upcoming Appointments</h3>
                <div className="space-y-3">
                    {[
                        { client: 'Priya Sharma', service: 'Hair Color + Haircut', time: '2:00 PM', stylist: 'Riya', status: 'confirmed' },
                        { client: 'Amit Kumar', service: 'Beard Trim', time: '2:30 PM', stylist: 'Rahul', status: 'confirmed' },
                        { client: 'Sneha Gupta', service: 'Facial + Cleanup', time: '3:00 PM', stylist: 'Meera', status: 'pending' },
                        { client: 'Rohit Verma', service: 'Haircut', time: '3:30 PM', stylist: 'Rahul', status: 'confirmed' },
                    ].map((a, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-border-light dark:border-border-dark last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <HiOutlineClock className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary dark:text-white">{a.client}</p>
                                    <p className="text-xs text-text-secondary dark:text-gray-400">{a.service} • {a.stylist}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-text-primary dark:text-white">{a.time}</p>
                                <Badge color={a.status === 'confirmed' ? 'emerald' : 'amber'} size="sm">{a.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                    {[
                        { label: 'New Booking', icon: '📅', color: 'bg-blue-500/10 text-blue-500' },
                        { label: 'Create Invoice', icon: '🧾', color: 'bg-emerald-500/10 text-emerald-500' },
                        { label: 'Add Walk-in', icon: '🚶', color: 'bg-purple-500/10 text-purple-500' },
                        { label: 'View Reports', icon: '📊', color: 'bg-amber-500/10 text-amber-500' },
                    ].map((action) => (
                        <button
                            key={action.label}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer border border-border-light dark:border-border-dark"
                        >
                            <span className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center text-lg`}>{action.icon}</span>
                            <span className="text-sm font-medium text-text-primary dark:text-white">{action.label}</span>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

// Receptionist Dashboard
const ReceptionistDashboard = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Front Desk</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">Manage appointments and walk-ins</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Today's Appointments" value="24" icon={HiOutlineCalendar} iconColor="blue" subtitle="5 remaining" />
            <StatCard title="Queue" value="3" icon={HiOutlineUsers} iconColor="amber" subtitle="~45 min wait" />
            <StatCard title="Bills Generated" value="19" icon={HiOutlineCurrencyDollar} iconColor="emerald" />
        </div>
    </div>
);

// Stylist Dashboard
const StylistDashboard = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">My Schedule</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">Your appointments for today</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="My Appointments" value="8" icon={HiOutlineCalendar} iconColor="blue" subtitle="3 remaining" />
            <StatCard title="Completed" value="5" icon={HiOutlineClipboardCheck} iconColor="emerald" />
            <StatCard title="Avg. Rating" value="4.8 ★" icon={HiOutlineTrendingUp} iconColor="amber" />
        </div>
    </div>
);

// Accountant Dashboard
const AccountantDashboard = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Finance Overview</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">Today's financial summary</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Today's Revenue" value="₹12,450" change="18%" changeType="positive" icon={HiOutlineCurrencyDollar} iconColor="emerald" />
            <StatCard title="Expenses" value="₹3,200" icon={HiOutlineTrendingUp} iconColor="red" />
            <StatCard title="Outstanding" value="₹8,500" icon={HiOutlineExclamation} iconColor="amber" subtitle="4 pending invoices" />
            <StatCard title="Net Profit" value="₹9,250" change="12%" changeType="positive" icon={HiOutlineCurrencyDollar} iconColor="blue" />
        </div>
    </div>
);

// Inventory Manager Dashboard
const InventoryDashboard = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Inventory Overview</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">Stock levels and alerts</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Products" value="156" icon={HiOutlineShoppingBag} iconColor="blue" />
            <StatCard title="Low Stock" value="12" icon={HiOutlineExclamation} iconColor="red" subtitle="Needs reorder" />
            <StatCard title="Today Used" value="34" icon={HiOutlineTrendingUp} iconColor="amber" />
            <StatCard title="Stock Value" value="₹2.8L" icon={HiOutlineCurrencyDollar} iconColor="emerald" />
        </div>
    </div>
);

// Manager Dashboard (reuses Owner but with limited scope)
const ManagerDashboard = OwnerDashboard;

// Main Dashboard Router
const DashboardPage = () => {
    const { user } = useAuth();

    const dashboardMap = {
        [ROLES.SUPER_ADMIN]: SuperAdminDashboard,
        [ROLES.ADMIN]: OwnerDashboard,
        [ROLES.MANAGER]: ManagerDashboard,
        [ROLES.RECEPTIONIST]: ReceptionistDashboard,
        [ROLES.STYLIST]: StylistDashboard,
        [ROLES.ACCOUNTANT]: AccountantDashboard,
        [ROLES.INVENTORY_MANAGER]: InventoryDashboard,
    };

    const DashboardComponent = dashboardMap[user?.role] || OwnerDashboard;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <DashboardComponent />
        </motion.div>
    );
};

export default DashboardPage;
