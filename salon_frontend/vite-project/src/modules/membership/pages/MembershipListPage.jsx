import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { HiOutlineTicket, HiOutlinePlus } from 'react-icons/hi';

const MembershipListPage = () => (
    <ModulePage title="Memberships" description="Manage customer membership plans" icon={HiOutlineTicket}>
        <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-gray-400">Membership plans for your customers</p>
            <Button icon={HiOutlinePlus}>Create Plan</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { name: 'Silver', price: '₹999/mo', benefits: ['5% off on services', 'Priority booking', 'Free consultation'], members: 45, color: 'from-gray-400 to-gray-500' },
                { name: 'Gold', price: '₹1,999/mo', benefits: ['15% off on services', '10% off on products', 'Priority booking', 'Free monthly facial'], members: 28, color: 'from-amber-400 to-amber-600' },
                { name: 'Platinum', price: '₹3,999/mo', benefits: ['25% off all services', '20% off products', 'VIP lounge access', 'Monthly spa session', 'Complimentary drinks'], members: 12, color: 'from-purple-500 to-purple-700' },
            ].map((plan) => (
                <Card key={plan.name} hover padding="none" className="overflow-hidden">
                    <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-2xl font-bold mt-2">{plan.price}</p>
                        <p className="text-sm opacity-80">{plan.members} active members</p>
                    </div>
                    <div className="p-5">
                        <ul className="space-y-2">
                            {plan.benefits.map((b, i) => (
                                <li key={i} className="text-sm text-text-primary dark:text-gray-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default MembershipListPage;
