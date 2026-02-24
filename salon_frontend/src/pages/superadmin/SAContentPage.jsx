import { useState, useEffect } from 'react';
import {
    FileText, Image, MessageSquare, HelpCircle, LayoutDashboard,
    BookOpen, Shield, Cookie, ScrollText, ChevronRight, ChevronDown,
    Save, RotateCcw, Eye, Plus, Trash2, Check, X, Upload,
    Edit3, AlertTriangle, Star, ExternalLink, Sparkles,
} from 'lucide-react';


/* ─── Default content (mirrors the actual components) ─────────────────── */
const DEFAULT_CONTENT = {
    hero: {
        heading: 'Elevate Your Salon',
        subheading: 'Smarter, Faster.',
        description: 'The ultimate toolkit for modern salon scaling. Manage appointments, billing, and analytics with cinematic efficiency.',
        btn_primary: 'Get Started Free',
        btn_secondary: 'Learn More',
        stat1_value: '500+', stat1_label: 'Salons',
        stat2_value: '50K+', stat2_label: 'Bookings',
        stat3_value: '99.9%', stat3_label: 'Uptime',
    },
    about: {
        badge: 'Why SalonCRM',
        heading: 'Built by Salon Experts, For Salon Owners',
        para1: 'We understand the unique challenges of running a salon business. From managing walk-ins to tracking product inventory, from retaining clients to growing revenue — SalonCRM handles it all so you can focus on what you do best: making people look amazing.',
        para2: 'Trusted by 500+ salons across India, our platform processes over 50,000 appointments every month with 99.9% uptime.',
        values: [
            { title: 'Lightning Fast', desc: 'Optimized for speed so your reception never waits. POS billing in under 10 seconds.', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800' },
            { title: 'Enterprise Security', desc: 'Bank-grade encryption, role-based access, and complete data isolation per salon.', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' },
            { title: 'Built for Salons', desc: 'Not a generic tool. Every feature is designed specifically for the beauty industry.', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800' },
            { title: 'Cloud Native', desc: 'Access from anywhere — desktop, tablet, or phone. No installations, no limits.', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' },
        ],
    },
    features: [
        { id: 1, title: 'Client & CRM', desc: 'Complete client profiles, visit history, preferences, tags, and non-returning customer detection.', image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800' },
        { id: 2, title: 'Booking & Scheduling', desc: 'Calendar view, staff allocation, walk-in queue, and automated WhatsApp/SMS reminders.', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800' },
        { id: 3, title: 'POS & Billing', desc: 'Fast reception billing with packages, discounts, gift vouchers, and split payments.', image: 'https://images.unsplash.com/photo-1556742049-02e536952199?auto=format&fit=crop&q=80&w=800' },
        { id: 4, title: 'Loyalty & Referrals', desc: 'Points earn/redeem system, referral tracking, discount combos, and bundled offerings.', image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=800' },
        { id: 5, title: 'Inventory Management', desc: 'Barcode support, outlet-wise stock tracking, low-stock alerts, and audit tools.', image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=800' },
        { id: 6, title: 'Analytics & Reports', desc: 'Revenue, profit, employee, outlet-wise analytics with automated day-end reports.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
        { id: 7, title: 'HR & Payroll', desc: 'Attendance, shifts, commissions, targets, automated payroll, and performance tracking.', image: 'https://images.unsplash.com/photo-1521737706135-627b747ad584?auto=format&fit=crop&q=80&w=800' },
        { id: 8, title: 'Multi-Outlet', desc: 'Manage multiple salon branches from a single dashboard with outlet-level controls.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' },
        { id: 9, title: 'Automation', desc: 'Automated reminders, due-payment alerts, and template-based messaging workflows.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' },
        { id: 10, title: 'Marketing', desc: 'WhatsApp campaigns, email newsletters, social media sharing of offers and bookings.', image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&q=80&w=800' },
        { id: 11, title: 'Role-Based Access', desc: '8 user roles from Owner to Stylist with granular feature-level permissions.', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=800' },
        { id: 12, title: 'Retail Sales', desc: 'In-salon product sales with POS integration, auto stock sync, and combined invoicing.', image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=800' },
    ],
    faqs: [
        { id: 1, question: 'How does the 14-day free trial work?', answer: 'You get full access to all SalonCRM features for 14 days. No credit card is required to start.' },
        { id: 2, question: 'Can I manage multiple salon locations?', answer: 'Yes! SalonCRM is designed for growth. You can easily add and manage multiple outlets from a single dashboard.' },
        { id: 3, question: 'Is my customer data secure?', answer: 'Absolutely. We use industry-standard encryption and secure cloud servers to ensure your data is always protected.' },
        { id: 4, question: 'Can I migrate my data from another software?', answer: 'We offer free data migration assistance. Our team will help you import your existing data safely.' },
        { id: 5, question: 'Does SalonCRM work on mobile devices?', answer: 'Yes, SalonCRM is fully responsive and works perfectly on tablets and smartphones.' },
    ],
    testimonials: [
        { id: 1, name: 'Claudia Alves', content: 'Thank you very much! An amazing job that exceeded all my expectations!', stars: 5, image: 'https://i.pravatar.cc/150?u=claudia', status: 'approved' },
        { id: 2, name: 'Priya Sharma', content: 'Managing our salon became so much easier after switching to SalonCRM.', stars: 5, image: 'https://i.pravatar.cc/150?u=priya', status: 'approved' },
        { id: 3, name: 'Rahul Varma', content: 'The inventory management and staff performance tracking has helped us increase our revenue by 25%.', stars: 5, image: 'https://i.pravatar.cc/150?u=rahul', status: 'pending' },
    ],
    blog: [
        { id: 1, category: 'Growth', title: 'How to Scale Your Salon to Multiple Outlets', excerpt: 'Learn the essential strategies for managing operations across different locations.', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', date: 'Feb 15, 2026' },
        { id: 2, category: 'Marketing', title: 'Automated WhatsApp Marketing for Beauty Businesses', excerpt: 'Discover how automated reminders and campaigns can increase your booking rate by up to 40%.', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800', date: 'Feb 10, 2026' },
        { id: 3, category: 'Operations', title: 'The Future of POS in the Salon Industry', excerpt: 'Why traditional billing is dead and how modern cloud-based systems are changing the game.', image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800', date: 'Feb 05, 2026' },
    ],
    legal: {
        privacy: { title: 'Privacy Policy', content: 'Your privacy is important to us. This policy explains how we collect, use, and protect your information...', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800' },
        terms: { title: 'Terms of Service', content: 'By accessing and using SalonCRM, you accept and agree to be bound by the terms and provisions of this agreement...', image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&q=80&w=800' },
        cookies: { title: 'Cookie Policy', content: 'We use cookies to enhance your experience. Cookies are small data files stored on your device...', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800' },
    },
    specialOffers: {
        heading: 'Special Beauty',
        heading_italic: 'Offers.',
        description: 'Unlock radiant transformations with our Special Beauty Offers tailored packages designed to pamper, enhance, and elevate your natural beauty.',
        btn_label: 'View Packages',
        images: [
            { id: 1, url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800' },
            { id: 2, url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800' },
            { id: 3, url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800' },
            { id: 4, url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800' },
            { id: 5, url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800' },
            { id: 6, url: 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=800' },
        ]
    },
    gallery: {
        heading: 'Experience the',
        heading_accent: 'Power',
        heading_suffix: 'of SalonCRM',
        description: 'Explore our comprehensive suite of tools designed to streamline every aspect of your salon operations.',
        items: [
            { id: 1, title: 'Client Management', desc: 'Secure database for all your customer relationships.', image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800' },
            { id: 2, title: 'Smart Scheduling', desc: 'AI-powered booking system for maximum efficiency.', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800' },
            { id: 3, title: 'Inventory Sync', desc: 'Real-time stock tracking across all locations.', image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=800' },
            { id: 4, title: 'Analytics Pro', desc: 'Deep insights into your business growth.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
            { id: 5, title: 'Point of Sale', desc: 'Lightning fast checkout experience.', image: 'https://images.unsplash.com/photo-1556742049-02e536952199?auto=format&fit=crop&q=80&w=800' },
            { id: 6, title: 'Marketing Tools', desc: 'Automated campaigns for client retention.', image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=800' },
            { id: 7, title: 'HR & Payroll', desc: 'Attendance, shifts, and target management.', image: 'https://images.unsplash.com/photo-1521737706135-627b747ad584?auto=format&fit=crop&q=80&w=800' },
            { id: 8, title: 'Multi-Outlet', desc: 'Scale your business across multiple locations.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' },
            { id: 9, title: 'Automation', desc: 'Smart workflows for reminders and follow-ups.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' },
            { id: 10, title: 'Retail Sales', desc: 'Boost revenue with integrated product sales.', image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=800' },
            { id: 11, title: 'Security & Roles', desc: 'Enterprise-grade permissions and data safety.', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=800' },
            { id: 12, title: 'Customer Loyalty', desc: 'Reward and retain your best clients.', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800' },
        ]
    }
};



/* ─── Helpers ─────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'sa_content_manager_v1';

function loadContent() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return DEFAULT_CONTENT;
        const parsed = JSON.parse(saved);
        // Deep-ish merge to ensure new sections exist
        return {
            ...DEFAULT_CONTENT,
            ...parsed,
            hero: { ...DEFAULT_CONTENT.hero, ...(parsed.hero || {}) },
            about: { ...DEFAULT_CONTENT.about, ...(parsed.about || {}) },
            legal: { ...DEFAULT_CONTENT.legal, ...(parsed.legal || {}) },
            specialOffers: { ...DEFAULT_CONTENT.specialOffers, ...(parsed.specialOffers || {}) },
            gallery: { ...DEFAULT_CONTENT.gallery, ...(parsed.gallery || {}) },
        };
    } catch { return DEFAULT_CONTENT; }
}

function saveContent(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ─── UI atoms ────────────────────────────────────────────────────────── */
function SectionHeader({ title, subtitle, children }) {
    return (
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-border">
            <div>
                <h3 className="text-lg font-black text-text">{title}</h3>
                {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex gap-2">{children}</div>
        </div>
    );
}

function Field({ label, value, onChange, type = 'text', rows = 3 }) {
    return (
        <div className="mb-4">
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={rows}
                    className="w-full text-sm px-3 py-2 border border-border bg-white text-text focus:outline-none focus:border-primary resize-none transition-colors"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border bg-white text-text focus:outline-none focus:border-primary transition-colors"
                />
            )}
        </div>
    );
}

function ImageField({ label, value, onChange }) {
    const [preview, setPreview] = useState(value);
    const handleChange = (v) => { setPreview(v); onChange(v); };
    return (
        <div className="mb-4">
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={e => handleChange(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-sm px-3 py-2 border border-border bg-white text-text focus:outline-none focus:border-primary transition-colors"
                />
            </div>
            {preview && (
                <div className="mt-2 relative">
                    <img src={preview} alt="preview" className="h-24 w-full object-cover border border-border"
                        onError={() => setPreview('')} />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Image className="w-6 h-6 text-white" />
                    </div>
                </div>
            )}
        </div>
    );
}

function Btn({ children, onClick, variant = 'primary', size = 'sm', className = '' }) {
    const base = 'inline-flex items-center gap-1.5 font-bold transition-all';
    const sizeClass = size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-5 py-2.5';
    const variantClass = {
        primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm',
        ghost: 'bg-surface text-text-secondary hover:bg-border hover:text-text border border-border',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
        success: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
    }[variant];
    return <button onClick={onClick} className={`${base} ${sizeClass} ${variantClass} ${className}`}>{children}</button>;
}

function Toast({ msg, onDone }) {
    useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-[999] bg-gray-900 text-white text-sm font-bold px-5 py-3 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
            <Check className="w-4 h-4 text-emerald-400" /> {msg}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  SECTION EDITORS                                                         */
/* ═══════════════════════════════════════════════════════════════════════ */

function HeroEditor({ data, onChange }) {
    const set = (key) => (val) => onChange({ ...data, [key]: val });
    return (
        <div>
            <SectionHeader title="Hero Section" subtitle="Landing page main banner text & CTA buttons" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                    <Field label="Main Heading" value={data.heading} onChange={set('heading')} />
                    <Field label="Sub Heading" value={data.subheading} onChange={set('subheading')} />
                    <Field label="Description" value={data.description} onChange={set('description')} type="textarea" rows={3} />
                </div>
                <div>
                    <Field label="Primary Button Text" value={data.btn_primary} onChange={set('btn_primary')} />
                    <Field label="Secondary Button Text" value={data.btn_secondary} onChange={set('btn_secondary')} />
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Field label="Stat 1 Value" value={data.stat1_value} onChange={set('stat1_value')} />
                            <Field label="Stat 1 Label" value={data.stat1_label} onChange={set('stat1_label')} />
                        </div>
                        <div>
                            <Field label="Stat 2 Value" value={data.stat2_value} onChange={set('stat2_value')} />
                            <Field label="Stat 2 Label" value={data.stat2_label} onChange={set('stat2_label')} />
                        </div>
                        <div>
                            <Field label="Stat 3 Value" value={data.stat3_value} onChange={set('stat3_value')} />
                            <Field label="Stat 3 Label" value={data.stat3_label} onChange={set('stat3_label')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AboutEditor({ data, onChange }) {
    const set = (key) => (val) => onChange({ ...data, [key]: val });
    const setVal = (idx, key) => (val) => {
        const vals = [...data.values];
        vals[idx] = { ...vals[idx], [key]: val };
        onChange({ ...data, values: vals });
    };
    return (
        <div>
            <SectionHeader title="About / Why Us Section" subtitle="Left content + 4 value cards with hover images" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                    <Field label="Badge Text" value={data.badge} onChange={set('badge')} />
                    <Field label="Heading" value={data.heading} onChange={set('heading')} />
                    <Field label="Paragraph 1" value={data.para1} onChange={set('para1')} type="textarea" rows={4} />
                    <Field label="Paragraph 2" value={data.para2} onChange={set('para2')} type="textarea" rows={3} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Value Cards (hover images)</p>
                    <div className="space-y-4">
                        {data.values.map((v, i) => (
                            <div key={i} className="border border-border p-3 bg-surface/30">
                                <p className="text-xs font-black text-text mb-2">Card {i + 1}: {v.title}</p>
                                <Field label="Title" value={v.title} onChange={setVal(i, 'title')} />
                                <Field label="Description" value={v.desc} onChange={setVal(i, 'desc')} type="textarea" rows={2} />
                                <ImageField label="Hover Image URL" value={v.image} onChange={setVal(i, 'image')} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeaturesEditor({ data, onChange }) {
    const setItem = (idx, key) => (val) => {
        const items = [...data];
        items[idx] = { ...items[idx], [key]: val };
        onChange(items);
    };
    const addItem = () => onChange([...data, { id: Date.now(), title: 'New Feature', desc: 'Description here.', image: '' }]);
    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    return (
        <div>
            <SectionHeader title="Features / Gallery Grid" subtitle="Feature cards shown in the bento gallery grid">
                <Btn onClick={addItem} variant="ghost"><Plus className="w-3.5 h-3.5" /> Add Feature</Btn>
            </SectionHeader>
            <div className="space-y-4">
                {data.map((f, i) => (
                    <div key={f.id} className="border border-border p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-text-muted uppercase">Feature {i + 1}</span>
                            <Btn onClick={() => removeItem(i)} variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" /></Btn>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Title" value={f.title} onChange={setItem(i, 'title')} />
                            <div className="md:col-span-2">
                                <Field label="Description" value={f.desc} onChange={setItem(i, 'desc')} type="textarea" rows={2} />
                            </div>
                        </div>
                        <ImageField label="Gallery Image URL" value={f.image} onChange={setItem(i, 'image')} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function FAQEditor({ data, onChange }) {
    const setItem = (idx, key) => (val) => {
        const items = [...data];
        items[idx] = { ...items[idx], [key]: val };
        onChange(items);
    };
    const addItem = () => onChange([...data, { id: Date.now(), question: 'New Question?', answer: 'Answer here.' }]);
    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    return (
        <div>
            <SectionHeader title="FAQ Section" subtitle="Accordion questions and answers on the landing page">
                <Btn onClick={addItem} variant="ghost"><Plus className="w-3.5 h-3.5" /> Add FAQ</Btn>
            </SectionHeader>
            <div className="space-y-3">
                {data.map((faq, i) => (
                    <div key={faq.id} className="border border-border bg-white">
                        <div className="flex items-start gap-3 p-4">
                            <span className="shrink-0 w-6 h-6 bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center mt-0.5">
                                {i + 1}
                            </span>
                            <div className="flex-1 space-y-2">
                                <Field label="Question" value={faq.question} onChange={setItem(i, 'question')} />
                                <Field label="Answer" value={faq.answer} onChange={setItem(i, 'answer')} type="textarea" rows={2} />
                            </div>
                            <Btn onClick={() => removeItem(i)} variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" /></Btn>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TestimonialsEditor({ data, onChange }) {
    const setItem = (idx, key) => (val) => {
        const items = [...data];
        items[idx] = { ...items[idx], [key]: val };
        onChange(items);
    };
    const approve = (idx) => setItem(idx, 'status')('approved');
    const reject = (idx) => setItem(idx, 'status')('rejected');
    const addItem = () => onChange([...data, { id: Date.now(), name: 'New User', content: 'Great product!', stars: 5, image: 'https://i.pravatar.cc/150?u=new', status: 'pending' }]);
    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    const statusBadge = { approved: 'bg-emerald-50 text-emerald-700 border-emerald-200', pending: 'bg-amber-50 text-amber-700 border-amber-200', rejected: 'bg-red-50 text-red-600 border-red-200' };

    return (
        <div>
            <SectionHeader title="Testimonials" subtitle="Approve, edit, or add customer testimonials">
                <Btn onClick={addItem} variant="ghost"><Plus className="w-3.5 h-3.5" /> Add</Btn>
            </SectionHeader>

            {/* Status legend */}
            <div className="flex gap-3 mb-5 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400" />Approved (visible)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400" />Pending (hidden)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400" />Rejected (hidden)</span>
            </div>

            <div className="space-y-4">
                {data.map((t, i) => (
                    <div key={t.id} className="border border-border bg-white">
                        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <img src={t.image} alt={t.name} className="w-8 h-8 object-cover border border-border" onError={e => e.target.src = 'https://i.pravatar.cc/150'} />
                                <div>
                                    <div className="text-sm font-black text-text">{t.name}</div>
                                    <div className="flex gap-0.5">{[...Array(5)].map((_, s) => (
                                        <Star key={s} className={`w-3 h-3 ${s < t.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                    ))}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 border ${statusBadge[t.status] || statusBadge.pending}`}>
                                    {t.status?.toUpperCase() || 'PENDING'}
                                </span>
                                {t.status !== 'approved' && <Btn onClick={() => approve(i)} variant="success" size="sm"><Check className="w-3.5 h-3.5" /> Approve</Btn>}
                                {t.status !== 'rejected' && <Btn onClick={() => reject(i)} variant="danger" size="sm"><X className="w-3.5 h-3.5" /> Reject</Btn>}
                                <Btn onClick={() => removeItem(i)} variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" /></Btn>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Field label="Name" value={t.name} onChange={setItem(i, 'name')} />
                                <Field label="Review" value={t.content} onChange={setItem(i, 'content')} type="textarea" rows={3} />
                                <div className="mb-4">
                                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Stars (1–5)</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} onClick={() => setItem(i, 'stars')(s)}
                                                className={`w-7 h-7 flex items-center justify-center border transition-colors ${t.stars >= s ? 'border-amber-400 bg-amber-50' : 'border-border'}`}>
                                                <Star className={`w-4 h-4 ${t.stars >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <ImageField label="Avatar Image URL" value={t.image} onChange={setItem(i, 'image')} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BlogEditor({ data, onChange }) {
    const setItem = (idx, key) => (val) => {
        const items = [...data];
        items[idx] = { ...items[idx], [key]: val };
        onChange(items);
    };
    const addItem = () => onChange([...data, { id: Date.now(), category: 'Tips', title: 'New Blog Post', excerpt: 'Blog excerpt...', image: '', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }]);
    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    return (
        <div>
            <SectionHeader title="Blog Posts" subtitle="Manage blog card content and images on the blog page">
                <Btn onClick={addItem} variant="ghost"><Plus className="w-3.5 h-3.5" /> Add Post</Btn>
            </SectionHeader>
            <div className="space-y-4">
                {data.map((post, i) => (
                    <div key={post.id} className="border border-border bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-text-muted uppercase">Post {i + 1}</span>
                            <Btn onClick={() => removeItem(i)} variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" /></Btn>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Field label="Category" value={post.category} onChange={setItem(i, 'category')} />
                                <Field label="Title" value={post.title} onChange={setItem(i, 'title')} />
                                <Field label="Date" value={post.date} onChange={setItem(i, 'date')} />
                                <Field label="Excerpt" value={post.excerpt} onChange={setItem(i, 'excerpt')} type="textarea" rows={3} />
                            </div>
                            <ImageField label="Cover Image URL" value={post.image} onChange={setItem(i, 'image')} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GalleryEditor({ data, onChange }) {
    const set = (key) => (val) => onChange({ ...data, [key]: val });
    const setItem = (idx, key) => (val) => {
        const items = [...data.items];
        items[idx] = { ...items[idx], [key]: val };
        onChange({ ...data, items });
    };
    const addItem = () => onChange({ ...data, items: [...data.items, { id: Date.now(), title: 'New Item', desc: 'Description', image: '' }] });
    const removeItem = (idx) => onChange({ ...data, items: data.items.filter((_, i) => i !== idx) });

    return (
        <div>
            <SectionHeader title="Feature Gallery (Experience the Power)" subtitle="Manage the bento grid titles and layout at the bottom">
                <Btn onClick={addItem} variant="ghost"><Plus className="w-3.5 h-3.5" /> Add Tile</Btn>
            </SectionHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-8 border-b border-border pb-6">
                <div className="space-y-4">
                    <Field label="Heading (Before Accent)" value={data.heading} onChange={set('heading')} />
                    <Field label="Accent Word (Italic)" value={data.heading_accent} onChange={set('heading_accent')} />
                    <Field label="Heading (After Accent)" value={data.heading_suffix} onChange={set('heading_suffix')} />
                </div>
                <Field label="Subtitle" value={data.description} onChange={set('description')} type="textarea" rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {data.items.map((item, i) => (
                    <div key={item.id} className="border border-border p-4 bg-white relative group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-text-muted uppercase">Tile {i + 1}</span>
                            <Btn onClick={() => removeItem(i)} variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" /></Btn>
                        </div>
                        <div className="space-y-3">
                            <Field label="Title" value={item.title} onChange={setItem(i, 'title')} />
                            <Field label="Description" value={item.desc} onChange={setItem(i, 'desc')} type="textarea" rows={2} />
                            <ImageField label="Image URL" value={item.image} onChange={setItem(i, 'image')} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SpecialOffersEditor({ data, onChange }) {

    const set = (key) => (val) => onChange({ ...data, [key]: val });
    const setImage = (idx, url) => {
        const imgs = [...data.images];
        imgs[idx] = { ...imgs[idx], url };
        onChange({ ...data, images: imgs });
    };

    return (
        <div>
            <SectionHeader
                title="Special Beauty Offers"
                subtitle="Dark maroon banner section with 6 floating offer images"
            />

            {/* Preview strip */}
            <div className="mb-6 p-4 bg-[#4A1D28] flex items-center gap-3 overflow-x-auto border border-white/10 rounded-xl shadow-inner">
                {data.images.map((img, i) => (
                    <img key={i} src={img.url} alt="" className="w-14 h-18 object-cover border-2 border-white/30 shrink-0 shadow-lg"
                        onError={e => e.currentTarget.style.opacity = '0.2'} />
                ))}
                <div className="ml-4 text-left border-l border-white/10 pl-4">
                    <p className="text-white font-black text-sm uppercase tracking-tight">{data.heading} <em className="text-[#D4A373] font-serif">{data.heading_italic}</em></p>
                    <p className="text-white/60 text-[10px] mt-1 max-w-[250px] line-clamp-2 font-medium">{data.description}</p>
                    <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-[0.2em] bg-[#D4A373] text-white px-2.5 py-1 rounded shadow-sm">{data.btn_label}</span>
                </div>
            </div>

            {/* Text fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-8">
                <div className="space-y-4">
                    <Field label="Heading (Bold)" value={data.heading} onChange={set('heading')} />
                    <Field label="Heading (Italic/Accent)" value={data.heading_italic} onChange={set('heading_italic')} />
                    <Field label="Button Label" value={data.btn_label} onChange={set('btn_label')} />
                </div>
                <Field label="Section Description" value={data.description} onChange={set('description')} type="textarea" rows={6} />
            </div>

            {/* 6 offer images */}
            <div className="pt-6 border-t border-border">
                <p className="text-[11px] font-black text-text uppercase tracking-[0.15em] mb-4">Floating Offer Images (6 Photos)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.images.map((img, i) => (
                        <div key={img.id} className="border border-border p-3 bg-surface/30 group hover:border-primary transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black text-text-muted uppercase">Image {i + 1}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="relative group/img h-40 w-full bg-black/5 overflow-hidden">
                                    <img src={img.url} alt="" className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                                        onError={e => e.currentTarget.style.opacity = '0.2'} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <Image className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <Field label="Image URL" value={img.url} onChange={e => setImage(i, e)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function LegalEditor({ data, onChange }) {
    const setPage = (page, key) => (val) => onChange({ ...data, [page]: { ...data[page], [key]: val } });
    const pages = [
        { key: 'privacy', label: 'Privacy Policy', icon: Shield },
        { key: 'terms', label: 'Terms of Service', icon: ScrollText },
        { key: 'cookies', label: 'Cookie Policy', icon: Cookie },
    ];

    return (
        <div>
            <SectionHeader title="Legal Pages" subtitle="Privacy Policy, Terms of Service, Cookie Policy" />
            <div className="space-y-6">
                {pages.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="border border-border bg-white p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-black text-text">{label}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Field label="Page Title" value={data[key].title} onChange={setPage(key, 'title')} />
                                <Field label="Content (HTML allowed)" value={data[key].content} onChange={setPage(key, 'content')} type="textarea" rows={8} />
                            </div>
                            <ImageField label="Header / Side Image URL" value={data[key].image} onChange={setPage(key, 'image')} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                               */
/* ═══════════════════════════════════════════════════════════════════════ */

const SECTIONS = [
    { id: 'hero', label: 'Hero Banner', icon: LayoutDashboard },
    { id: 'about', label: 'About / Why Us', icon: FileText },
    { id: 'features', label: 'Features Cards', icon: Edit3 },
    { id: 'gallery', label: 'Bento Gallery', icon: Image },
    { id: 'specialOffers', label: 'Special Offers', icon: Sparkles },

    { id: 'faqs', label: 'FAQ Section', icon: HelpCircle },

    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'blog', label: 'Blog Posts', icon: BookOpen },
    { id: 'legal', label: 'Legal Pages', icon: Shield },
];

export default function SAContentPage() {
    const [content, setContent] = useState(loadContent);
    const [activeSection, setActiveSection] = useState('hero');
    const [toast, setToast] = useState(null);
    const [unsaved, setUnsaved] = useState(false);

    const updateSection = (key) => (val) => {
        setContent(prev => ({ ...prev, [key]: val }));
        setUnsaved(true);
    };

    const handleSave = () => {
        saveContent(content);
        setUnsaved(false);
        setToast('Content saved successfully!');
    };

    const handleReset = () => {
        if (!confirm('Reset ALL content to defaults? This cannot be undone.')) return;
        setContent(DEFAULT_CONTENT);
        saveContent(DEFAULT_CONTENT);
        setUnsaved(false);
        setToast('Content reset to defaults.');
    };

    const pendingCount = content.testimonials.filter(t => t.status === 'pending').length;

    return (
        <div className="min-h-screen bg-surface">
            {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

            {/* Page Header */}
            <div className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-text">Content Manager</h1>
                    <p className="text-xs text-text-muted mt-0.5">Edit all landing page text, images, testimonials & legal content</p>
                </div>
                <div className="flex items-center gap-3">
                    {unsaved && (
                        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Unsaved changes
                        </span>
                    )}
                    <a href="/" target="_blank" rel="noopener noreferrer">
                        <Btn variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /> Preview Site</Btn>
                    </a>
                    <Btn onClick={handleReset} variant="ghost" size="sm"><RotateCcw className="w-3.5 h-3.5" /> Reset</Btn>
                    <Btn onClick={handleSave} variant="primary" size="sm"><Save className="w-3.5 h-3.5" /> Save All</Btn>
                </div>
            </div>

            <div className="flex min-h-[calc(100vh-73px)]">

                {/* Left section nav */}
                <aside className="w-52 shrink-0 bg-white border-r border-border">
                    <nav className="p-3 space-y-0.5">
                        {SECTIONS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors text-left
                                    ${activeSection === s.id
                                        ? 'bg-primary text-white'
                                        : 'text-text-secondary hover:bg-surface hover:text-text'}`}
                            >
                                <s.icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1">{s.label}</span>
                                {s.id === 'testimonials' && pendingCount > 0 && (
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 min-w-[18px] text-center ${activeSection === s.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-5xl mx-auto bg-white border border-border p-6">
                        {activeSection === 'hero' && <HeroEditor data={content.hero} onChange={updateSection('hero')} />}
                        {activeSection === 'about' && <AboutEditor data={content.about} onChange={updateSection('about')} />}
                        {activeSection === 'features' && <FeaturesEditor data={content.features} onChange={updateSection('features')} />}
                        {activeSection === 'gallery' && <GalleryEditor data={content.gallery} onChange={updateSection('gallery')} />}
                        {activeSection === 'specialOffers' && <SpecialOffersEditor data={content.specialOffers} onChange={updateSection('specialOffers')} />}

                        {activeSection === 'faqs' && <FAQEditor data={content.faqs} onChange={updateSection('faqs')} />}

                        {activeSection === 'testimonials' && <TestimonialsEditor data={content.testimonials} onChange={updateSection('testimonials')} />}
                        {activeSection === 'blog' && <BlogEditor data={content.blog} onChange={updateSection('blog')} />}
                        {activeSection === 'legal' && <LegalEditor data={content.legal} onChange={updateSection('legal')} />}

                        {/* Save bar */}
                        <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
                            <p className="text-xs text-text-muted">
                                Changes are stored in browser localStorage. Connect to your backend API to persist permanently.
                            </p>
                            <div className="flex gap-2">
                                <Btn onClick={handleReset} variant="ghost"><RotateCcw className="w-3.5 h-3.5" /> Reset Section</Btn>
                                <Btn onClick={handleSave} variant="primary"><Save className="w-3.5 h-3.5" /> Save All Changes</Btn>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
