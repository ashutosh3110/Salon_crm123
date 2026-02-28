import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, User, ShieldCheck, Scissors,
    Calculator, Box, CreditCard, Smartphone,
    Crown, Sparkles, ArrowRight, LogOut, Globe
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
        color: '#FFFFFF',
        role: 'superadmin'
    }
];

export default function PanelLaunchpad() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 selection:bg-[#C8956C]/30">
            {/* Ambient background blur */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C8956C]/10 blur-[120px] rounded-full"
                />
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#A06844]/5 blur-[120px] rounded-full"
                />
            </div>

            <nav className="relative z-20 max-w-7xl mx-auto flex justify-between items-center mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex items-center gap-2"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8956C]">Wapixo Ecosystem</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex justify-center"
                >
                    <img
                        src="/1-removebg-preview.png"
                        alt="Logo"
                        className="h-16 md:h-28 w-auto object-contain brightness-110 contrast-125 hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => navigate('/')}
                    />
                </motion.div>

                <div className="flex-1 flex items-center justify-end gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                        title="Website Home"
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
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg border border-red-500/20 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
                        >
                            <LogOut size={12} />
                            Logout
                        </motion.button>
                    )}
                </div>
            </nav>

            <header className="relative z-10 max-w-7xl mx-auto mb-10">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-5xl font-black italic tracking-tighter"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Management <span className="text-[#C8956C]">Portals</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/40 mt-2 text-xs font-medium max-w-md"
                >
                    Central launchpad for all specialized modules.
                </motion.p>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-16">
                {PANELS.map((panel, i) => {
                    const isUserRole = user?.role === panel.role;
                    return (
                        <motion.div
                            key={panel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (i * 0.05) }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => {
                                if (panel.role === 'customer') {
                                    navigate('/app/login');
                                } else {
                                    navigate(`/login?role=${panel.role}`);
                                }
                            }}
                            className="group relative cursor-pointer"
                        >
                            {/* Role Match Highlight */}
                            {isUserRole && (
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#C8956C] to-[#A06844] rounded-[1.5rem] animate-pulse blur-[1px] opacity-40" />
                            )}

                            <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-[#C8956C]/10 to-transparent rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative h-full bg-[#111] border border-white/5 rounded-[1.2rem] p-4 transition-colors group-hover:bg-[#161616] overflow-hidden">
                                <div
                                    className="absolute top-0 right-0 w-20 h-20 blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity"
                                    style={{ background: panel.color }}
                                />

                                <div className="flex justify-between items-start mb-3">
                                    <div
                                        className="transition-colors bg-transparent border-none p-0"
                                        style={{ color: panel.color, background: 'transparent' }}
                                    >
                                        <panel.icon size={20} />
                                    </div>
                                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${isUserRole ? 'bg-[#C8956C] text-black' : 'bg-white/10 text-white/50'}`}>
                                        {isUserRole ? 'Access' : panel.role.replace('_', ' ')}
                                    </span>
                                </div>

                                <h2 className="text-base font-bold mb-1 group-hover:text-[#C8956C] transition-white transition-colors">{panel.name}</h2>
                                <p className="text-white/60 text-[11px] leading-snug mb-3 font-medium line-clamp-2">
                                    {panel.desc}
                                </p>

                                <div className="flex items-center gap-1.5 text-[#C8956C] font-black text-[9px] uppercase tracking-[0.1em] transform translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    Launch Portal <ArrowRight size={10} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <footer className="relative z-10 max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-20 pb-8">
                <p className="text-[8px] font-black uppercase tracking-[0.4em]">Integrated Beauty Systems v2.0</p>
                <div className="flex gap-6 text-[8px] font-black uppercase tracking-[0.2em]">
                    <span>Security Verified</span>
                    <span>Status: Optimal</span>
                </div>
            </footer>
        </div>
    );
}
