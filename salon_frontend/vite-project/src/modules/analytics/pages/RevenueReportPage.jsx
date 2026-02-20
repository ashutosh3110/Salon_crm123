import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/charts/StatCard';
import { HiOutlineChartBar, HiOutlineCurrencyDollar, HiOutlineTrendingUp, HiOutlineUsers, HiOutlineShoppingBag } from 'react-icons/hi';

const RevenueReportPage = () => (
    <ModulePage title="Analytics" description="Revenue, performance, and business insights" icon={HiOutlineChartBar}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Monthly Revenue" value="₹4,52,000" change="18%" changeType="positive" icon={HiOutlineCurrencyDollar} iconColor="emerald" />
            <StatCard title="Avg. Ticket Size" value="₹1,850" change="8%" changeType="positive" icon={HiOutlineTrendingUp} iconColor="blue" />
            <StatCard title="Client Retention" value="78%" change="5%" changeType="positive" icon={HiOutlineUsers} iconColor="purple" />
            <StatCard title="Product Sales" value="₹45,000" change="12%" changeType="positive" icon={HiOutlineShoppingBag} iconColor="amber" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Revenue Trend (Last 7 Days)</h3>
                <div className="flex items-end gap-2 h-48">
                    {[65, 80, 45, 90, 75, 100, 85].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden" style={{ height: `${val}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg" />
                            </div>
                            <span className="text-[10px] text-gray-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                        </div>
                    ))}
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Top Services</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Hair Color + Haircut', revenue: '₹85,000', bookings: 45 },
                        { name: 'Facial Treatment', revenue: '₹62,000', bookings: 38 },
                        { name: 'Bridal Package', revenue: '₹58,000', bookings: 12 },
                        { name: 'Beard Trim', revenue: '₹24,000', bookings: 80 },
                        { name: 'Manicure & Pedicure', revenue: '₹18,000', bookings: 25 },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                                <div>
                                    <p className="text-sm font-medium text-text-primary dark:text-white">{s.name}</p>
                                    <p className="text-xs text-text-secondary dark:text-gray-400">{s.bookings} bookings</p>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-emerald-500">{s.revenue}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </ModulePage>
);

export default RevenueReportPage;
