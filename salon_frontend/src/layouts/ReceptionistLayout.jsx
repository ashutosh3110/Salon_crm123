import BaseRoleLayout from './BaseRoleLayout';
import ReceptionistSidebar from '../components/receptionist/ReceptionistSidebar';

export default function ReceptionistLayout() {
    return <BaseRoleLayout SidebarComponent={ReceptionistSidebar} title="Front Desk" accentColor="var(--color-primary)" />;
}
