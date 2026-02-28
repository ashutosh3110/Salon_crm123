import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    Image as ImageIcon,
    Plus,
    Trash2,
    Edit,
    Eye,
    Smartphone,
    Tag,
    Zap,
    CheckCircle2,
    X,
    Upload,
    ArrowRight,
    Star,
    Clock
} from 'lucide-react';

export default function MarketingCMSPage() {
    const [banners, setBanners] = useState([
        { id: 1, title: 'Summer Hair Revival', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop', link: '/services/hair-care', status: 'Active' },
        { id: 2, title: 'Men\'s Grooming Special', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop', link: '/services/barber', status: 'Paused' },
    ]);

    const [offers, setOffers] = useState([
        { id: 1, title: 'First Visit 20% Off', description: 'Available for all new customers on their first appointment.', code: 'FIRST20', expiry: '31 Mar, 2024', status: 'Live' },
        { id: 2, title: 'Wedding Package', description: 'Complete bridal makeover including hair, makeup and spa.', code: 'BRIDAL10', expiry: '15 Jun, 2024', status: 'Draft' },
    ]);

    const [activeTab, setActiveTab] = useState('banners');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('banner'); // 'banner' or 'offer'

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-text uppercase tracking-tight leading-none mb-2">App CMS</h1>
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-primary"></span>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Marketing & Brand Presence</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-border/40 rounded-none text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-surface-alt transition-all">
                        <Smartphone className="w-4 h-4" /> Preview App
                    </button>
                    <button
                        onClick={() => {
                            setModalType(activeTab === 'banners' ? 'banner' : 'offer');
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                    >
                        <Plus className="w-4 h-4" /> New {activeTab === 'banners' ? 'Banner' : 'Offer'}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-8 border-b border-border/40 pb-4">
                {[
                    { id: 'banners', label: 'App Banners', icon: ImageIcon },
                    { id: 'offers', label: 'Exclusive Offers', icon: Tag },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text'
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="tab-underline" className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'banners' && (
                    <motion.div
                        key="banners"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {banners.map((banner) => (
                            <div key={banner.id} className="group bg-surface border border-border/40 rounded-none overflow-hidden hover:border-primary/40 transition-all text-left">
                                <div className="aspect-[21/9] relative overflow-hidden bg-background">
                                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <button className="p-2 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                        <button className="p-2 bg-white text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest ${banner.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-surface-alt text-text-muted border border-border'
                                            }`}>
                                            {banner.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-sm font-black text-text uppercase tracking-tight mb-1">{banner.title}</h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest break-all">Link: {banner.link}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                            Edit Details <ArrowRight className="w-3 h-3" />
                                        </button>
                                        <div className="flex -space-x-1.5 grayscale opacity-50">
                                            {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full border border-surface-alt bg-background" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* New Banner Slot */}
                        <button
                            onClick={() => { setModalType('banner'); setIsModalOpen(true); }}
                            className="aspect-[21/9] sm:aspect-auto flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group min-h-[250px]"
                        >
                            <div className="w-12 h-12 rounded-none bg-surface-alt flex items-center justify-center border border-border group-hover:bg-primary group-hover:border-primary transition-all">
                                <Plus className="w-6 h-6 text-text-muted group-hover:text-white" />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-text uppercase tracking-widest">Add New Banner</p>
                                <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mt-1">Recommended: 1200 x 400px</p>
                            </div>
                        </button>
                    </motion.div>
                )}

                {activeTab === 'offers' && (
                    <motion.div
                        key="offers"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid sm:grid-cols-2 gap-6"
                    >
                        {offers.map((offer) => (
                            <div key={offer.id} className="bg-surface border border-border/40 p-8 flex flex-col md:flex-row gap-8 hover:border-violet-500/40 transition-all group relative text-left">
                                <div className="absolute top-0 right-0 p-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <button className="p-2 bg-surface-alt border border-border text-text-muted hover:text-primary"><Edit className="w-4 h-4" /></button>
                                    <button className="p-2 bg-surface-alt border border-border text-text-muted hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                                </div>

                                <div className="w-24 h-24 rounded-none bg-background border border-border/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-violet-500/20 transition-all">
                                    <Zap className="w-10 h-10 text-violet-500 animate-pulse" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest ${offer.status === 'Live' ? 'bg-emerald-500 text-white' : 'bg-surface-alt text-text-muted border border-border'
                                            }`}>
                                            {offer.status}
                                        </span>
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Ends: {offer.expiry}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-text uppercase tracking-tight">{offer.title}</h3>
                                        <p className="text-xs text-text-secondary mt-2 leading-relaxed">{offer.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-2 bg-background border border-border/40 border-dashed rounded-none text-xs font-black text-primary tracking-widest">
                                            {offer.code}
                                        </div>
                                        <button className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-violet-500 transition-colors">Apply Rules →</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface w-full max-w-xl rounded-none border border-border/40 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden relative"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-none bg-primary/5 flex items-center justify-center border border-primary/20">
                                            {modalType === 'banner' ? <ImageIcon className="w-6 h-6 text-primary" /> : <Tag className="w-6 h-6 text-primary" />}
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-2xl font-black text-text uppercase tracking-tight">
                                                {modalType === 'banner' ? 'Add New Banner' : 'Create Exclusive Offer'}
                                            </h2>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1 opacity-60">Mobile App Content System</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-10 h-10 border border-border/40 flex items-center justify-center text-text-muted hover:text-text transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form className="space-y-6 text-left" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                                    {modalType === 'banner' ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Banner Headline</label>
                                                <input required type="text" placeholder="e.g. Summer Special Sale" className="w-full px-5 py-4 bg-background border border-border/40 rounded-none text-sm font-bold focus:border-primary outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Target Redirection (Route)</label>
                                                <select className="w-full px-5 py-4 bg-background border border-border/40 rounded-none text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                                    <option>Home Page</option>
                                                    <option>Services List</option>
                                                    <option>Product Shop</option>
                                                    <option>Membership Plans</option>
                                                    <option>Specific Service/Product</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Banner Creative</label>
                                                <div className="border-2 border-dashed border-border/40 p-10 flex flex-col items-center justify-center gap-3 bg-background hover:border-primary/40 transition-all cursor-pointer group">
                                                    <Upload className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Click to upload high-res image</p>
                                                    <p className="text-[9px] text-text-muted font-bold opacity-40 uppercase tracking-[0.2em] mt-1">PNG, JPG, WEBP (Max 2MB)</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Offer Title</label>
                                                <input required type="text" placeholder="e.g. Bridal Glow Package" className="w-full px-5 py-4 bg-background border border-border/40 rounded-none text-sm font-bold focus:border-primary outline-none transition-all" />
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Promo Code</label>
                                                    <input required type="text" placeholder="GLOW50" className="w-full px-5 py-4 bg-background border border-border/40 rounded-none text-sm font-black text-primary focus:border-primary outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Expiry Date</label>
                                                    <input required type="date" className="w-full px-5 py-4 bg-background border border-border/40 rounded-none text-sm font-bold focus:border-primary outline-none transition-all" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Short Description</label>
                                                <textarea required rows="3" placeholder="Explain the value proposition..." className="w-full px-5 py-4 bg-background border border-border/40 rounded-none text-sm font-bold focus:border-primary outline-none transition-all resize-none"></textarea>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-4.5 border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4.5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all"
                                        >
                                            Publish Content
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
