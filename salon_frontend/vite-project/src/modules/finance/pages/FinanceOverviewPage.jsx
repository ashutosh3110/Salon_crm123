import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/charts/StatCard';
import { HiOutlineCurrencyDollar, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineExclamation } from 'react-icons/hi';

const FinanceOverviewPage = () => (
    <ModulePage title="Finance" description="Revenue, expenses, and financial reports" icon={HiOutlineCurrencyDollar}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value="₹1,24,500" change="18%" changeType="positive" icon={HiOutlineCurrencyDollar} iconColor="emerald" />
            <StatCard title="Total Expenses" value="₹45,200" change="5%" changeType="negative" icon={HiOutlineTrendingDown} iconColor="red" />
            <StatCard title="Net Profit" value="₹79,300" change="22%" changeType="positive" icon={HiOutlineTrendingUp} iconColor="blue" />
            <StatCard title="Outstanding" value="₹12,800" icon={HiOutlineExclamation} iconColor="amber" subtitle="6 pending invoices" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                    {[
                        { desc: 'Service - Haircut + Color', amount: '+₹2,500', type: 'credit' },
                        { desc: 'Product - Shampoo (2x)', amount: '+₹900', type: 'credit' },
                        { desc: 'Supplier - Hair Color Stock', amount: '-₹5,000', type: 'debit' },
                        { desc: 'Petty Cash - Tea/Snacks', amount: '-₹350', type: 'debit' },
                    ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark last:border-0">
                            <p className="text-sm text-text-primary dark:text-white">{tx.desc}</p>
                            <p className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>{tx.amount}</p>
                        </div>
                    ))}
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Expense Breakdown</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Supplies', amount: '₹22,000', pct: 49, color: 'bg-primary' },
                        { label: 'Rent', amount: '₹12,000', pct: 27, color: 'bg-blue-500' },
                        { label: 'Utilities', amount: '₹6,200', pct: 14, color: 'bg-amber-500' },
                        { label: 'Miscellaneous', amount: '₹5,000', pct: 11, color: 'bg-gray-400' },
                    ].map((exp) => (
                        <div key={exp.label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-text-primary dark:text-gray-300">{exp.label}</span>
                                <span className="text-text-secondary dark:text-gray-400">{exp.amount}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2">
                                <div className={`${exp.color} h-2 rounded-full`} style={{ width: `${exp.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </ModulePage>
);

export default FinanceOverviewPage;
