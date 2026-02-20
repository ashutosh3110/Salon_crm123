import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/charts/StatCard';
import { HiOutlineUserGroup, HiOutlinePlus, HiOutlineClock, HiOutlineCalendar, HiOutlineCurrencyDollar } from 'react-icons/hi';

const EmployeeListPage = () => (
    <ModulePage title="HR & Payroll" description="Manage employees, attendance, and payroll" icon={HiOutlineUserGroup}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Staff" value="12" icon={HiOutlineUserGroup} iconColor="blue" />
            <StatCard title="Present Today" value="10" icon={HiOutlineClock} iconColor="emerald" />
            <StatCard title="On Leave" value="2" icon={HiOutlineCalendar} iconColor="amber" />
            <StatCard title="Payroll Due" value="₹1.8L" icon={HiOutlineCurrencyDollar} iconColor="purple" />
        </div>

        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white">Team Members</h3>
            <Button icon={HiOutlinePlus}>Add Employee</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
                { name: 'Riya Patel', role: 'Stylist', status: 'active', attendance: 'Present' },
                { name: 'Amit Kumar', role: 'Manager', status: 'active', attendance: 'Present' },
                { name: 'Meera Singh', role: 'Receptionist', status: 'active', attendance: 'Present' },
                { name: 'Priya Sharma', role: 'Stylist', status: 'active', attendance: 'On Leave' },
                { name: 'Rahul Verma', role: 'Stylist', status: 'active', attendance: 'Present' },
                { name: 'Sneha Gupta', role: 'Accountant', status: 'inactive', attendance: 'Absent' },
            ].map((emp) => (
                <Card key={emp.name} hover padding="md">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">{emp.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-text-primary dark:text-white">{emp.name}</p>
                            <p className="text-xs text-text-secondary dark:text-gray-400">{emp.role}</p>
                        </div>
                        <div className="text-right">
                            <Badge size="sm" color={emp.attendance === 'Present' ? 'emerald' : emp.attendance === 'On Leave' ? 'amber' : 'red'}>
                                {emp.attendance}
                            </Badge>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default EmployeeListPage;
