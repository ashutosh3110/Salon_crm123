import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Clock, Tag, Star, ChevronRight, MessageSquare,
    Facebook, Instagram, Globe, Phone, MapPin,
    Share2, ArrowLeft, RefreshCw, ExternalLink,
    X, CheckCircle2, Calendar, Scissors, Sparkles, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

export default function PublicCataloguePage() {
    const { slug } = useParams();
    const [catalogue, setCatalogue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [showBooking, setShowBooking] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [isBooked, setIsBooked] = useState(false);

    useEffect(() => {
        const fetchCatalogue = async () => {
            setLoading(true);
            try {
                // Try Local Storage First (Mock Development Flow)
                const localData = localStorage.getItem('digital_catalogue');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    // Allow preview if slug matches or if it's a generic preview
                    if (parsed.slug === slug || slug === 'preview' || (slug && slug.includes('salon'))) {
                        setCatalogue(parsed);
                        setLoading(false);
                        return;
                    }
                }

                const res = await axios.get(`${API_BASE_URL}/catalogue/public/${slug}`);
                setCatalogue(res.data);
            } catch (err) {
                console.error('Error fetching catalogue:', err);
                // Last ditch fallback for mock development
                const localData = localStorage.getItem('digital_catalogue');
                if (localData) {
                    setCatalogue(JSON.parse(localData));
                } else {
                    setError('Catalogue not found or is currently private.');
                }
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

    const { premiumConfig = { accentColor: '#AD0B2A', textColor: '#1A1A1A', fontFamily: 'serif' } } = catalogue;
    const activePage = catalogue.pages?.[currentPageIndex];

    const handleBookNow = (item) => {
        setSelectedItem(item);
        setShowBooking(true);
    };

    const confirmBooking = () => {
        setIsBooked(true);
        setTimeout(() => {
            setShowBooking(false);
            setIsBooked(false);
            setSelectedItem(null);
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-white selection:bg-primary/20" style={{
            fontFamily: premiumConfig.fontFamily === 'serif' ? 'serif' : 'sans-serif',
            color: premiumConfig.textColor
        }}>

            {/* ─── Premium Header ─── */}
            <header className="p-8 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                        {catalogue.title.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tight leading-none">{catalogue.title}</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Luxury Salon & Spa</p>
                    </div>
                </div>
                <button className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                    <Share2 className="w-4 h-4 text-slate-400" />
                </button>
            </header>

            {/* ─── Premium Hero Section ─── */}
            <div className="relative h-[60vh] overflow-hidden bg-slate-950 flex items-center justify-center text-center px-6">
                <img
                    src={catalogue.coverImage || "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&q=80"}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-overlay"
                    alt="Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 space-y-6"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">Experience Excellence</span>
                    <h2 className="text-6xl md:text-8xl font-light text-white leading-none tracking-tighter">
                        {catalogue.title}
                    </h2>
                    <p className="text-sm md:text-lg text-white/40 font-medium max-w-xl mx-auto italic">
                        {catalogue.description || "Expert treatment using premium organic products for lasting results."}
                    </p>
                    <div className="pt-8">
                        <button
                            onClick={() => document.getElementById('menu-start').scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-4 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-primary hover:text-white transition-all shadow-2xl"
                        >
                            Explore Menu
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* ─── Navigation ─── */}
            <div id="menu-start" className="sticky top-0 z-[50] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 overflow-x-auto no-scrollbar">
                <div className="max-w-5xl mx-auto flex items-center justify-center gap-8 py-4">
                    {catalogue.pages && catalogue.pages.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPageIndex(idx)}
                            className={`text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap transition-all border-b-2 py-2 ${currentPageIndex === idx ? 'border-primary text-primary' : 'border-transparent text-slate-400 opacity-60 hover:opacity-100'}`}
                        >
                            {p.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Menu Grid ─── */}
            <main className="max-w-6xl mx-auto p-12 lg:p-24 space-y-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPageIndex}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="space-y-32"
                    >
                        {activePage?.sections.map((section, sIdx) => (
                            <div key={sIdx} className="grid lg:grid-cols-2 gap-24 items-start">
                                <div className={sIdx % 2 !== 0 ? 'lg:order-last' : ''}>
                                    <div className="space-y-2 mb-12">
                                        <div className="w-12 h-1px bg-primary opacity-30" />
                                        <h3 className="text-4xl font-light uppercase tracking-tight" style={{ color: premiumConfig.accentColor }}>{section.title}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Section 0{sIdx + 1}</p>
                                    </div>

                                    <div className="space-y-12">
                                        {section.items.map((item, iIdx) => (
                                            <div key={iIdx} className="flex justify-between items-start group">
                                                <div className="flex items-center gap-6 flex-1">
                                                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                                        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.displayName} />
                                                    </div>
                                                    <div className="space-y-1 max-w-[70%]">
                                                        <h4 className="text-xl font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{item.displayName}</h4>
                                                        <p className="text-xs opacity-50 font-medium leading-relaxed italic">{item.description}</p>
                                                        <div className="flex items-center gap-4 pt-2">
                                                            <span className="text-[10px] font-black tracking-widest opacity-40 uppercase">{item.duration || '45'} MIN</span>
                                                            <button
                                                                onClick={() => handleBookNow(item)}
                                                                className="text-[10px] font-black tracking-widest uppercase text-primary underline"
                                                            >
                                                                Book Now
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-lg font-black italic" style={{ color: premiumConfig.accentColor }}>₹{item.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-slate-50 -z-1" style={{ backgroundColor: `${premiumConfig.accentColor}05` }} />
                                    <motion.img
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        src={sIdx % 2 === 0 ? "https://images.unsplash.com/photo-1522337360705-0b34991ff08a?w=800&q=80" : "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80"}
                                        className="w-full h-full object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 aspect-[4/5]"
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* ─── Footer Section ─── */}
            <footer className="bg-slate-950 text-white p-24 text-center space-y-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                <div className="relative z-10 space-y-6">
                    <h5 className="text-5xl font-light tracking-tighter">Experience <br /> Preferred Luxury.</h5>
                    <div className="flex justify-center gap-8 pt-6">
                        <a href="#" className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-all">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center"><Instagram className="w-5 h-5" /></div>
                            <span className="text-[9px] font-black tracking-widest uppercase text-white">Instagram</span>
                        </a>
                        <a href="#" className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-all">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                            <span className="text-[9px] font-black tracking-widest uppercase text-white">Contact</span>
                        </a>
                    </div>
                </div>
                <div className="relative z-10 pt-12 border-t border-white/10 opacity-30 text-[10px] font-black uppercase tracking-[0.5em]">
                    &copy; 2024 {catalogue.title} • Private Collection
                </div>
            </footer>

            {/* ─── Booking Modal ─── */}
            <AnimatePresence>
                {showBooking && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowBooking(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden relative shadow-2xl"
                        >
                            {!isBooked ? (
                                <>
                                    <div className="p-12 text-center space-y-6">
                                        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto text-primary">
                                            <Calendar className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Reserve Appointment</h3>
                                            <p className="text-sm font-medium opacity-50 mt-1">Book your session for <span className="text-primary font-bold">{selectedItem?.displayName}</span></p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="text-left">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Preferred Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    onChange={(e) => setBookingDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['10:00 AM', '01:30 PM', '04:00 PM'].map(slot => (
                                                    <button key={slot} className="py-3 bg-slate-50 rounded-xl text-[10px] font-black hover:bg-primary hover:text-white transition-all">{slot}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={confirmBooking}
                                            disabled={!bookingDate}
                                            className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                                        >
                                            Confirm Booking
                                        </button>

                                        <p className="text-[10px] font-medium opacity-30 uppercase tracking-widest">Instant confirmation via WhatsApp</p>
                                    </div>
                                    <button onClick={() => setShowBooking(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-16 text-center space-y-6"
                                >
                                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Success!</h3>
                                        <p className="text-sm font-medium opacity-50 mt-1">Your luxury experience is booked <br /> for {bookingDate}. See you soon!</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
