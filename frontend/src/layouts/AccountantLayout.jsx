import BaseRoleLayout from './BaseRoleLayout';
import AccountantSidebar from '../components/accountant/AccountantSidebar';

export default function AccountantLayout() {
    return <BaseRoleLayout SidebarComponent={AccountantSidebar} title="Finance" accentColor="var(--color-primary)" />;
}
