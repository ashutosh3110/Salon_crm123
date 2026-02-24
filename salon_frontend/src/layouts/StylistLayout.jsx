import BaseRoleLayout from './BaseRoleLayout';
import StylistSidebar from '../components/stylist/StylistSidebar';

export default function StylistLayout() {
    return <BaseRoleLayout SidebarComponent={StylistSidebar} title="My Workspace" accentColor="var(--color-primary)" />;
}
