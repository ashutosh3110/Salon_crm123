import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    LayoutDashboard, User, ShieldCheck, Scissors,
    Calculator, Box, CreditCard, Smartphone,
    Crown, ArrowRight, LogOut, Globe
} from 'lucide-react';

const PANELS = [
    {
        id: 'client',
        name: 'Customer App',
        path: '/app',
        icon: Smartphone,
        desc: 'Mobile-first client experience, bookings & loyalty.',
        color: '#C8956C',
        role: 'customer'
    },
    {
        id: 'admin',
        name: 'Salon Owner',
        path: '/admin',
        icon: Crown,
        desc: 'Full business control, strategy & CRM.',
        color: '#FFD700',
        role: 'admin'
    },
    {
        id: 'manager',
        name: 'Operations',
        path: '/manager',
        icon: LayoutDashboard,
        desc: 'Daily branch management & team tracking.',
        color: '#4A90E2',
        role: 'manager'
    },
    {
        id: 'stylist',
        name: 'Stylist Hub',
        path: '/stylist',
        icon: Scissors,
        desc: 'Personal commissions, gallery & clients.',
        color: '#E91E63',
        role: 'stylist'
    },
    {
        id: 'reception',
        name: 'Front Desk',
        path: '/receptionist',
        icon: User,
        desc: 'Queue management & walk-in check-ins.',
        color: '#9C27B0',
        role: 'receptionist'
    },
    {
        id: 'pos',
        name: 'POS System',
        path: '/pos',
        icon: CreditCard,
        desc: 'High-speed billing & billing terminal.',
        color: '#4CAF50',
        role: 'pos'
    },
    {
        id: 'accountant',
        name: 'Finance',
        path: '/accountant',
        icon: Calculator,
        desc: 'Taxes, reconciliation & accounting books.',
        color: '#FF5722',
        role: 'accountant'
    },
    {
        id: 'inventory',
        name: 'Inventory',
        path: '/inventory',
        icon: Box,
        desc: 'Stock management & purchase orders.',
        color: '#607D8B',
        role: 'inventory_manager'
    },
    {
        id: 'superadmin',
        name: 'Super Admin',
        path: '/superadmin',
        icon: ShieldCheck,
        desc: 'SaaS platform management & tenants.',
        color: '#B85C5C',
        role: 'superadmin'
    }
];

export default function PanelLaunchpad() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const logoSrc = theme === 'dark' ? '/new wapixo logo .png' : '/new black wapixo logo .png';

    return (
        <div className="min-h-screen selection:bg-[#B85C5C]/30" style={{ background: 'var(--wapixo-bg)', color: 'var(--wapixo-text)', fontFamily: "'Inter', sans-serif" }}>
            {/* Ambient background blur */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full"
                    style={{ background: theme === 'dark' ? 'rgba(184, 92, 92, 0.08)' : 'rgba(184, 92, 92, 0.05)' }}
                />
                <div 
                    className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full"
                    style={{ background: theme === 'dark' ? 'rgba(200, 149, 108, 0.05)' : 'rgba(200, 149, 108, 0.03)' }}
                />
            </div>

            <nav className="relative z-20 max-w-7xl mx-auto flex justify-between items-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex items-center gap-2"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#B85C5C' }}>Portals Selection</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex justify-center"
                >
                    <img
                        src={logoSrc}
                        alt="Logo"
                        className="h-16 md:h-24 w-auto object-contain hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => navigate('/')}
                    />
                </motion.div>

                <div className="flex-1 flex items-center justify-end gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-full border transition-colors"
                        style={{ background: 'var(--wapixo-bg-alt)', borderColor: 'var(--wapixo-border)', color: 'var(--wapixo-text-muted)' }}
                    >
                        <Globe size={16} />
                    </motion.button>
                    {user && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={logout}
                            className="bg-red-500/5 hover:bg-red-500/10 text-red-500 px-4 py-2 rounded-xl border border-red-500/20 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
                        >
                            <LogOut size={12} />
                            Logout
                        </motion.button>
                    )}
                </div>
            </nav>

            <header className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 mb-12">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black italic tracking-tighter"
                    style={{ color: 'var(--wapixo-text)' }}
                >
                    System <span style={{ color: '#B85C5C' }}>Access.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] max-w-md"
                    style={{ color: 'var(--wapixo-text-muted)', opacity: 0.6 }}
                >
                    Central command for all specialized business modules.
                </motion.p>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-24">
                {PANELS.map((panel, i) => {
                    const isUserRole = user?.role === panel.role;
                    return (
                        <motion.div
                            key={panel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (i * 0.05) }}
                            whileHover={{ y: -5, scale: 1.01 }}
                            onClick={() => {
                                if (panel.role === 'customer') {
                                    navigate('/app/login');
                                } else {
                                    navigate(`/login?role=${panel.role}`);
                                }
                            }}
                            className="group relative cursor-pointer"
                        >
                            <div className="relative h-full border rounded-[1.8rem] p-6 transition-all group-hover:shadow-2xl overflow-hidden" 
                                 style={{ 
                                     background: 'var(--wapixo-bg-alt)', 
                                     borderColor: isUserRole ? '#B85C5C' : 'var(--wapixo-border)',
                                     boxShadow: theme === 'dark' ? 'none' : '0 10px 30px rgba(0,0,0,0.02)'
                                 }}
                            >
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity"
                                    style={{ background: panel.color }}
                                />

                                <div className="flex justify-between items-center mb-6">
                                    <div
                                        className="p-3 rounded-2xl"
                                        style={{ background: `${panel.color}15`, color: panel.color }}
                                    >
                                        <panel.icon size={24} />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full" 
                                          style={{ background: isUserRole ? '#B85C5C' : 'var(--wapixo-border)', color: isUserRole ? 'white' : 'var(--wapixo-text-muted)' }}>
                                        {isUserRole ? 'Verified' : panel.role.replace('_', ' ')}
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold mb-2 group-hover:text-[#B85C5C] transition-colors" style={{ color: 'var(--wapixo-text)' }}>{panel.name}</h2>
                                <p className="text-[12px] leading-relaxed mb-6 font-medium line-clamp-2" style={{ color: 'var(--wapixo-text-muted)' }}>
                                    {panel.desc}
                                </p>

                                <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.1em] transform translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
                                     style={{ color: '#B85C5C' }}>
                                    Initialize Session <ArrowRight size={12} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <footer className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 border-t flex flex-col md:flex-row justify-between items-center gap-4 opacity-30" style={{ borderColor: 'var(--wapixo-border)' }}>
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">Integrated Business Intelligence v3.4</p>
                <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em]">
                    <span>Security: Active</span>
                    <span>Link: Optimal</span>
                </div>
            </footer>
        </div>
    );
}
