import { useState, useEffect } from 'react';
import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import EmptyState from '../../../components/ui/EmptyState';
import { useApi } from '../../../hooks/useApi';
import { HiOutlineScissors, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineClock } from 'react-icons/hi';

const ServiceListPage = () => {
    const [services, setServices] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '', duration: '', category: '', description: '' });
    const { get, post, loading } = useApi();

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            const data = await get('/services', null, { silent: true });
            setServices(data?.services || data?.data || []);
        } catch { }
    };

    const handleAdd = async () => {
        try {
            await post('/services', { ...newService, price: Number(newService.price), duration: Number(newService.duration) }, { successMessage: 'Service added!' });
            setShowAddModal(false);
            setNewService({ name: '', price: '', duration: '', category: '', description: '' });
            fetchServices();
        } catch { }
    };

    return (
        <ModulePage title="Services" description="Manage salon services and pricing" icon={HiOutlineScissors}>
            <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary dark:text-gray-400">{services.length} services</p>
                <Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>Add Service</Button>
            </div>

            {services.length === 0 ? (
                <EmptyState icon={HiOutlineScissors} title="No services yet" description="Add your salon services to start accepting bookings"
                    action={<Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>Add Service</Button>} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((svc) => (
                        <Card key={svc._id} hover padding="md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-text-primary dark:text-white">{svc.name}</p>
                                    {svc.category && <Badge size="sm" color="blue" className="mt-1">{svc.category}</Badge>}
                                </div>
                                <p className="text-lg font-bold text-primary">₹{svc.price}</p>
                            </div>
                            {svc.duration && (
                                <p className="text-xs text-text-secondary dark:text-gray-400 mt-2 flex items-center gap-1">
                                    <HiOutlineClock className="w-3 h-3" /> {svc.duration} min
                                </p>
                            )}
                            {svc.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{svc.description}</p>}
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Service"
                footer={<><Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button><Button onClick={handleAdd} loading={loading}>Add Service</Button></>}>
                <div className="space-y-4">
                    <Input label="Service Name" placeholder="e.g. Haircut" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Price (₹)" type="number" placeholder="500" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} required />
                        <Input label="Duration (min)" type="number" placeholder="30" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} />
                    </div>
                    <Input label="Category" placeholder="Hair, Skin, Nails..." value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} />
                    <Input label="Description" placeholder="Short description" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
                </div>
            </Modal>
        </ModulePage>
    );
};

export default ServiceListPage;
