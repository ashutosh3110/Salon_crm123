import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Save, Layout, Type, Image as ImageIcon, MessageSquare,
    Shield, FileText, Smartphone, Zap, Heart, Target,
    Package, BarChart2, CheckCircle2, AlertCircle, Info,
    Eye, Edit3, Globe, Smartphone as MobileIcon, Search,
    Monitor, RefreshCw, HelpCircle, Plus, Trash2, Star, Link
} from 'lucide-react';

// Import Landing Components for Live Preview
import AnimatedHero from '../../components/landing/wapixo/AnimatedHero';
import Features from '../../components/landing/wapixo/Features';
import WapixoTestimonials from '../../components/landing/wapixo/WapixoTestimonials';
import WapixoSolutions from '../../components/landing/wapixo/WapixoSolutions';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';
import WapixoFAQ from '../../components/landing/wapixo/WapixoFAQ';
import ScissorsMorph from '../../components/landing/wapixo/ScissorsMorph';
import ChairSection from '../../components/landing/wapixo/ChairSection';
import AppShowcase from '../../components/landing/wapixo/AppShowcase';
import GlobalCustomers from '../../components/landing/wapixo/GlobalCustomers';
import { getImageUrl } from '../../utils/imageUtils';

/* ─── CMS Section/Field Mock Data ────────────────────────────────────── */
const INITIAL_CMS_DATA = {
    landing_hero: {
        overline: 'Salon Management · Wapixo',
        headline_part1: 'Run your salon',
        headline_part2: 'without the chaos.',
        subtitle: 'Book appointments, track revenue, and manage your team — all from one surgical command center.',
        cta_primary: 'Start Free Trial',
        cta_secondary: 'Sign in →',
        trust_line: 'Trusted by salons across India, UAE, and the UK.',
        stat1_value: '500+', stat1_label: 'Salons',
        stat2_value: '50K+', stat2_label: 'Bookings',
        stat3_value: '99.9%', stat3_label: 'Uptime',
    },
    landing_stats: {
        stat1_value: '10K+', stat1_label: 'Salons Worldwide',
        stat2_value: '98%', stat2_label: 'Client Retention',
        stat3_value: '3x', stat3_label: 'Revenue Growth'
    },
    landing_solutions_header: {
        overline: 'The Transition',
        headline: 'From Chaos to Command.',
    },
    landing_solutions: [
        { id: 1, problem: 'Fragmented Operations', problemDesc: 'Using multiple disconnected apps leads to data silos and chaos.', solution: 'Unified Ecosystem', solutionDesc: 'A single command center for every aspect of your salon.' },
        { id: 2, problem: 'The "No-Show" Drain', problemDesc: 'Forgotten appointments mean empty chairs and lost revenue.', solution: 'Autonomous Reminders', solutionDesc: 'Automated WhatsApp and SMS workflows that keep chairs full.' },
        { id: 3, problem: 'Inventory Blindness', problemDesc: 'Manual stock tracking leads to wastage, theft, and emergency re-orders.', solution: 'Precision Analytics', solutionDesc: 'Real-time barcode synchronization across outlets.' },
        { id: 4, problem: 'Growth Guesswork', problemDesc: 'Scaling without data is gambling.', solution: 'Actionable Intelligence', solutionDesc: 'Deep-dive analytics that reveal what drives your growth.' },
    ],
    site_footer: {
        tagline: 'Powering smart businesses with intelligent salon management.',
        copyright_suffix: 'All rights reserved.',
        powering_text: 'POWERING SMART BUSINESSES',
    },
    legal_privacy: {
        title: 'Privacy Policy',
        last_updated: 'February 2026',
        content: 'Your privacy is important to us. This policy explains how we collect, use, and protect your data...'
    },
    legal_terms: {
        title: 'Terms of Service',
        last_updated: 'February 2026',
        content: 'By using Wapixo, you agree to these legal terms and conditions...'
    },
    legal_cookies: {
        title: 'Cookie Policy',
        last_updated: 'February 2026',
        content: 'We use cookies to enhance your experience and analyze platform performance...'
    },
    contact_page: {
        title: 'Get in Touch',
        subtitle: 'Have questions about our enterprise solutions? Our experts are ready to assist.',
        address: 'DLF Cyber City, Tower 8, Gurugram, India',
        email: 'solutions@wapixo.io',
        phone: '+91 999 888 7766'
    },
    landing_testimonials: [
        { id: 1, name: 'Claudia Alves', role: 'CEO, ARTISTRY STUDIO', content: 'Wapixo has completely transformed how we manage our multi-outlet salon.', stars: 5 },
        { id: 2, name: 'Priya Sharma', role: 'DIRECTOR, URBAN GLOSS', content: 'The WhatsApp automation and smart scheduling have reduced our no-shows by 40%.', stars: 5 },
        { id: 3, name: 'Rahul Varma', role: 'FOUNDER, ELITE SCISSORS', content: 'Managing inventory across 10 locations was a nightmare before Wapixo.', stars: 5 }
    ],
    landing_features: [
        { id: 1, title: 'Smart Booking', desc: 'Real-time scheduling with zero conflicts. Your clients book 24/7.' },
        { id: 2, title: 'Advanced Analytics', desc: 'Revenue insights, peak hours, and growth metrics at a glance.' },
        { id: 3, title: 'Client Management', desc: 'Complete client histories, preferences, and loyalty tracking.' },
        { id: 4, title: 'Loyalty Engine', desc: 'Automated rewards and referral programs that retain clients.' },
        { id: 5, title: 'Staff Scheduling', desc: 'Shift management, commissions, and performance tracking.' },
        { id: 6, title: 'Multi-Outlet', desc: 'Manage every branch from one powerful dashboard.' }
    ],
    landing_faqs: [
        { id: 1, question: 'How does the 14-day free trial work?', answer: 'You get full access to all features for 14 days. No credit card is required to start.' },
        { id: 2, question: 'Can I manage multiple salon locations?', answer: 'Absolutely. Wapixo is built for scale. Whether you have 2 or 200 outlets, you can manage them all.' }
    ],
    landing_faq_cta: {
        text: 'Still have questions? Our experts are here to guide you.',
        button_text: 'Contact Support'
    },
    landing_app_showcase: {
        overline: 'Customer Mobile App',
        headline_part1: 'Book. Discover.',
        headline_part2: 'Enjoy.',
        desc: 'Give your clients the luxury experience they deserve — premium bookings, curated services, and exclusive membership plans, all in one elegant app.',
        image_url_1: '/image1.png',
        image_url_2: '/image1.png',
        image_url_3: '/image1.png'
    },
    landing_multi_device_showcase: {
        overline: 'Unified Ecosystem',
        headline_part1: 'One platform.',
        headline_part2: 'All devices.',
        desc: 'Manage bookings, view live dashboard analytics, update catalog styles, and run your client membership programs seamlessly from desktop, tablet, and mobile.',
        monitor_image_url: '/image1.png',
        laptop_image_url: '/image1.png',
        tablet_image_url: '/image1.png',
        phone_image_url: '/image1.png'
    },
    landing_scissors_morph: {
        overline: 'Crafted for Artists',
        title: 'Precision Tools for',
        subtitle: 'The Modern Artist.',
        desc: "Elevate your craft with the industry's most refined equipment. Performance meet elegance in every cut and style."
    },
    landing_chair_section: {
        overline: 'Experience Wapixo',
        headline: 'The Throne of Excellence.',
        subtitle: 'Comfort meets Control.',
        primary_cta: 'Experience Wapixo',
        secondary_cta: 'Sign In'
    },
    app_links: {
        admin_app: '',
        staff_app: '',
        customer_app: '',
        admin_ios: '',
        staff_ios: '',
        customer_ios: '',
    },
    landing_global_customers: {
        heading: 'Meet our global customers',
        subtitle: "Trusted by 3000+ salon/spa's worldwide",
        logos: [
            '/hair_styling_promo.png',
            '/hair_styling_promo.png',
            '/hair_styling_promo.png',
            '/hair_styling_promo.png'
        ]
    },
    about: {
        badge: 'Why SalonCRM',
        heading: 'Built by Salon Experts, For Salon Owners',
        para1: 'We understand the unique challenges of running a salon business. From managing walk-ins to tracking product inventory, from retaining clients to growing revenue — SalonCRM handles it all so you can focus on what you do best: making people look amazing.',
        para2: 'Trusted by 500+ salons across India, our platform processes over 50,000 appointments every month with 99.9% uptime.',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
        values: [
            { title: 'Lightning Fast', desc: 'Optimized for speed so your reception never waits. POS billing in under 10 seconds.', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800' },
            { title: 'Enterprise Security', desc: 'Bank-grade encryption, role-based access, and complete data isolation per salon.', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' },
            { title: 'Built for Salons', desc: 'Not a generic tool. Every feature is designed specifically for the beauty industry.', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800' },
            { title: 'Cloud Native', desc: 'Access from anywhere — desktop, tablet, or phone. No installations, no limits.', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' },
        ],
        vision_quote: 'We aren\'t just building tools. We are designing the digital engine that enables beauty creators and salon owners to amplify their craft and deliver unmatched experiences.',
        vision_author: 'The Wapixo Team',
        vision_location: 'Mumbai, India'
    },
    inquiry_banner: {
        badge_text: 'SPECIAL INQUIRY',
        title: 'Need Custom Salon CRM?',
        desc: 'Get a custom walkthrough and check features designed exclusively to scale your salon business.',
        button_text: 'Send Inquiry',
        image_url: '/banner.jpeg',
        delay_seconds: 5
    },
    landing_model_showcase: {
        headline_part1: 'Smart tools for',
        headline_part2: 'modern salons',
        desc: 'Elevate your client experience with Wapixo. Seamlessly manage appointments, track staff performance in real-time, and automate your marketing—all from one intuitive dashboard.',
        primary_cta: 'Get Started Free',
        secondary_cta: 'Watch Demo',
        image_url: '/women%20wapixo.png'
    }
};

const CMS_TABS = [
    { id: 'landing', label: 'Hero & Content', icon: Layout },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'inquiry_banner', label: 'Inquiry Banner', icon: FileText },
    { id: 'solutions', label: 'Solutions', icon: Zap },
    { id: 'footer', label: 'Footer', icon: Globe },
    { id: 'legal', label: 'Legal Pages', icon: Shield },
    { id: 'contact', label: 'Contact Page', icon: MessageSquare },
    { id: 'faqs', label: 'Platform FAQs', icon: HelpCircle },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'app_links', label: 'App Links', icon: Link },
];


export default function SACMSPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('landing');
    const [data, setData] = useState(INITIAL_CMS_DATA);
    const [saving, setSaving] = useState(false);

    const resolveLogoUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
        if (url.startsWith('/') && !url.includes('uploads')) return url;
        return getImageUrl(url);
    };
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [allReviews, setAllReviews] = useState([]);

    useEffect(() => {
        fetchCMSData();
    }, []);

    const fetchCMSData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cms');
            if (response.data && response.data.success && response.data.data) {
                setData(prev => ({ ...prev, ...response.data.data }));
            }
        } catch (error) {
            console.error('Error fetching CMS data:', error);
            showToast("Error loading content");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllReviews = async () => {
        try {
            const response = await api.get('/testimonials/all');
            setAllReviews(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchAllReviews();
        }
    }, [activeTab]);

    const handleUpdateReviewStatus = async (id, newStatus) => {
        try {
            await api.patch(`/testimonials/${id}/status`, { status: newStatus });
            showToast(`Review ${newStatus} successfully!`);
            fetchAllReviews();
        } catch (error) {
            showToast('Failed to update review status');
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save all sections that are part of INITIAL_CMS_DATA
            const promises = Object.keys(INITIAL_CMS_DATA).map((section) =>
                api.patch(`/cms/${section}`, { content: data[section] })
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
                ...(prev[page] || {}),
                [field]: value
            }
        }));
    };

    const handleImageUpload = async (e, page, field) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('image', file);
            const { data: res } = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.success && res.url) {
                updateField(page, field, res.url);
                showToast("Image uploaded successfully");
            } else {
                showToast("Failed to upload image");
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast("Failed to upload image");
        } finally {
            setSaving(false);
        }
    };

    const handleAboutValueImageUpload = async (e, idx) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('image', file);
            const { data: res } = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.success && res.url) {
                setData(prev => {
                    const currentValues = [...(prev.about?.values || INITIAL_CMS_DATA.about.values)];
                    if (currentValues[idx]) {
                        currentValues[idx] = { ...currentValues[idx], image: res.url };
                    }
                    return {
                        ...prev,
                        about: {
                            ...(prev.about || {}),
                            values: currentValues
                        }
                    };
                });
                showToast("Value card image uploaded successfully");
            } else {
                showToast("Failed to upload image");
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast("Failed to upload image");
        } finally {
            setSaving(false);
        }
    };

    const renderInput = (page, field, label, type = 'text') => {
        const value = data[page]?.[field] ?? INITIAL_CMS_DATA[page]?.[field] ?? '';
        return (
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">{label}</label>
                {type === 'textarea' ? (
                    <textarea
                        className="w-full bg-surface border border-border p-3 text-sm focus:border-[#B4912B] outline-none transition-colors min-h-[100px]"
                        value={value}
                        onChange={(e) => updateField(page, field, e.target.value)}
                    />
                ) : type === 'image' ? (
                    <div className="flex gap-2 items-center cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input[type="file"]').click()}>
                        <input
                            className="flex-1 bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
                            value={value}
                            readOnly
                            placeholder="Click to upload image..."
                        />
                        <div className="p-2.5 border border-border bg-white text-text-muted hover:text-primary transition-colors shrink-0 flex items-center justify-center">
                            <ImageIcon size={16} />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, page, field)}
                        />
                    </div>
                ) : (
                    <input
                        className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors"
                        value={value}
                        onChange={(e) => updateField(page, field, e.target.value)}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-20 sa-panel">
            {/* Toast feedback */}
            {toast && (
                <div className="fixed top-20 right-8 bg-[#B4912B] text-white px-6 py-3 shadow-2xl z-[100] flex items-center gap-3 animate-in slide-in-from-right-10 duration-500">
                    <CheckCircle2 size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">{toast}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter">WEBSITE <span className="text-primary">EDITOR</span></h1>
                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-[0.2em] mt-1">Change your website text and legal pages</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open('/', '_blank')}
                        className="px-5 py-2.5 bg-surface border border-border text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2">
                        <Eye size={14} /> Preview Site
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#B4912B] text-white icon-white-outline-force text-white-force text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[#B4912B]/20"
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
                        <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-b-2 border-[#B4912B]"></div>
                    </div>
                )}
                {/* Editor Area */}
                <div className="col-span-1 md:col-span-7 space-y-12">

                    {activeTab === 'landing' && (
                        <div className="space-y-12">
                            {/* Hero Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-primary">
                                        <Type size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Hero Section</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    {renderInput('landing_hero', 'overline', 'Overline Badge (small text above headline)')}
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput('landing_hero', 'headline_part1', 'Headline Line 1')}
                                        {renderInput('landing_hero', 'headline_part2', 'Headline Line 2 (bold)')}
                                    </div>
                                    {renderInput('landing_hero', 'subtitle', 'Subtitle / Description', 'textarea')}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                        {renderInput('landing_hero', 'cta_primary', 'Primary CTA Button')}
                                        {renderInput('landing_hero', 'cta_secondary', 'Secondary CTA Link')}
                                    </div>
                                    {renderInput('landing_hero', 'trust_line', 'Trust Line (below CTAs)')}
                                    <div className="pt-4 border-t border-border">
                                        <div className="text-[10px] font-black text-text-muted uppercase mb-3">Hero Stats (3 values)</div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                {renderInput('landing_hero', 'stat1_value', 'Stat 1 Value')}
                                                {renderInput('landing_hero', 'stat1_label', 'Stat 1 Label')}
                                            </div>
                                            <div className="space-y-2">
                                                {renderInput('landing_hero', 'stat2_value', 'Stat 2 Value')}
                                                {renderInput('landing_hero', 'stat2_label', 'Stat 2 Label')}
                                            </div>
                                            <div className="space-y-2">
                                                {renderInput('landing_hero', 'stat3_value', 'Stat 3 Value')}
                                                {renderInput('landing_hero', 'stat3_label', 'Stat 3 Label')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Capabilities Stats */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center text-primary">
                                        <BarChart2 size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Capabilities Stats</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-4 p-4 border border-border/50 bg-surface/30">
                                            <div className="text-[10px] font-black text-primary uppercase">Stat 1</div>
                                            <div className="space-y-3">
                                                {renderInput('landing_stats', 'stat1_value', 'Value (e.g. 10K+)')}
                                                {renderInput('landing_stats', 'stat1_label', 'Label')}
                                            </div>
                                        </div>
                                        <div className="space-y-4 p-4 border border-border/50 bg-surface/30">
                                            <div className="text-[10px] font-black text-primary uppercase">Stat 2</div>
                                            <div className="space-y-3">
                                                {renderInput('landing_stats', 'stat2_value', 'Value (e.g. 98%)')}
                                                {renderInput('landing_stats', 'stat2_label', 'Label')}
                                            </div>
                                        </div>
                                        <div className="space-y-4 p-4 border border-border/50 bg-surface/30">
                                            <div className="text-[10px] font-black text-primary uppercase">Stat 3</div>
                                            <div className="space-y-3">
                                                {renderInput('landing_stats', 'stat3_value', 'Value (e.g. 3x)')}
                                                {renderInput('landing_stats', 'stat3_label', 'Label')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Features Grid */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center text-primary">
                                            <Package size={18} />
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight">Key Features</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const newFeature = { id: Date.now(), title: 'New Feature', desc: 'Describe the feature...' };
                                                setData(prev => ({ ...prev, landing_features: [...(prev.landing_features || []), newFeature] }));
                                            }}
                                            className="px-4 py-2 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-white flex items-center gap-2 transition-all"
                                        >
                                            <Plus size={14} /> Add Feature
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-4 py-2 bg-[#B4912B] text-white icon-white-outline-force text-white-force text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] flex items-center gap-2 shadow-lg shadow-[#B4912B]/20 transition-all"
                                        >
                                            {saving ? 'Saving...' : <><Save size={14} /> Save Section</>}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {(data.landing_features || []).map((feature, idx) => (
                                            <div key={feature.id} className="space-y-4 p-4 border border-border/50 bg-surface/30 relative group">
                                                <button
                                                    onClick={() => setData(prev => ({ ...prev, landing_features: prev.landing_features.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="text-[10px] font-black text-primary uppercase">MODULE {String(idx + 1).padStart(2, '0')}</div>
                                                <div className="space-y-3">
                                                    <input
                                                        className="w-full bg-transparent border-b border-border/60 py-1 text-sm font-bold focus:border-[#B4912B] outline-none"
                                                        value={feature.title}
                                                        onChange={(e) => {
                                                            const newFeatures = [...data.landing_features];
                                                            newFeatures[idx].title = e.target.value;
                                                            setData(prev => ({ ...prev, landing_features: newFeatures }));
                                                        }}
                                                    />
                                                    <textarea
                                                        className="w-full bg-transparent border-b border-border/60 py-1 text-[11px] focus:border-[#B4912B] outline-none min-h-[60px] resize-none"
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

                            {/* App Showcase Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-pink-50 flex items-center justify-center text-primary">
                                        <Smartphone size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">App Showcase Section</h2>
                                </div>
                                <div className="bg-white p-8 border border-border space-y-6">
                                    {renderInput('landing_app_showcase', 'overline', 'Overline Text')}
                                    <div className="grid grid-cols-2 gap-6">
                                        {renderInput('landing_app_showcase', 'headline_part1', 'Headline (Line 1)')}
                                        {renderInput('landing_app_showcase', 'headline_part2', 'Headline (Line 2 - Italic)')}
                                    </div>
                                    {renderInput('landing_app_showcase', 'desc', 'Description', 'textarea')}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {renderInput('landing_app_showcase', 'image_url_1', 'Mobile Screen 1 URL', 'image')}
                                        {renderInput('landing_app_showcase', 'image_url_2', 'Mobile Screen 2 URL', 'image')}
                                        {renderInput('landing_app_showcase', 'image_url_3', 'Mobile Screen 3 URL', 'image')}
                                    </div>
                                </div>
                            </section>

                            {/* Multi-Device Showcase Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-50 flex items-center justify-center text-primary">
                                        <Monitor size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Multi-Device Showcase Section</h2>
                                </div>
                                <div className="bg-white p-8 border border-border space-y-6">
                                    {renderInput('landing_multi_device_showcase', 'overline', 'Overline Text')}
                                    <div className="grid grid-cols-2 gap-6">
                                        {renderInput('landing_multi_device_showcase', 'headline_part1', 'Headline (Line 1)')}
                                        {renderInput('landing_multi_device_showcase', 'headline_part2', 'Headline (Line 2 - Bold)')}
                                    </div>
                                    {renderInput('landing_multi_device_showcase', 'desc', 'Description / Subtitle', 'textarea')}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                        {renderInput('landing_multi_device_showcase', 'monitor_image_url', 'Monitor Mockup Image (Preview)', 'image')}
                                        {renderInput('landing_multi_device_showcase', 'laptop_image_url', 'Laptop Mockup Image (Preview)', 'image')}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInput('landing_multi_device_showcase', 'tablet_image_url', 'Tablet Mockup Image (Preview)', 'image')}
                                        {renderInput('landing_multi_device_showcase', 'phone_image_url', 'Smartphone Mockup Image (Preview)', 'image')}
                                    </div>
                                </div>
                            </section>

                            {/* Scissors Morph Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center text-primary">
                                        <ImageIcon size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Scissors Morph Banner</h2>
                                </div>
                                <div className="bg-white p-8 border border-border space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        {renderInput('landing_scissors_morph', 'overline', 'Overline Text')}
                                        {renderInput('landing_scissors_morph', 'title', 'Title (First Line)')}
                                    </div>
                                    {renderInput('landing_scissors_morph', 'subtitle', 'Subtitle (Italicized)')}
                                    {renderInput('landing_scissors_morph', 'desc', 'Description', 'textarea')}
                                </div>
                            </section>

                            {/* Chair Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-orange-50 flex items-center justify-center text-primary">
                                        <Monitor size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Chair Section (Video Banner)</h2>
                                </div>
                                <div className="bg-white p-8 border border-border space-y-6">
                                    {renderInput('landing_chair_section', 'overline', 'Overline Text')}
                                    {renderInput('landing_chair_section', 'headline', 'Main Headline')}
                                    {renderInput('landing_chair_section', 'subtitle', 'Subtitle')}
                                    <div className="grid grid-cols-2 gap-6">
                                        {renderInput('landing_chair_section', 'primary_cta', 'Primary Button Text')}
                                        {renderInput('landing_chair_section', 'secondary_cta', 'Secondary Button Text')}
                                    </div>
                                </div>
                            </section>

                            {/* Model Showcase Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-teal-50 flex items-center justify-center text-primary">
                                        <ImageIcon size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Model Showcase Section</h2>
                                </div>
                                <div className="bg-white p-8 border border-border space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        {renderInput('landing_model_showcase', 'headline_part1', 'Headline Part 1')}
                                        {renderInput('landing_model_showcase', 'headline_part2', 'Headline Part 2 (Highlighted)')}
                                    </div>
                                    {renderInput('landing_model_showcase', 'desc', 'Description', 'textarea')}
                                    <div className="grid grid-cols-2 gap-6">
                                        {renderInput('landing_model_showcase', 'primary_cta', 'Primary Button Text')}
                                        {renderInput('landing_model_showcase', 'secondary_cta', 'Secondary Button Text')}
                                    </div>
                                    {renderInput('landing_model_showcase', 'image_url', 'Main Image', 'image')}
                                </div>
                            </section>

                            {/* Global Customers Section */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-primary">
                                            <Globe size={18} />
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight">Global Customers Section</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const currentLogos = data.landing_global_customers?.logos || [];
                                                setData(prev => ({
                                                    ...prev,
                                                    landing_global_customers: {
                                                        ...(prev.landing_global_customers || {}),
                                                        logos: [...currentLogos, '/hair_styling_promo.png']
                                                    }
                                                }));
                                            }}
                                            className="px-4 py-2 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-white flex items-center gap-2 transition-all"
                                        >
                                            <Plus size={14} /> Add Logo
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-4 py-2 bg-[#B4912B] text-white icon-white-outline-force text-white-force text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] flex items-center gap-2 shadow-lg shadow-[#B4912B]/20 transition-all"
                                        >
                                            {saving ? 'Saving...' : <><Save size={14} /> Save Section</>}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    {renderInput('landing_global_customers', 'heading', 'Section Title')}
                                    {renderInput('landing_global_customers', 'subtitle', 'Subtitle')}

                                    <div className="pt-4 border-t border-border">
                                        <div className="text-[10px] font-black text-text-muted uppercase mb-4">Brand Logos</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {(data.landing_global_customers?.logos || []).map((logo, idx) => (
                                                <div key={idx} className="relative p-4 border border-border bg-surface/30 flex flex-col gap-3 items-center group">
                                                    <button
                                                        onClick={() => {
                                                            const currentLogos = data.landing_global_customers?.logos || [];
                                                            setData(prev => ({
                                                                ...prev,
                                                                landing_global_customers: {
                                                                    ...(prev.landing_global_customers || {}),
                                                                    logos: currentLogos.filter((_, i) => i !== idx)
                                                                }
                                                            }));
                                                        }}
                                                        className="absolute top-2 right-2 text-text-muted hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>

                                                    <div className="h-16 flex items-center justify-center bg-white border border-border/60 p-2 w-full">
                                                        <img src={resolveLogoUrl(logo)} alt={`Logo ${idx}`} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                                    </div>

                                                    <button
                                                        onClick={(e) => e.currentTarget.nextSibling.click()}
                                                        className="w-full bg-white border border-border py-1.5 text-[9px] font-black uppercase tracking-wider text-center hover:bg-surface transition-colors"
                                                    >
                                                        Upload Logo
                                                    </button>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            try {
                                                                setSaving(true);
                                                                const formData = new FormData();
                                                                formData.append('image', file);
                                                                const { data: res } = await api.post('/uploads', formData, {
                                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                                });
                                                                if (res.success && res.url) {
                                                                    const currentLogos = [...(data.landing_global_customers?.logos || [])];
                                                                    currentLogos[idx] = res.url;
                                                                    setData(prev => ({
                                                                        ...prev,
                                                                        landing_global_customers: {
                                                                            ...(prev.landing_global_customers || {}),
                                                                            logos: currentLogos
                                                                        }
                                                                    }));
                                                                    showToast("Logo uploaded successfully");
                                                                } else {
                                                                    showToast("Failed to upload logo");
                                                                }
                                                            } catch (err) {
                                                                console.error(err);
                                                                showToast("Upload failed");
                                                            } finally {
                                                                setSaving(false);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* FAQ Section */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-primary">
                                            <HelpCircle size={18} />
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight">Frequently Asked Questions</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const newFaq = { id: Date.now(), question: 'New Question', answer: 'Answer here...' };
                                                setData(prev => ({ ...prev, landing_faqs: [...(prev.landing_faqs || []), newFaq] }));
                                            }}
                                            className="px-4 py-2 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-white flex items-center gap-2 transition-all"
                                        >
                                            <Plus size={14} /> Add FAQ
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-4 py-2 bg-[#B4912B] text-white icon-white-outline-force text-white-force text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] flex items-center gap-2 shadow-lg shadow-[#B4912B]/20 transition-all"
                                        >
                                            {saving ? 'Saving...' : <><Save size={14} /> Save Section</>}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    <div className="grid grid-cols-1 gap-6">
                                        {(data.landing_faqs || []).map((faq, idx) => (
                                            <div key={faq.id} className="space-y-4 p-4 border border-border/50 bg-surface/30 relative group">
                                                <button
                                                    onClick={() => setData(prev => ({ ...prev, landing_faqs: prev.landing_faqs.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="text-[10px] font-black text-primary uppercase">FAQ {String(idx + 1).padStart(2, '0')}</div>
                                                <div className="space-y-3">
                                                    <input
                                                        className="w-full bg-transparent border-b border-border/60 py-1 text-sm font-bold focus:border-[#B4912B] outline-none"
                                                        value={faq.question}
                                                        onChange={(e) => {
                                                            const newFaqs = [...data.landing_faqs];
                                                            newFaqs[idx].question = e.target.value;
                                                            setData(prev => ({ ...prev, landing_faqs: newFaqs }));
                                                        }}
                                                    />
                                                    <textarea
                                                        className="w-full bg-transparent border-b border-border/60 py-1 text-[11px] focus:border-[#B4912B] outline-none min-h-[60px] resize-none"
                                                        value={faq.answer}
                                                        onChange={(e) => {
                                                            const newFaqs = [...data.landing_faqs];
                                                            newFaqs[idx].answer = e.target.value;
                                                            setData(prev => ({ ...prev, landing_faqs: newFaqs }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}

                    {activeTab === 'inquiry_banner' && (
                        <div className="space-y-12">
                            <section className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-50 flex items-center justify-center text-primary">
                                            <FileText size={18} />
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight">Timed Inquiry Banner</h2>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-5 py-2 bg-[#B4912B] text-white icon-white-outline-force text-white-force text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] flex items-center gap-2 shadow-lg shadow-[#B4912B]/20 transition-all"
                                    >
                                        {saving ? 'Saving...' : <><Save size={14} /> Save Section Changes</>}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    {renderInput('inquiry_banner', 'badge_text', 'Badge Text (e.g. SPECIAL INQUIRY)')}
                                    {renderInput('inquiry_banner', 'title', 'Banner Title')}
                                    {renderInput('inquiry_banner', 'desc', 'Banner Description', 'textarea')}
                                    {renderInput('inquiry_banner', 'button_text', 'Button Text')}
                                    {renderInput('inquiry_banner', 'image_url', 'Banner Image', 'image')}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Delay (in seconds)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors"
                                            value={data.inquiry_banner?.delay_seconds ?? INITIAL_CMS_DATA.inquiry_banner.delay_seconds}
                                            onChange={(e) => updateField('inquiry_banner', 'delay_seconds', parseInt(e.target.value) || 5)}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="space-y-12">
                            {/* Intro Section */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#FDF9F8] flex items-center justify-center text-primary">
                                            <Info size={18} />
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight">About Intro Section</h2>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-5 py-2 bg-[#B4912B] text-white icon-white-outline-force text-white-force text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] flex items-center gap-2 shadow-lg shadow-[#B4912B]/20 transition-all"
                                    >
                                        {saving ? 'Saving...' : <><Save size={14} /> Save Section Changes</>}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    {renderInput('about', 'badge', 'Overline Badge / Small Text')}
                                    {renderInput('about', 'heading', 'Main Heading')}
                                    {renderInput('about', 'para1', 'Paragraph 1', 'textarea')}
                                    {renderInput('about', 'para2', 'Paragraph 2', 'textarea')}
                                    {renderInput('about', 'image', 'Main Section Image', 'image')}
                                </div>
                            </section>

                            {/* Core Pillars / Values Section */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#FDF9F8] flex items-center justify-center text-primary">
                                            <Target size={18} />
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight">Core Pillars & Values (4 Cards)</h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {(data.about?.values || INITIAL_CMS_DATA.about.values).map((value, idx) => (
                                            <div key={idx} className="space-y-4 p-4 border border-border/50 bg-surface/30 relative group">
                                                <div className="text-[10px] font-black text-primary uppercase">Pillar {idx + 1}</div>
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-wider">Title</label>
                                                        <input
                                                            className="w-full bg-white border border-border px-3 py-1.5 text-xs font-bold focus:border-[#B4912B] outline-none"
                                                            value={value.title}
                                                            onChange={(e) => {
                                                                const newValues = [...(data.about?.values || INITIAL_CMS_DATA.about.values)];
                                                                newValues[idx] = { ...newValues[idx], title: e.target.value };
                                                                setData(prev => ({
                                                                    ...prev,
                                                                    about: {
                                                                        ...(prev.about || {}),
                                                                        values: newValues
                                                                    }
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-wider">Description</label>
                                                        <textarea
                                                            className="w-full bg-white border border-border p-2 text-xs focus:border-[#B4912B] outline-none min-h-[60px] resize-none"
                                                            value={value.desc}
                                                            onChange={(e) => {
                                                                const newValues = [...(data.about?.values || INITIAL_CMS_DATA.about.values)];
                                                                newValues[idx] = { ...newValues[idx], desc: e.target.value };
                                                                setData(prev => ({
                                                                    ...prev,
                                                                    about: {
                                                                        ...(prev.about || {}),
                                                                        values: newValues
                                                                    }
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-wider">Image</label>
                                                        <div className="flex gap-2 items-center cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input[type="file"]').click()}>
                                                            <input
                                                                className="flex-1 bg-white border border-border px-3 py-1.5 text-xs focus:border-[#B4912B] outline-none transition-colors cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
                                                                value={value.image}
                                                                readOnly
                                                                placeholder="Click to upload image..."
                                                            />
                                                            <div className="p-2 border border-border bg-white text-text-muted hover:text-primary transition-colors shrink-0 flex items-center justify-center">
                                                                <ImageIcon size={14} />
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleAboutValueImageUpload(e, idx)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Quote / Vision Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#FDF9F8] flex items-center justify-center text-primary">
                                        <Heart size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Vision / Quote Banner</h2>
                                </div>
                                <div className="bg-white p-8 border border-border space-y-6">
                                    {renderInput('about', 'vision_quote', 'Vision Quote Text', 'textarea')}
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput('about', 'vision_author', 'Author / Team Name')}
                                        {renderInput('about', 'vision_location', 'Location')}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ── SOLUTIONS TAB ── */}
                    {activeTab === 'solutions' && (
                        <div className="space-y-8">
                            {/* Solutions Header */}
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 flex items-center justify-center text-primary"><Zap size={18} /></div>
                                    Section Header
                                </h2>
                                <div className="bg-white p-6 border border-border grid grid-cols-2 gap-4">
                                    {renderInput('landing_solutions_header', 'overline', 'Overline Text')}
                                    {renderInput('landing_solutions_header', 'headline', 'Main Headline')}
                                </div>
                            </section>

                            {/* Comparison Cards */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold tracking-tight">Problem → Solution Cards</h2>
                                    <button
                                        onClick={() => {
                                            const newCard = { id: Date.now(), problem: 'New Problem', problemDesc: 'Describe the problem...', solution: 'Our Solution', solutionDesc: 'Describe the solution...' };
                                            setData(prev => ({ ...prev, landing_solutions: [...(prev.landing_solutions || []), newCard] }));
                                        }}
                                        className="px-4 py-2 bg-[#B4912B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] flex items-center gap-2"
                                    >
                                        <Plus size={14} /> Add Card
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(data.landing_solutions || []).map((card, idx) => (
                                        <div key={card.id} className="bg-white border border-border p-6 relative group">
                                            <button
                                                onClick={() => setData(prev => ({ ...prev, landing_solutions: prev.landing_solutions.filter((_, i) => i !== idx) }))}
                                                className="absolute top-4 right-4 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="text-[10px] font-black text-primary uppercase mb-4">Card {idx + 1}</div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3 p-4 bg-surface/30 border border-border/40">
                                                    <div className="text-[9px] font-black text-red-400 uppercase tracking-widest">❌ Problem Side</div>
                                                    <input className="w-full border-b border-border/60 py-1 text-sm font-bold outline-none bg-transparent focus:border-[#B4912B]"
                                                        value={card.problem}
                                                        placeholder="Problem Title"
                                                        onChange={e => { const a = [...data.landing_solutions]; a[idx] = { ...a[idx], problem: e.target.value }; setData(p => ({ ...p, landing_solutions: a })); }}
                                                    />
                                                    <textarea className="w-full border-b border-border/60 py-1 text-xs outline-none bg-transparent focus:border-[#B4912B] min-h-[60px] resize-none"
                                                        value={card.problemDesc}
                                                        placeholder="Problem description"
                                                        onChange={e => { const a = [...data.landing_solutions]; a[idx] = { ...a[idx], problemDesc: e.target.value }; setData(p => ({ ...p, landing_solutions: a })); }}
                                                    />
                                                </div>
                                                <div className="space-y-3 p-4 bg-amber-50/50 border border-[#B4912B]/20">
                                                    <div className="text-[9px] font-black text-primary uppercase tracking-widest">✅ Solution Side</div>
                                                    <input className="w-full border-b border-border/60 py-1 text-sm font-bold outline-none bg-transparent focus:border-[#B4912B]"
                                                        value={card.solution}
                                                        placeholder="Solution Title"
                                                        onChange={e => { const a = [...data.landing_solutions]; a[idx] = { ...a[idx], solution: e.target.value }; setData(p => ({ ...p, landing_solutions: a })); }}
                                                    />
                                                    <textarea className="w-full border-b border-border/60 py-1 text-xs outline-none bg-transparent focus:border-[#B4912B] min-h-[60px] resize-none"
                                                        value={card.solutionDesc}
                                                        placeholder="Solution description"
                                                        onChange={e => { const a = [...data.landing_solutions]; a[idx] = { ...a[idx], solutionDesc: e.target.value }; setData(p => ({ ...p, landing_solutions: a })); }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ── FOOTER TAB ── */}
                    {activeTab === 'footer' && (
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-primary"><Globe size={18} /></div>
                                <h2 className="text-lg font-bold tracking-tight">Footer Content</h2>
                            </div>
                            <div className="bg-white p-8 border border-border space-y-6">
                                {renderInput('site_footer', 'tagline', 'Brand Tagline (below logo)')}
                                {renderInput('site_footer', 'copyright_suffix', 'Copyright Suffix (after year & name)')}
                                {renderInput('site_footer', 'powering_text', 'Bottom Strip Text (uppercase)')}
                            </div>
                        </section>
                    )}

                    {activeTab === 'legal' && (

                        <div className="space-y-8">
                            <div className="bg-white p-8 border border-border space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Privacy Policy Configuration</h3>
                                    <div className="text-[10px] font-medium text-text-muted">Last Edit: {data.legal_privacy.last_updated}</div>
                                </div>
                                {renderInput('legal_privacy', 'title', 'Page Title')}
                                {renderInput('legal_privacy', 'content', 'Policy Body Content', 'textarea')}
                            </div>

                            <div className="bg-white p-8 border border-border space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Terms of Service Configuration</h3>
                                    <div className="text-[10px] font-medium text-text-muted">Last Edit: {data.legal_terms.last_updated}</div>
                                </div>
                                {renderInput('legal_terms', 'title', 'Page Title')}
                                {renderInput('legal_terms', 'content', 'Terms Body Content', 'textarea')}
                            </div>

                            <div className="bg-white p-8 border border-border space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Cookie Policy Configuration</h3>
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
                                {renderInput('contact_page', 'title', 'Page Headline (H1)')}
                                {renderInput('contact_page', 'subtitle', 'Support Instruction Text', 'textarea')}
                                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-border">
                                    {renderInput('contact_page', 'address', 'Physical HQ Address')}
                                    {renderInput('contact_page', 'email', 'Global Support Email')}
                                    {renderInput('contact_page', 'phone', 'Inquiry Hotline')}
                                    {renderInput('contact_page', 'response_note', 'Fast Response Note', 'textarea')}
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'faqs' && (
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-rose-50 flex items-center justify-center text-primary">
                                        <HelpCircle size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight">Landing Page FAQs</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        const newF = [...data.landing_faqs, { id: Date.now(), question: 'New Question?', answer: 'New Answer...' }];
                                        setData(prev => ({ ...prev, landing_faqs: newF }));
                                    }}
                                    className="px-4 py-2 bg-[#B4912B] text-white icon-white-outline-force text-white-force text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] transition-all flex items-center gap-2 shadow-lg shadow-[#B4912B]/20"
                                >
                                    <Plus size={14} /> Add FAQ
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-6 bg-white p-8 border border-border">
                                {data.landing_faqs.map((faq, idx) => (
                                    <div key={faq.id} className="p-6 border border-border bg-surface/30 relative group">
                                        <button
                                            onClick={() => {
                                                const newF = data.landing_faqs.filter((_, i) => i !== idx);
                                                setData(prev => ({ ...prev, landing_faqs: newF }));
                                            }}
                                            className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Question</label>
                                                <input
                                                    className="w-full bg-white border border-border px-3 py-2 text-sm font-bold focus:border-[#B4912B] outline-none"
                                                    value={faq.question}
                                                    onChange={(e) => {
                                                        const newF = [...data.landing_faqs];
                                                        newF[idx].question = e.target.value;
                                                        setData(prev => ({ ...prev, landing_faqs: newF }));
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Answer</label>
                                                <textarea
                                                    className="w-full bg-white border border-border p-3 text-sm focus:border-[#B4912B] outline-none min-h-[80px]"
                                                    value={faq.answer}
                                                    onChange={(e) => {
                                                        const newF = [...data.landing_faqs];
                                                        newF[idx].answer = e.target.value;
                                                        setData(prev => ({ ...prev, landing_faqs: newF }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FAQ CTA Configuration */}
                            <div className="bg-white p-8 border border-border mt-6">
                                <h3 className="text-sm font-bold tracking-tight mb-4 uppercase">CTA Section Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderInput('landing_faq_cta', 'text', 'CTA Text')}
                                    {renderInput('landing_faq_cta', 'button_text', 'Button Text')}
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'app_links' && (
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-primary">
                                    <Link size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">App Download Links</h2>
                                    <p className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">Landing page ke App Showcase section mein buttons ke URLs set karein</p>
                                </div>
                            </div>

                            <div className="bg-white p-8 border border-border space-y-6">
                                {/* Android Apps */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                        <MobileIcon size={16} className="text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Android / Play Store Links</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Admin App URL</label>
                                            <input
                                                className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors"
                                                placeholder="https://play.google.com/store/apps/..."
                                                value={data.app_links?.admin_app || ''}
                                                onChange={(e) => updateField('app_links', 'admin_app', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Staff App URL</label>
                                            <input
                                                className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors"
                                                placeholder="https://play.google.com/store/apps/..."
                                                value={data.app_links?.staff_app || ''}
                                                onChange={(e) => updateField('app_links', 'staff_app', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Customer App URL</label>
                                            <input
                                                className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors"
                                                placeholder="https://play.google.com/store/apps/..."
                                                value={data.app_links?.customer_app || ''}
                                                onChange={(e) => updateField('app_links', 'customer_app', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* iOS Apps */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                        <svg className="text-primary" width={16} height={16} viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">iOS / App Store Links</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Admin iOS URL</label>
                                            <input
                                                className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors"
                                                placeholder="https://apps.apple.com/app/..."
                                                value={data.app_links?.admin_ios || ''}
                                                onChange={(e) => updateField('app_links', 'admin_ios', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Staff iOS URL</label>
                                            <input
                                                className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors"
                                                placeholder="https://apps.apple.com/app/..."
                                                value={data.app_links?.staff_ios || ''}
                                                onChange={(e) => updateField('app_links', 'staff_ios', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Customer iOS URL</label>
                                            <input
                                                className="w-full bg-surface border border-border px-3 py-2 text-sm focus:border-[#B4912B] outline-none transition-colors"
                                                placeholder="https://apps.apple.com/app/..."
                                                value={data.app_links?.customer_ios || ''}
                                                onChange={(e) => updateField('app_links', 'customer_ios', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-[#B4912B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6F23] transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[#B4912B]/20"
                                    >
                                        {saving ? 'Saving...' : <><Save size={14} /> Save App Links</>}
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 border-b border-border pb-4">
                                <div className="w-10 h-10 bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Star size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">Manage Reviews</h2>
                                    <p className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">Approve or reject customer testimonials</p>
                                </div>
                            </div>

                            <div className="bg-surface border border-border p-6 mt-6">
                                {allReviews.length === 0 ? (
                                    <div className="text-center py-10 text-text-muted text-sm">No reviews submitted yet.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {allReviews.map(review => (
                                            <div key={review._id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border border-border/60 bg-white shadow-sm">
                                                <div className="flex gap-4">
                                                    {review.image && (
                                                        <img
                                                            src={getImageUrl(review.image)}
                                                            alt={review.name}
                                                            className="w-12 h-12 rounded-full object-cover border border-border"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-sm text-text">{review.name}</span>
                                                            <span className="text-[10px] bg-surface px-2 py-0.5 rounded text-text-muted">{review.role}</span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {review.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {[...Array(review.rating)].map((_, i) => (
                                                                <Star key={i} size={12} fill="#B4912B" color="#B4912B" />
                                                            ))}
                                                        </div>
                                                        <p className="text-sm text-text-muted">"{review.content}"</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    {review.status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleUpdateReviewStatus(review._id, 'approved')}
                                                            className="px-4 py-2 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {review.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleUpdateReviewStatus(review._id, 'rejected')}
                                                            className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
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
                            <div className="bg-white border border-border/20 rounded-sm overflow-hidden h-[600px] shadow-inner relative group">
                                <div className="absolute top-0 left-0 overflow-y-auto custom-scrollbar scale-[0.5] origin-top-left w-[200%] h-[200%] pb-40">
                                    <div className="new-theme pointer-events-none min-h-full" style={{ background: 'var(--wapixo-bg, #ffffff)' }}>
                                        {/* ── LANDING TAB preview ── */}
                                        {activeTab === 'landing' && (
                                            <div className="space-y-0 w-full">
                                                <AnimatedHero data={data.landing_hero} />
                                                <AppShowcase data={data.landing_app_showcase} />
                                                {data.landing_features && <Features data={data.landing_features} statsData={data.landing_stats} />}
                                                <ScissorsMorph data={data.landing_scissors_morph} />
                                                {data.landing_faqs && <WapixoFAQ data={data.landing_faqs} ctaData={data.landing_faq_cta} />}
                                                <GlobalCustomers data={data.landing_global_customers} />
                                                <ChairSection data={data.landing_chair_section} />
                                                {data.landing_testimonials && <WapixoTestimonials data={data.landing_testimonials} />}
                                            </div>
                                        )}
                                        {/* ── INQUIRY BANNER TAB preview ── */}
                                        {activeTab === 'inquiry_banner' && (
                                            <div className="p-8 flex items-center justify-center min-h-[400px]" style={{ background: '#f5f5f5' }}>
                                                <div style={{
                                                    width: '320px',
                                                    background: '#fff',
                                                    border: '1px solid var(--wapixo-border, #e5e5e5)',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                                    fontFamily: "'Inter', sans-serif"
                                                }}>
                                                    <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                                                        <img
                                                            src={resolveLogoUrl(data.inquiry_banner?.image_url || INITIAL_CMS_DATA.inquiry_banner.image_url)}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            alt="Banner Preview"
                                                        />
                                                        {data.inquiry_banner?.badge_text && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '12px',
                                                                left: '12px',
                                                                background: 'rgba(180, 145, 43, 0.9)',
                                                                color: 'white',
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700
                                                            }}>
                                                                {data.inquiry_banner.badge_text}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ padding: '16px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                                                        <h4 style={{ 
                                                            margin: 0, 
                                                            fontSize: '0.95rem', 
                                                            fontWeight: 600, 
                                                            color: 'var(--wapixo-text, #111)',
                                                            fontFamily: "'Inter', sans-serif"
                                                        }}>
                                                            {data.inquiry_banner?.title}
                                                        </h4>
                                                        <p style={{ 
                                                            margin: 0, 
                                                            fontSize: '0.78rem', 
                                                            color: 'var(--wapixo-text-muted, #666)', 
                                                            lineHeight: '1.4',
                                                            fontFamily: "'Inter', sans-serif",
                                                            fontWeight: 300
                                                        }}>
                                                            {data.inquiry_banner?.desc}
                                                        </p>
                                                        <button style={{
                                                            width: '100%',
                                                            padding: '10px',
                                                            background: '#B4912B',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}>
                                                            {data.inquiry_banner?.button_text}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* ── ABOUT TAB preview ── */}
                                        {activeTab === 'about' && data.about && (
                                            <div className="p-8 space-y-12 w-full" style={{ background: 'var(--wapixo-bg)', color: 'var(--wapixo-text)', fontFamily: "'Inter', sans-serif" }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{ color: 'var(--wapixo-primary)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                                                        {data.about.badge || 'About Us'}
                                                    </span>
                                                    <h2 style={{ fontSize: '2rem', fontWeight: 300, marginTop: '0.5rem', color: 'var(--wapixo-text)' }}>
                                                        {data.about.heading || 'Our Story'}
                                                    </h2>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                                                    <div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--wapixo-text-muted)', lineHeight: 1.6 }}>{data.about.para1}</p>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--wapixo-text-muted)', lineHeight: 1.6, marginTop: '1rem' }}>{data.about.para2}</p>
                                                    </div>
                                                    {data.about.image && (
                                                        <div style={{ border: '1px solid var(--wapixo-border)', borderRadius: '2px', overflow: 'hidden', aspectRatio: '3/2' }}>
                                                            <img src={resolveLogoUrl(data.about.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="About" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 style={{ fontSize: '1rem', fontWeight: 400, textAlign: 'center', marginBottom: '1.5rem' }}>Our Core Pillars</h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                        {(data.about.values || []).map((val, idx) => (
                                                            <div key={idx} style={{ background: 'var(--wapixo-bg-alt)', border: '1px solid var(--wapixo-border)', padding: '1rem' }}>
                                                                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--wapixo-text)', marginBottom: '0.5rem' }}>{val.title}</h4>
                                                                <p style={{ fontSize: '0.7rem', color: 'var(--wapixo-text-muted)', lineHeight: 1.4 }}>{val.desc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {data.about.vision_quote && (
                                                    <div style={{ textAlign: 'center', borderTop: '1px solid var(--wapixo-border)', paddingTop: '1.5rem' }}>
                                                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--wapixo-text-muted)' }}>“{data.about.vision_quote}”</p>
                                                        <h5 style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--wapixo-text)' }}>{data.about.vision_author}</h5>
                                                        <p style={{ fontSize: '0.65rem', color: 'var(--wapixo-text-muted)' }}>{data.about.vision_location}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* ── SOLUTIONS TAB preview ── */}
                                        {activeTab === 'solutions' && (
                                            <WapixoSolutions
                                                data={data.landing_solutions}
                                                header={data.landing_solutions_header}
                                            />
                                        )}
                                        {/* ── FOOTER TAB preview ── */}
                                        {activeTab === 'footer' && (
                                            <WapixoFooter data={data.site_footer} />
                                        )}
                                        {/* ── LEGAL TAB preview ── */}
                                        {activeTab === 'legal' && data.legal_privacy && data.legal_terms && (
                                            <div className="p-16 space-y-12 w-full" style={{ color: 'var(--wapixo-text)' }}>
                                                <h1 className="text-5xl font-black border-b border-[#B4912B] pb-4 inline-block" style={{ color: 'var(--wapixo-text)' }}>{data.legal_privacy.title}</h1>
                                                <div className="prose max-w-none opacity-70 text-sm leading-relaxed" style={{ color: 'var(--wapixo-text-muted)' }} dangerouslySetInnerHTML={{ __html: data.legal_privacy.content }} />
                                                <h1 className="text-5xl font-black mt-32 border-b border-[#B4912B] pb-4 inline-block" style={{ color: 'var(--wapixo-text)' }}>{data.legal_terms.title}</h1>
                                                <div className="prose max-w-none opacity-70 text-sm leading-relaxed" style={{ color: 'var(--wapixo-text-muted)' }} dangerouslySetInnerHTML={{ __html: data.legal_terms.content }} />
                                            </div>
                                        )}
                                        {/* ── CONTACT TAB preview ── */}
                                        {activeTab === 'contact' && data.contact_page && (
                                            <div className="p-16 min-h-screen flex flex-col justify-center items-center text-center w-full" style={{ background: 'var(--wapixo-bg)', color: 'var(--wapixo-text)' }}>
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--wapixo-primary)' }}>Enterprise Support</span>
                                                <h2 className="text-6xl font-black mb-6 leading-[1.1]" style={{ color: 'var(--wapixo-text)' }}>{data.contact_page.title}</h2>
                                                <div className="w-12 h-0.5 mb-8" style={{ background: 'var(--wapixo-primary)' }} />
                                                <p className="text-lg max-w-xl font-light leading-relaxed mb-12" style={{ color: 'var(--wapixo-text-muted)' }}>{data.contact_page.subtitle}</p>
                                                <div className="space-y-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] uppercase font-black tracking-widest" style={{ color: 'var(--wapixo-text-muted)' }}>Email</p>
                                                        <p className="text-xl font-medium" style={{ color: 'var(--wapixo-text)' }}>{data.contact_page.email}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] uppercase font-black tracking-widest" style={{ color: 'var(--wapixo-text-muted)' }}>Phone</p>
                                                        <p className="text-xl font-medium" style={{ color: 'var(--wapixo-text)' }}>{data.contact_page.phone}</p>
                                                    </div>
                                                    <div className="pt-6">
                                                        <p className="text-[8px] uppercase font-bold tracking-[0.3em]" style={{ color: 'var(--wapixo-text-muted)' }}>{data.contact_page.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* ── FAQS TAB preview ── */}
                                        {activeTab === 'faqs' && data.landing_faqs && (
                                            <WapixoFAQ data={data.landing_faqs} ctaData={data.landing_faq_cta} />
                                        )}
                                        {/* ── REVIEWS TAB preview ── */}
                                        {activeTab === 'reviews' && data.landing_testimonials && (
                                            <WapixoTestimonials data={data.landing_testimonials} />
                                        )}
                                    </div>
                                </div>

                                {/* Subtle vignette — much lighter so content shows */}
                                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.3)] z-10" />
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <RefreshCw size={10} className="text-primary animate-spin-slow" />
                                <p className="text-[9px] text-white/30 font-medium tracking-tight">
                                    Miniaturized real-time simulation active.
                                </p>
                            </div>
                        </div>

                        {/* Status Stats */}
                        <div className="bg-white border border-border p-5 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Ecosystem Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-emerald-600 tracking-tighter uppercase">Secured</span>
                                    <Shield size={10} className="text-emerald-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Sync Latency</p>
                                <p className="text-xs font-bold tracking-tighter">0.00ms</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
