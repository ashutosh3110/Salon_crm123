import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/charts/StatCard';
import { HiOutlineTruck, HiOutlinePlus, HiOutlineCurrencyDollar, HiOutlineClipboardList } from 'react-icons/hi';

const SupplierListPage = () => (
    <ModulePage title="Suppliers" description="Manage suppliers and purchase orders" icon={HiOutlineTruck}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Suppliers" value="8" icon={HiOutlineTruck} iconColor="blue" />
            <StatCard title="Open POs" value="3" icon={HiOutlineClipboardList} iconColor="amber" />
            <StatCard title="Outstanding" value="₹32,000" icon={HiOutlineCurrencyDollar} iconColor="red" />
        </div>
        <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-gray-400">All Suppliers</p>
            <Button icon={HiOutlinePlus}>Add Supplier</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { name: 'Beauty Supplies Co.', products: 24, outstanding: '₹12,000', status: 'active' },
                { name: 'Hair Pro Distributors', products: 18, outstanding: '₹8,000', status: 'active' },
                { name: 'Skincare Hub', products: 12, outstanding: '₹12,000', status: 'active' },
            ].map((s) => (
                <Card key={s.name} hover padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-text-primary dark:text-white">{s.name}</p>
                            <p className="text-xs text-text-secondary dark:text-gray-400">{s.products} products</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-red-500">{s.outstanding}</p>
                            <Badge size="sm" color="emerald">{s.status}</Badge>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default SupplierListPage;
