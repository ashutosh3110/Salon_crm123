import {
    Settings, Bell, Shield, User,
    Smartphone, Moon, Globe, HelpCircle,
    ChevronRight, LogOut, Lock, Palette
} from 'lucide-react';

const settingsSections = [
    {
        title: 'Account Settings',
        items: [
            { id: 'profile', label: 'Edit Profile', sub: 'Name, email, and photo', icon: User },
            { id: 'security', label: 'Security', sub: 'Password and 2FA', icon: Shield },
            { id: 'notifications', label: 'Notifications', sub: 'How you want to be alerted', icon: Bell },
        ]
    },
    {
        title: 'App Preferences',
        items: [
            { id: 'appearance', label: 'Appearance', sub: 'Dark mode and themes', icon: Palette },
            { id: 'display', label: 'Display Language', sub: 'English (US)', icon: Globe },
            { id: 'devices', label: 'Connected Devices', sub: 'Manage your active sessions', icon: Smartphone },
        ]
    },
    {
        title: 'Support',
        items: [
            { id: 'help', label: 'Help Center', sub: 'FAQs and support guides', icon: HelpCircle },
            { id: 'privacy', label: 'Privacy Policy', sub: 'Data collection and usage', icon: Lock },
        ]
    }
];

export default function ManagerSettingsPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">Control Center</h1>
                <p className="text-sm text-text-muted font-medium">Manage your personal and application preferences</p>
            </div>

            {/* Profile Brief */}
            <div className="bg-primary rounded-none p-6 text-white flex flex-col sm:flex-row items-center gap-6 shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
                <div className="relative w-20 h-20 rounded-none bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/20 shadow-lg">
                    AS
                </div>
                <div className="flex-1 text-center sm:text-left relative">
                    <h2 className="text-xl font-black tracking-tight leading-none">Ananya Sharma</h2>
                    <p className="text-white/70 text-sm mt-1.5 font-bold uppercase tracking-widest">Operations Manager</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                        <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-none border border-white/10 text-[10px] font-black uppercase tracking-widest">Store #42</div>
                        <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-none border border-white/10 text-[10px] font-black uppercase tracking-widest">Premium Member</div>
                    </div>
                </div>
                <button className="relative px-5 py-2.5 bg-white text-primary rounded-none text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">
                    View Public Profile
                </button>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {settingsSections.map((section) => (
                    <div key={section.title} className="space-y-3">
                        <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">{section.title}</h2>
                        <div className="bg-white rounded-none border border-border/60 overflow-hidden shadow-none divide-y divide-border/40">
                            {section.items.map((item) => (
                                <button key={item.id} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-surface-alt transition-colors text-left group">
                                    <div className="flex items-center gap-4">
                                        <div className="shrink-0 group-hover:scale-110 transition-transform">
                                            <item.icon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text mb-0.5">{item.label}</p>
                                            <p className="text-[11px] text-text-muted font-medium">{item.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Logout */}
            <div className="pt-4">
                <button className="w-full bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-500 rounded-none p-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]">
                    <LogOut className="w-4 h-4" /> Sign Out from Everywhere
                </button>
                <p className="text-center text-[10px] text-text-muted mt-4 font-black uppercase tracking-widest opacity-40">Salon CRM v2.4.0-stable</p>
            </div>
        </div>
    );
}
