import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, Layout, Type, Image as ImageIcon, MessageSquare,
    Shield, FileText, Smartphone, Zap, Heart, Target,
    Package, BarChart2, CheckCircle2, AlertCircle, Info,
    Eye, Edit3, Globe, Smartphone as MobileIcon, Search
} from 'lucide-react';

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
    landing_vision: {
        badge: "THE VISION",
        title: "Defined by Artists. Driven by Data.",
        body: "Wapixo isn't just a management tool—it's a symphony of efficiency. We understand the heartbeat of the beauty industry, from the precision of a cut to the complexity of a multi-outlet empire.",
        quote: "Our platform empowers owners to reclaim their time and creators to focus on their craft. With over 50,000 monthly appointments handled with surgical precision, we are the silent engine behind India's most successful salons.",
        trusted_label: "TRUSTED BY",
        trusted_value: "500+ Salons"
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
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        showToast("Public content updated successfully!");
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
                    <h1 className="text-2xl font-black italic tracking-tighter">LANDING <span className="text-primary">CMS</span></h1>
                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-[0.2em] mt-1">Manage public-facing narratives and legal protocols</p>
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
                        {saving ? 'Transmitting...' : <><Save size={14} /> Save Global Changes</>}
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

            <div className="grid grid-cols-12 gap-8 mt-8">
                {/* Editor Area */}
                <div className="col-span-12 lg:col-span-7 space-y-12">

                    {activeTab === 'landing' && (
                        <div className="space-y-12">
                            {/* Hero & Transition Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                        <Type size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">The Transition Section</h2>
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

                            {/* Vision Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                        <ImageIcon size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">The Vision & Quality</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    {renderInput('landing_vision', 'badge', 'Legend Badge')}
                                    {renderInput('landing_vision', 'title', 'Cinematic Headline')}
                                    {renderInput('landing_vision', 'body', 'Main Body Text', 'textarea')}
                                    {renderInput('landing_vision', 'quote', 'Secondary Vision Quote', 'textarea')}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                        {renderInput('landing_vision', 'trusted_label', 'Trust Label')}
                                        {renderInput('landing_vision', 'trusted_value', 'Trust Value')}
                                    </div>
                                </div>
                            </section>

                            {/* Features Grid */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                        <Package size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Core Platform Modules</h2>
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
                                    <h2 className="text-lg font-bold tracking-tight">Voices of Excellence (Testimonials)</h2>
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

                {/* Sidebar Helper / Guideline */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="bg-black text-white p-8">
                        <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] mb-6">
                            <Info size={16} className="text-primary" /> System Guidelines
                        </h4>
                        <ul className="space-y-6 text-[11px] leading-relaxed font-medium opacity-80">
                            <li className="flex gap-4">
                                <span className="text-primary font-black">01.</span>
                                <span>All headline changes are reflected instantly across the public ecosystem upon saving.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-primary font-black">02.</span>
                                <span>Use semantic HTML in textarea fields if complex formatting like bold or bullet points is required.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-primary font-black">03.</span>
                                <span>Ensure cinematic quality of copy. Avoid generic marketing jargon to maintain the Wapixo brand voice.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white border border-border p-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <MobileIcon size={16} /> Public Status
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-border text-[11px]">
                                <span className="font-bold text-text-muted tracking-widest uppercase">Ecosystem SSL</span>
                                <span className="text-emerald-500 font-bold tracking-widest italic">ENCRYPTED</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-border text-[11px]">
                                <span className="font-bold text-text-muted tracking-widest uppercase">Global Reach</span>
                                <span className="text-text font-bold tracking-widest italic">ACTIVE</span>
                            </div>
                            <div className="flex items-center justify-between py-3 text-[11px]">
                                <span className="font-bold text-text-muted tracking-widest uppercase">Sync Latency</span>
                                <span className="text-text font-bold tracking-widest italic">0.02ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
