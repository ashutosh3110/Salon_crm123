import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { HiOutlineGift, HiOutlinePlus } from 'react-icons/hi';

const PromotionListPage = () => (
    <ModulePage title="Promotions" description="Manage discounts, combos, and special offers" icon={HiOutlineGift}>
        <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-gray-400">Active promotions and packages</p>
            <Button icon={HiOutlinePlus}>Create Promotion</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
                { name: 'Summer Special - 20% Off', type: 'Discount', valid: 'Jun 1 - Aug 31', status: 'active' },
                { name: 'Bridal Package', type: 'Package', valid: 'Always', status: 'active', price: '₹15,000' },
                { name: 'Refer & Earn', type: 'Referral', valid: 'Always', status: 'active' },
                { name: 'First Visit - 10% Off', type: 'Discount', valid: 'Always', status: 'active' },
            ].map((p, i) => (
                <Card key={i} hover padding="md">
                    <div className="flex items-start justify-between mb-2">
                        <Badge color={p.type === 'Discount' ? 'amber' : p.type === 'Package' ? 'purple' : 'blue'} size="sm">{p.type}</Badge>
                        <Badge color="emerald" size="sm" dot>{p.status}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-text-primary dark:text-white mt-2">{p.name}</p>
                    <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">Valid: {p.valid}</p>
                    {p.price && <p className="text-sm font-bold text-primary mt-2">{p.price}</p>}
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default PromotionListPage;
