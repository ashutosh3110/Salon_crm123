import { useState, useEffect } from 'react';
import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import EmptyState from '../../../components/ui/EmptyState';
import { useApi } from '../../../hooks/useApi';
import { HiOutlineUsers, HiOutlinePlus, HiOutlineSearch, HiOutlineFilter, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';

const ClientListPage = () => {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', tags: '' });
    const { get, post, loading } = useApi();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await get('/clients', { search }, { silent: true });
            setClients(data?.clients || data?.data || []);
        } catch { }
    };

    const handleAddClient = async () => {
        try {
            await post('/clients', {
                ...newClient,
                tags: newClient.tags ? newClient.tags.split(',').map(t => t.trim()) : [],
            }, { successMessage: 'Client added successfully!' });
            setShowAddModal(false);
            setNewClient({ name: '', email: '', phone: '', tags: '' });
            fetchClients();
        } catch { }
    };

    return (
        <ModulePage title="Clients" description="Manage your client database and CRM" icon={HiOutlineUsers}>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 sm:max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-white/5 border border-border-light dark:border-border-dark text-text-primary dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    <Button variant="secondary" icon={HiOutlineFilter} size="md">Filter</Button>
                </div>
                <Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>Add Client</Button>
            </div>

            {/* Client List */}
            {clients.length === 0 ? (
                <EmptyState
                    icon={HiOutlineUsers}
                    title="No clients yet"
                    description="Add your first client to start building your CRM database"
                    action={<Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>Add First Client</Button>}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((client) => (
                        <Card key={client._id} hover padding="md">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary font-semibold text-sm">
                                        {client.name?.charAt(0)?.toUpperCase() || 'C'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-text-primary dark:text-white truncate">{client.name}</p>
                                    {client.email && (
                                        <p className="text-xs text-text-secondary dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                            <HiOutlineMail className="w-3 h-3" /> {client.email}
                                        </p>
                                    )}
                                    {client.phone && (
                                        <p className="text-xs text-text-secondary dark:text-gray-400 flex items-center gap-1">
                                            <HiOutlinePhone className="w-3 h-3" /> {client.phone}
                                        </p>
                                    )}
                                    {client.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {client.tags.map((tag) => (
                                                <Badge key={tag} size="sm" color="blue">{tag}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Client Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Client"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button onClick={handleAddClient} loading={loading}>Add Client</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input label="Full Name" placeholder="Enter client name" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} required />
                    <Input label="Email" type="email" placeholder="client@email.com" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                    <Input label="Phone" type="tel" placeholder="+91 98765 43210" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
                    <Input label="Tags" placeholder="VIP, Regular (comma separated)" value={newClient.tags} onChange={(e) => setNewClient({ ...newClient, tags: e.target.value })} helperText="Separate tags with commas" />
                </div>
            </Modal>
        </ModulePage>
    );
};

export default ClientListPage;
