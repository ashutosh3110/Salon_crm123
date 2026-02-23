import BaseRoleLayout from './BaseRoleLayout';
import ManagerSidebar from '../components/manager/ManagerSidebar';

export default function ManagerLayout() {
    return <BaseRoleLayout SidebarComponent={ManagerSidebar} title="Operations Hub" accentColor="#6366F1" />;
}
