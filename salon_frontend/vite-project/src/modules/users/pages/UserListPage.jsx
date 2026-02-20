import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { HiOutlineUsers, HiOutlinePlus } from 'react-icons/hi';
import { ROLE_LABELS } from '../../../config/constants';

const UserListPage = () => (
    <ModulePage title="Users & Staff" description="Manage user accounts and roles" icon={HiOutlineUsers}>
        <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-gray-400">All team members and access control</p>
            <Button icon={HiOutlinePlus}>Add User</Button>
        </div>
        <div className="space-y-3">
            {[
                { name: 'Admin User', email: 'admin@salon.com', role: 'admin', status: 'active' },
                { name: 'Riya Patel', email: 'riya@salon.com', role: 'stylist', status: 'active' },
                { name: 'Amit Kumar', email: 'amit@salon.com', role: 'manager', status: 'active' },
                { name: 'Meera Singh', email: 'meera@salon.com', role: 'receptionist', status: 'active' },
                { name: 'Sneha Gupta', email: 'sneha@salon.com', role: 'accountant', status: 'inactive' },
                { name: 'Rajesh', email: 'rajesh@salon.com', role: 'inventory_manager', status: 'active' },
            ].map((user) => (
                <Card key={user.email} hover padding="md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <span className="text-primary font-semibold text-sm">{user.name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary dark:text-white">{user.name}</p>
                                <p className="text-xs text-text-secondary dark:text-gray-400">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge color="purple" size="sm">{ROLE_LABELS[user.role] || user.role}</Badge>
                            <Badge color={user.status === 'active' ? 'emerald' : 'gray'} size="sm" dot>{user.status}</Badge>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default UserListPage;
