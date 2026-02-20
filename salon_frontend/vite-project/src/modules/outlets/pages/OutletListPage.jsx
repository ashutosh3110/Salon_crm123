import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { HiOutlineOfficeBuilding, HiOutlinePlus, HiOutlineLocationMarker } from 'react-icons/hi';

const OutletListPage = () => (
    <ModulePage title="Outlets" description="Manage salon branches and locations" icon={HiOutlineOfficeBuilding}>
        <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-gray-400">Your salon branches</p>
            <Button icon={HiOutlinePlus}>Add Outlet</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
                { name: 'Main Branch - Koramangala', address: '123, 4th Block, Koramangala, Bangalore', staff: 8, status: 'active' },
                { name: 'HSR Layout Branch', address: '456, HSR Layout, Sector 2, Bangalore', staff: 5, status: 'active' },
                { name: 'Indiranagar Branch', address: '789, 12th Main, Indiranagar, Bangalore', staff: 6, status: 'active' },
            ].map((outlet) => (
                <Card key={outlet.name} hover padding="md">
                    <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <HiOutlineOfficeBuilding className="w-5 h-5 text-primary" />
                        </div>
                        <Badge color="emerald" size="sm" dot>{outlet.status}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-text-primary dark:text-white mt-2">{outlet.name}</p>
                    <p className="text-xs text-text-secondary dark:text-gray-400 flex items-center gap-1 mt-1">
                        <HiOutlineLocationMarker className="w-3 h-3" /> {outlet.address}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{outlet.staff} staff members</p>
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default OutletListPage;
