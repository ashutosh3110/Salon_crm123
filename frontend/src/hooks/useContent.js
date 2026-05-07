import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sa_content_manager_v1';

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


export function useContent() {
    const [content, setContent] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return DEFAULT_CONTENT;
            const parsed = JSON.parse(saved);
            return {
                ...DEFAULT_CONTENT,
                ...parsed,
                hero: { ...DEFAULT_CONTENT.hero, ...(parsed.hero || {}) },
                about: { ...DEFAULT_CONTENT.about, ...(parsed.about || {}) },
                legal: { ...DEFAULT_CONTENT.legal, ...(parsed.legal || {}) },
                specialOffers: { ...DEFAULT_CONTENT.specialOffers, ...(parsed.specialOffers || {}) },
                gallery: { ...DEFAULT_CONTENT.gallery, ...(parsed.gallery || {}) },
            };
        } catch {
            return DEFAULT_CONTENT;
        }
    });

    useEffect(() => {
        // Listen for local changes from same window
        const handleStorage = (e) => {
            if (e.key === STORAGE_KEY) {
                try {
                    setContent(JSON.parse(e.newValue));
                } catch (err) {
                    console.error('Failed to parse content from storage', err);
                }
            }
        };

        window.addEventListener('storage', handleStorage);

        // Polling fallback for cross-tab updates if not triggered by event
        const interval = setInterval(() => {
            const current = localStorage.getItem(STORAGE_KEY);
            if (current) {
                try {
                    const parsed = JSON.parse(current);
                    if (JSON.stringify(parsed) !== JSON.stringify(content)) {
                        setContent(parsed);
                    }
                } catch { }
            }
        }, 3000);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, [content]);

    return content;
}
