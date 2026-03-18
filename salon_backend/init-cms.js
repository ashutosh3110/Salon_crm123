import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_crm';

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
        content: `
            <section>
                <h2>1. Introduction</h2>
                <p>Welcome to the Salon CRM platform. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and safeguard your data.</p>
            </section>
            <section>
                <h2>2. Information Collection</h2>
                <p>We collect various types of information to provide and improve our services to you:</p>
                <ul>
                    <li>Personal identification information (Name, email address, phone number).</li>
                    <li>Payment information and transaction history for salon services.</li>
                    <li>Usage data and technical device information when you access our platform.</li>
                    <li>Professional salon-related data provided by business owners.</li>
                </ul>
            </section>
        `
    },
    legal_terms: {
        title: "Terms of Service",
        last_updated: "February 2026",
        content: `
            <section>
                <h2>1. Agreement to Terms</h2>
                <p>By accessing or using Salon CRM, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            </section>
            <section>
                <h2>2. Use License</h2>
                <p>Permission is granted to temporarily use the materials on the Salon CRM platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials.</p>
            </section>
        `
    },
    legal_cookies: {
        title: "Cookie Policy",
        last_updated: "February 2026",
        content: `
            <section>
                <h2>1. What are Cookies?</h2>
                <p>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.</p>
            </section>
            <section>
                <h2>2. How We Use Cookies</h2>
                <p>We use cookies to enhance your experience on our website, remember your login details, and gather analytics that help us improve our services.</p>
            </section>
        `
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

async function initCMS() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const CMSSchema = new mongoose.Schema({
            section: { type: String, required: true, unique: true },
            content: { type: mongoose.Schema.Types.Mixed, required: true }
        }, { collection: 'cms' });

        const CMS = mongoose.models.CMS || mongoose.model('CMS', CMSSchema);

        for (const [section, content] of Object.entries(INITIAL_CMS_DATA)) {
            await CMS.findOneAndUpdate(
                { section },
                { content },
                { upsert: true, new: true }
            );
            console.log(`Initialized section: ${section}`);
        }

        console.log('CMS Initialization complete.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error initializing CMS:', error);
    }
}

initCMS();
