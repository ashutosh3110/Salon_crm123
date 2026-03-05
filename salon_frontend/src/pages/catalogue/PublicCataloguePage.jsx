import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Clock, Tag, Star, ChevronRight, MessageSquare,
    Facebook, Instagram, Globe, Phone, MapPin,
    Share2, ArrowLeft, RefreshCw, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

export default function PublicCataloguePage() {
    const { slug } = useParams();
    const [catalogue, setCatalogue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    useEffect(() => {
        const fetchCatalogue = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/catalogue/public/${slug}`);
                setCatalogue(res.data);
            } catch (err) {
                console.error('Error fetching catalogue:', err);
                setError('Catalogue not found or is currently private.');
            } finally {
                setLoading(false);
            }
        };
        fetchCatalogue();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !catalogue) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                    <Globe className="w-10 h-10 text-slate-300" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Private Menu</h1>
                <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">{error || "This catalogue isn't available right now."}</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/25"
                >
                    BACK TO HOME
                </button>
            </div>
        );
    }

    const { theme } = catalogue;
    const activePage = catalogue.pages?.[currentPageIndex];

    return (
        <div className="min-h-screen bg-white pb-24" style={{ fontFamily: theme.fontStyle || 'Inter' }}>
            {/* Header / Cover */}
            <div className="relative h-[30vh] lg:h-[40vh] overflow-hidden bg-slate-100">
                <img
                    src={catalogue.coverImage || "https://images.unsplash.com/photo-1560066914-1f29c2cc7d3a?auto=format&fit=crop&q=80&w=1200"}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => window.history.back()}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Profile Info */}
            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/60 border border-slate-100 text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-xl -mt-20 flex items-center justify-center overflow-hidden mb-6">
                        <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-black">
                            {catalogue.title.charAt(0)}
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">{catalogue.title}</h1>
                    <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-6">{catalogue.description}</p>

                    <div className="flex items-center gap-4">
                        {catalogue.socialLinks?.instagram && (
                            <a href={`https://instagram.com/${catalogue.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                                <Instagram className="w-5 h-5" />
                            </a>
                        )}
                        {catalogue.socialLinks?.whatsapp && (
                            <a href={`https://wa.me/${catalogue.socialLinks.whatsapp}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                                <MessageSquare className="w-5 h-5" />
                            </a>
                        )}
                        {catalogue.socialLinks?.facebook && (
                            <a href={`https://facebook.com/${catalogue.socialLinks.facebook}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                                <Facebook className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Page Navigation */}
            {catalogue.pages && catalogue.pages.length > 1 && (
                <div className="max-w-4xl mx-auto px-6 mt-8">
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {catalogue.pages.map((page, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPageIndex(idx)}
                                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${currentPageIndex === idx
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-primary/20 hover:text-primary'
                                    }`}
                            >
                                {page.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Menu Sections */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPageIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-4xl mx-auto px-6 mt-8 space-y-12"
                >
                    {activePage?.sections.map((section, idx) => (
                        <div key={idx} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap">{section.title}</h2>
                                <div className="h-px w-full bg-primary/10" />
                            </div>

                            <div className={`grid gap-4 ${theme.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {section.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:border-primary/20 transition-all group relative overflow-hidden"
                                    >
                                        {item.highlight && (
                                            <div className="absolute top-0 right-0">
                                                <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg">POPULAR</div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">{item.displayName}</h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-lg font-black text-primary">₹{item.price}</span>
                                                    <div className="h-4 w-px bg-slate-100" />
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" /> {item.duration || '20'} MIN
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Sticky Booking CTA */}
            <div className="fixed bottom-0 left-0 right-0 px-6 py-6 z-[100]">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => window.location.href = '/app'}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:translate-y-[-4px] active:scale-95 transition-all"
                    >
                        BOOK YOUR APPOINTMENT NOW <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-24 text-center px-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Powered by Salon CRM Pro</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Instagram className="w-4 h-4" /></a>
                    <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Facebook className="w-4 h-4" /></a>
                    <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Globe className="w-4 h-4" /></a>
                </div>
            </div>
        </div>
    );
}

function Plus({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
