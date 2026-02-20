import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { HiOutlineCollection, HiOutlinePlus } from 'react-icons/hi';

const PlanListPage = () => (
    <ModulePage title="Subscriptions" description="Manage SaaS subscription plans and tenants" icon={HiOutlineCollection}>
        <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-gray-400">Platform subscription plans</p>
            <Button icon={HiOutlinePlus}>Create Plan</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { name: 'Free', price: '₹0/mo', tenants: 26, features: ['1 Outlet', '2 Staff', 'Basic POS', 'Email Support'], color: 'from-gray-400 to-gray-500' },
                { name: 'Basic', price: '₹999/mo', tenants: 52, features: ['3 Outlets', '10 Staff', 'Full POS', 'Booking Module', 'SMS Support'], color: 'from-blue-400 to-blue-600' },
                { name: 'Premium', price: '₹2,499/mo', tenants: 34, features: ['10 Outlets', 'Unlimited Staff', 'All Modules', 'WhatsApp API', 'Priority Support'], color: 'from-primary to-primary-dark' },
                { name: 'Enterprise', price: 'Custom', tenants: 12, features: ['Unlimited Everything', 'White-label', 'Dedicated Support', 'Custom Integrations', 'SLA'], color: 'from-purple-500 to-purple-700' },
            ].map((plan) => (
                <Card key={plan.name} hover padding="none" className="overflow-hidden">
                    <div className={`bg-gradient-to-br ${plan.color} p-5 text-white`}>
                        <p className="text-sm font-medium opacity-80">{plan.name}</p>
                        <p className="text-2xl font-bold mt-1">{plan.price}</p>
                        <p className="text-xs opacity-70 mt-1">{plan.tenants} active tenants</p>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-2">
                            {plan.features.map((f, i) => (
                                <li key={i} className="text-xs text-text-primary dark:text-gray-300 flex items-center gap-2">
                                    <span className="text-emerald-500">✓</span> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default PlanListPage;
