import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, TrendingUp, FileText, DollarSign, Wallet,
    ClipboardList, Calculator, Settings, LogOut, ChevronLeft, ChevronRight, X
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/accountant' },
    { label: 'Revenue', icon: TrendingUp, path: '/accountant/revenue' },
    { label: 'Expenses', icon: DollarSign, path: '/accountant/expenses' },
    { label: 'Supplier Invoices', icon: FileText, path: '/accountant/invoices' },
    { label: 'Payroll', icon: Wallet, path: '/accountant/payroll' },
    { label: 'GST / Tax', icon: ClipboardList, path: '/accountant/tax' },
    { label: 'Reconciliation', icon: Calculator, path: '/accountant/reconciliation' },
    { label: 'Settings', icon: Settings, path: '/accountant/settings' },
];

export default function AccountantSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const { logout } = useAuth();
    const location = useLocation();

    const content = (
        <div className="flex flex-col h-full bg-background transition-colors duration-300">
            <div className={`flex items-center h-16 border-b border-border transition-all ${collapsed ? 'justify-center' : 'px-4 justify-between'}`}>
                {!collapsed ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                        >
                            <Calculator className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-text leading-none">Finance</h2>
                            <p className="text-[10px] text-text-muted">Accountant Panel</p>
                        </div>
                    </div>
                ) : (
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20"
                        style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                        <Calculator className="w-4 h-4 text-white" />
                    </div>
                )}
                <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex w-6 h-6 rounded-full bg-surface items-center justify-center hover:bg-surface-alt">
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-text-muted" /> : <ChevronLeft className="w-3.5 h-3.5 text-text-muted" />}
                </button>
                <button onClick={() => setMobileOpen(false)} className="lg:hidden w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-alt">
                    <X className="w-4 h-4 text-text-muted" />
                </button>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink key={item.path} to={item.path} end={item.path === '/accountant'}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all group ${isActive
                                ? ''
                                : 'text-text-secondary hover:bg-surface hover:text-text'
                            } ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? item.label : undefined}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'color-mix(in srgb, var(--accent-color), transparent 85%)' : undefined,
                            color: isActive ? 'var(--accent-color)' : undefined
                        })}
                    >
                        <item.icon className="w-[18px] h-[18px] shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
            <div className={`border-t border-border p-2 ${collapsed ? 'flex justify-center' : ''}`}>
                <button onClick={logout} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all w-full ${collapsed ? 'justify-center' : ''}`}>
                    <LogOut className="w-[18px] h-[18px]" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <aside className={`hidden lg:block fixed top-0 left-0 h-screen z-40 border-r border-border/40 bg-background transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}>{content}</aside>
            {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}
            <aside className={`lg:hidden fixed top-0 left-0 h-screen w-60 bg-background border-r border-border/40 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>{content}</aside>
        </>
    );
}
