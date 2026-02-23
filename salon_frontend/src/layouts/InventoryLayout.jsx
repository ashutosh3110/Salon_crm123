import BaseRoleLayout from './BaseRoleLayout';
import InventorySidebar from '../components/inventory/InventorySidebar';

export default function InventoryLayout() {
    return <BaseRoleLayout SidebarComponent={InventorySidebar} title="Inventory" accentColor="#F59E0B" />;
}
