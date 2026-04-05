import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Save, Layout, Type, Image as ImageIcon, MessageSquare,
    Shield, FileText, Smartphone, Zap, Heart, Target,
    Package, BarChart2, CheckCircle2, AlertCircle, Info,
    Eye, Edit3, Globe, Smartphone as MobileIcon, Search,
    Monitor, RefreshCw
} from 'lucide-react';

// Import Landing Components for Live Preview
import HeroScroll from '../../components/landing/wapixo/HeroScroll';
import Features from '../../components/landing/wapixo/Features';
import WapixoTestimonials from '../../components/landing/wapixo/WapixoTestimonials';

/* ─── CMS Section/Field Mock Data ────────────────────────────────────── */
const INITIAL_CMS_DATA = {
    landing_hero: {
        title: "From Chaos to Command.",
        subtitle: "Using multiple disconnected apps for billing, booking, and staff management leads to data silos and chaos.",
        badge: "THE TRANSITION",
        legacy_label: "LEGACY SYSTEMS",
        standard_label: "THE WAPIXO STANDARD",
        standard_title: "Unified Ecosystem",
        standard_desc: "A single, surgical command center for every aspect of your salon. One platform, zero friction."
    },
    legal_privacy: {
        title: "Privacy Policy",
        last_updated: "February 2026",
        content: "Your privacy is important to us. This policy explains how we collect, use, and protect your data..."
    },
    legal_terms: {
        title: "Terms of Service",
        last_updated: "February 2026",
        content: "By using Wapixo, you agree to these legal terms and conditions..."
    },
    legal_cookies: {
        title: "Cookie Policy",
        last_updated: "February 2026",
        content: "We use cookies to enhance your experience and analyze platform performance..."
    },
    contact_page: {
        title: "Get in Touch",
        subtitle: "Have questions about our enterprise solutions? Our experts are ready to assist.",
        address: "DLF Cyber City, Tower 8, Gurugram, India",
        email: "solutions@wapixo.io",
        phone: "+91 999 888 7766"
    },
    landing_testimonials: [
        { id: 1, name: "Claudia Alves", role: "CEO, ARTISTRY STUDIO", content: "Wapixo has completely transformed how we manage our multi-outlet salon. The precision in billing and the depth of analytics is unmatched in the industry.", stars: 5 },
        { id: 2, name: "Priya Sharma", role: "DIRECTOR, URBAN GLOSS", content: "The WhatsApp automation and smart scheduling have reduced our no-shows by 40%. It is not just a software; it is a growth partner for our business.", stars: 5 },
        { id: 3, name: "Rahul Varma", role: "FOUNDER, ELITE SCISSORS", content: "Managing inventory across 10 locations was a nightmare before Wapixo. Now, everything is synchronized with surgical precision.", stars: 5 }
    ],
    landing_features: [
        { id: 1, title: "Smart Booking", desc: "Real-time scheduling with zero conflicts. Your clients book 24/7." },
        { id: 2, title: "Advanced Analytics", desc: "Revenue insights, peak hours, and growth metrics at a glance." },
        { id: 3, title: "Client Management", desc: "Complete client histories, preferences, and loyalty tracking." },
        { id: 4, title: "Loyalty Engine", desc: "Automated rewards and referral programs that retain clients." },
        { id: 5, title: "Staff Scheduling", desc: "Shift management, commissions, and performance tracking." },
        { id: 6, title: "Multi-Outlet", desc: "Manage every branch from one powerful dashboard." }
    ]
};

const CMS_TABS = [
    { id: 'landing', label: 'Landing Page', icon: Layout },
    { id: 'legal', label: 'Legal Pages', icon: Shield },
    { id: 'contact', label: 'Contact Page', icon: MessageSquare },
];

