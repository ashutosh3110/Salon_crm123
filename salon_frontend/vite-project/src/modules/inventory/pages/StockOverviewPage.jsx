import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/charts/StatCard';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { HiOutlineClipboardList, HiOutlineExclamation, HiOutlineShoppingBag, HiOutlineTrendingDown, HiOutlinePlus } from 'react-icons/hi';

const StockOverviewPage = () => {
    return (
        <ModulePage title="Inventory" description="Stock levels, movements, and alerts" icon={HiOutlineClipboardList}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Items" value="156" icon={HiOutlineShoppingBag} iconColor="blue" />
                <StatCard title="Low Stock Items" value="12" icon={HiOutlineExclamation} iconColor="red" subtitle="Needs reorder" />
                <StatCard title="Out of Stock" value="3" icon={HiOutlineTrendingDown} iconColor="amber" />
                <StatCard title="Total Stock Value" value="₹2.8L" icon={HiOutlineShoppingBag} iconColor="emerald" />
            </div>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-white">Low Stock Alerts</h3>
                    <Button variant="secondary" size="sm" icon={HiOutlinePlus}>Reorder</Button>
                </div>
                <div className="space-y-3">
                    {[
                        { name: 'Keratin Shampoo', stock: 3, min: 10, category: 'Hair Care' },
                        { name: 'Face Wash Gel', stock: 5, min: 15, category: 'Skin Care' },
                        { name: 'Hair Color (Brown)', stock: 2, min: 8, category: 'Hair Color' },
                    ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark last:border-0">
                            <div>
                                <p className="text-sm font-medium text-text-primary dark:text-white">{item.name}</p>
                                <p className="text-xs text-text-secondary dark:text-gray-400">{item.category}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-red-500">{item.stock} left</p>
                                    <p className="text-[10px] text-gray-400">Min: {item.min}</p>
                                </div>
                                <Badge color="red" size="sm" dot>Low</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </ModulePage>
    );
};

export default StockOverviewPage;
