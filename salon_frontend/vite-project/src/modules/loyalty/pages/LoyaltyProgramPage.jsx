import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/charts/StatCard';
import Button from '../../../components/ui/Button';
import { HiOutlineStar, HiOutlineUsers, HiOutlineGift, HiOutlinePlus } from 'react-icons/hi';

const LoyaltyProgramPage = () => (
    <ModulePage title="Loyalty & Referrals" description="Manage loyalty points, rewards, and referral programs" icon={HiOutlineStar}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Active Members" value="342" icon={HiOutlineUsers} iconColor="blue" />
            <StatCard title="Points Redeemed" value="12,450" icon={HiOutlineStar} iconColor="amber" subtitle="This month" />
            <StatCard title="Referrals" value="28" change="15%" changeType="positive" icon={HiOutlineGift} iconColor="emerald" />
        </div>
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white">Loyalty Rules</h3>
                <Button size="sm" icon={HiOutlinePlus}>Add Rule</Button>
            </div>
            <div className="space-y-3">
                {[
                    { rule: 'Earn 1 point per ₹100 spent', status: 'Active' },
                    { rule: 'Redeem 100 points = ₹50 off', status: 'Active' },
                    { rule: 'Birthday bonus: 2x points', status: 'Active' },
                    { rule: 'Referral reward: 200 points', status: 'Active' },
                ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark last:border-0">
                        <p className="text-sm text-text-primary dark:text-white">{r.rule}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">{r.status}</span>
                    </div>
                ))}
            </div>
        </Card>
    </ModulePage>
);

export default LoyaltyProgramPage;