export default function SACMSPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('landing');
    const [data, setData] = useState(INITIAL_CMS_DATA);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchCMSData();
    }, []);

    const fetchCMSData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cms');
            if (response.data && Object.keys(response.data).length > 0) {
                setData(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error('Error fetching CMS data:', error);
            showToast("Error loading content");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save all sections that are currently in 'data'
            const promises = Object.entries(data).map(([section, content]) => 
                api.patch(`/cms/${section}`, { content })
            );
            await Promise.all(promises);
            showToast("Public content updated successfully!");
        } catch (error) {
            console.error('Error saving CMS data:', error);
            showToast("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (page, field, value) => {
        setData(prev => ({
            ...prev,
            [page]: {
                ...prev[page],
                [field]: value
            }
        }));
    };

    const renderInput = (page, field, label, type = 'text') => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    className="w-full bg-surface border border-border p-3 text-sm focus:border-primary outline-none transition-colors min-h-[100px]"
                    value={data[page][field]}
                    onChange={(e) => updateField(page, field, e.target.value)}
                />
            ) : (
                <input
                    className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                    value={data[page][field]}
                    onChange={(e) => updateField(page, field, e.target.value)}
                />
            )}
        </div>
    );

    return (
        <div className="space-y-6 pb-20 sa-panel">
            {/* Toast feedback */}
            {toast && (
                <div className="fixed top-20 right-8 bg-primary text-white px-6 py-3 shadow-2xl z-[100] flex items-center gap-3 animate-in slide-in-from-right-10 duration-500">
                    <CheckCircle2 size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">{toast}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter">WEBSITE <span className="text-primary">EDITOR</span></h1>
                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-[0.2em] mt-1">Change your website text and legal pages</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-surface border border-border text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2">
                        <Eye size={14} /> Preview Site
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><Save size={14} /> Save Global Changes</>}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border text-center overflow-x-auto">
                {CMS_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative whitespace-nowrap
                            ${activeTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text'}
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary" />}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8 relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}
                {/* Editor Area */}
                <div className="col-span-1 md:col-span-7 space-y-12">

                    {activeTab === 'landing' && (
                        <div className="space-y-12">
                            {/* Hero & Transition Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                        <Type size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Website Introduction</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border regular-radius">
                                    {renderInput('landing_hero', 'badge', 'Small Legend / Badge')}
                                    {renderInput('landing_hero', 'title', 'Main Headline')}
                                    {renderInput('landing_hero', 'subtitle', 'Sub-Headline / Narrative', 'textarea')}

                                    <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                                        {renderInput('landing_hero', 'legacy_label', 'Left Label (Legacy)')}
                                        {renderInput('landing_hero', 'standard_label', 'Right Label (Standard)')}
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {renderInput('landing_hero', 'standard_title', 'Box: Feature Title')}
                                        {renderInput('landing_hero', 'standard_desc', 'Box: Feature Description', 'textarea')}
                                    </div>
                                </div>
                            </section>

                            {/* Features Grid */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                        <Package size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Key Features</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {data.landing_features.map((feature, idx) => (
                                            <div key={feature.id} className="space-y-4 p-4 border border-border/50 bg-surface/30">
                                                <div className="text-[10px] font-black text-primary uppercase">MODULE 0{idx + 1}</div>
                                                <div className="space-y-3">
                                                    <input
                                                        className="w-full bg-transparent border-b border-border/60 py-1 text-sm font-bold focus:border-primary outline-none"
                                                        value={feature.title}
                                                        onChange={(e) => {
                                                            const newFeatures = [...data.landing_features];
                                                            newFeatures[idx].title = e.target.value;
                                                            setData(prev => ({ ...prev, landing_features: newFeatures }));
                                                        }}
                                                    />
                                                    <textarea
                                                        className="w-full bg-transparent border-b border-border/60 py-1 text-[11px] focus:border-primary outline-none min-h-[60px] resize-none"
                                                        value={feature.desc}
                                                        onChange={(e) => {
                                                            const newFeatures = [...data.landing_features];
                                                            newFeatures[idx].desc = e.target.value;
                                                            setData(prev => ({ ...prev, landing_features: newFeatures }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Testimonials */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                        <Heart size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Customer Reviews</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-8 bg-white p-8 border border-border">
                                    {data.landing_testimonials.map((t, idx) => (
                                        <div key={t.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border border-border bg-surface/20">
                                            <div className="space-y-4">
                                                <div className="text-[10px] font-black text-text-muted uppercase">Identity</div>
                                                <input
                                                    className="w-full bg-white border border-border px-3 py-2 text-xs font-bold outline-none"
                                                    value={t.name}
                                                    onChange={(e) => {
                                                        const newT = [...data.landing_testimonials];
                                                        newT[idx].name = e.target.value;
                                                        setData(prev => ({ ...prev, landing_testimonials: newT }));
                                                    }}
                                                    placeholder="Name"
                                                />
                                                <input
                                                    className="w-full bg-white border border-border px-3 py-2 text-xs outline-none"
                                                    value={t.role}
                                                    onChange={(e) => {
                                                        const newT = [...data.landing_testimonials];
                                                        newT[idx].role = e.target.value;
                                                        setData(prev => ({ ...prev, landing_testimonials: newT }));
                                                    }}
                                                    placeholder="Role / Company"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-text-muted uppercase">Rating:</span>
                                                    <input
                                                        type="number" max="5" min="1"
                                                        className="w-16 bg-white border border-border px-2 py-1 text-xs outline-none"
                                                        value={t.stars}
                                                        onChange={(e) => {
                                                            const newT = [...data.landing_testimonials];
                                                            newT[idx].stars = parseInt(e.target.value);
                                                            setData(prev => ({ ...prev, landing_testimonials: newT }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-4">
                                                <div className="text-[10px] font-black text-text-muted uppercase">Success Story</div>
                                                <textarea
                                                    className="w-full bg-white border border-border p-4 text-xs italic leading-relaxed outline-none min-h-[120px]"
                                                    value={t.content}
                                                    onChange={(e) => {
                                                        const newT = [...data.landing_testimonials];
                                                        newT[idx].content = e.target.value;
                                                        setData(prev => ({ ...prev, landing_testimonials: newT }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'legal' && (
                        <div className="space-y-8">
                            <div className="bg-white p-8 border border-border space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold uppercase tracking-widest text-sm italic">Privacy Policy Configuration</h3>
                                    <div className="text-[10px] font-medium text-text-muted">Last Edit: {data.legal_privacy.last_updated}</div>
                                </div>
                                {renderInput('legal_privacy', 'title', 'Page Title')}
                                {renderInput('legal_privacy', 'content', 'Policy Body Content', 'textarea')}
                            </div>

                            <div className="bg-white p-8 border border-border space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold uppercase tracking-widest text-sm italic">Terms of Service Configuration</h3>
                                    <div className="text-[10px] font-medium text-text-muted">Last Edit: {data.legal_terms.last_updated}</div>
                                </div>
                                {renderInput('legal_terms', 'title', 'Page Title')}
                                {renderInput('legal_terms', 'content', 'Terms Body Content', 'textarea')}
                            </div>

                            <div className="bg-white p-8 border border-border space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold uppercase tracking-widest text-sm italic">Cookie Policy Configuration</h3>
                                    <div className="text-[10px] font-medium text-text-muted">Last Edit: {data.legal_cookies.last_updated}</div>
                                </div>
                                {renderInput('legal_cookies', 'title', 'Page Title')}
                                {renderInput('legal_cookies', 'content', 'Policy Body Content', 'textarea')}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <section className="space-y-6">
                            <div className="bg-white p-8 border border-border space-y-6">
                                {renderInput('contact_page', 'title', 'Hero Headline')}
                                {renderInput('contact_page', 'subtitle', 'Support Instruction Text', 'textarea')}
                                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-border">
                                    {renderInput('contact_page', 'address', 'Physical HQ Address')}
                                    {renderInput('contact_page', 'email', 'Global Support Email')}
                                    {renderInput('contact_page', 'phone', 'Inquiry Hotlines')}
                                </div>
                            </div>
                        </section>
                    )}

                </div>

                {/* Live Preview Pane */}
                <div className="col-span-1 md:col-span-5 relative transition-all duration-700">
                    <div className="sticky top-6 space-y-6">
                        <div className="bg-black text-white p-6 border border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Monitor size={14} className="text-primary" /> Live Preview
                                </h4>
                                <div className="flex gap-2 items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Real-time Sync</span>
                                </div>
                            </div>
                            
                            {/* Preview Window Container */}
                            <div className="bg-[#050505] border border-white/5 rounded-sm overflow-hidden h-[600px] shadow-inner relative group">
                                <div className="absolute top-0 left-0 overflow-y-auto custom-scrollbar scale-[0.5] origin-top-left w-[200%] h-[200%] pb-40">
                                    <div className="new-dark-theme pointer-events-none min-h-full bg-black">
                                        {activeTab === 'landing' && (
                                            <div className="space-y-0 w-full">
                                                {data.landing_hero && <HeroScroll data={data.landing_hero} />}
                                                {data.landing_features && <Features data={data.landing_features} />}
                                                {data.landing_testimonials && <WapixoTestimonials data={data.landing_testimonials} />}
                                            </div>
                                        )}
                                        {activeTab === 'legal' && data.legal_privacy && data.legal_terms && (
                                            <div className="p-16 text-white space-y-12 w-full">
                                                <h1 className="text-5xl font-black italic border-b border-primary pb-4 inline-block">{data.legal_privacy.title}</h1>
                                                <div className="prose prose-invert max-w-none opacity-60 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: data.legal_privacy.content }} />
                                                
                                                <h1 className="text-5xl font-black italic mt-32 border-b border-primary pb-4 inline-block">{data.legal_terms.title}</h1>
                                                <div className="prose prose-invert max-w-none opacity-60 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: data.legal_terms.content }} />
                                            </div>
                                        )}
                                        {activeTab === 'contact' && data.contact_page && (
                                            <div className="p-16 text-white bg-black min-h-screen flex flex-col justify-center items-center text-center w-full">
                                                <span className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mb-4">Enterprise Support</span>
                                                <h2 className="text-6xl font-black italic mb-6 leading-[1.1]">{data.contact_page.title}</h2>
                                                <div className="w-12 h-0.5 bg-primary/40 mb-8" />
                                                <p className="text-lg opacity-50 max-w-xl font-light leading-relaxed mb-12">{data.contact_page.subtitle}</p>
                                                <div className="space-y-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-text-muted uppercase font-black tracking-widest">Global Outreach</p>
                                                        <p className="text-xl font-medium">{data.contact_page.email}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-text-muted uppercase font-black tracking-widest">Inquiry Hotline</p>
                                                        <p className="text-xl font-medium">{data.contact_page.phone}</p>
                                                    </div>
                                                    <div className="pt-6">
                                                        <p className="text-[8px] text-text-muted uppercase font-bold tracking-[0.3em]">{data.contact_page.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Cinematic Vignette Overlay */}
                                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-10" />
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <RefreshCw size={10} className="text-primary animate-spin-slow" />
                                <p className="text-[9px] text-white/30 font-medium italic tracking-tight">
                                    Miniaturized real-time simulation active.
                                </p>
                            </div>
                        </div>

                        {/* Status Stats */}
                        <div className="bg-white border border-border p-5 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Ecosystem Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-emerald-600 tracking-tighter uppercase italic">Secured</span>
                                    <Shield size={10} className="text-emerald-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Sync Latency</p>
                                <p className="text-xs font-bold tracking-tighter italic">0.00ms</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
