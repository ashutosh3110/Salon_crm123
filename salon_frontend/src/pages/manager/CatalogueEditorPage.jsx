import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Image as ImageIcon, RefreshCw,
    Facebook, Twitter, Linkedin, Instagram, Youtube,
    Type, Palette, AlignLeft, Eye, EyeOff, Layout, Plus, Trash2, ChevronRight, ChevronDown, Send, Edit3, DollarSign, Download
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PremiumLanding from '../../components/catalogue/PremiumLanding';
import PremiumIndex from '../../components/catalogue/PremiumIndex';
import PremiumLookbook from '../../components/catalogue/PremiumLookbook';
import PremiumGrid from '../../components/catalogue/PremiumGrid';
import initialCatalogueData from '../../data/digitalCatalogueData.json';

export default function CatalogueEditorPage() {
    const [premiumConfig, setPremiumConfig] = useState(initialCatalogueData.premiumLanding);
    const [pages, setPages] = useState(initialCatalogueData.pages);
    const [showPreview, setShowPreview] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('landing'); // landing, pages, style, socials
    const [expandedPage, setExpandedPage] = useState(0);
    const [previewMode, setPreviewMode] = useState('landing'); // landing or page index
    const [isDownloading, setIsDownloading] = useState(false);

    const handleLandingUpdate = (field, value) => {
        setPremiumConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleDownloadPDF = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        console.log("PDF SYSTEM: Engaging Total System Interceptor...");

        const overlay = document.createElement('div');
        overlay.innerHTML = `
            <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:sans-serif;text-align:center;">
                <div style="width:50px;height:50px;border:5px solid rgba(255,255,255,0.1);border-top-color:#e11d48;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:24px;"></div>
                <h2 style="font-weight:900;letter-spacing:10px;font-size:20px;margin:0;">SECURE RENDER</h2>
                <p id="pdf-log" style="margin-top:12px;font-size:12px;opacity:0.4;font-family:monospace;letter-spacing:2px;">GENERATING CATALOGUE...</p>
                <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
            </div>
        `;
        document.body.appendChild(overlay);
        const log = document.getElementById('pdf-log');

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = pdf.internal.pageSize.getHeight();
            const modes = ['landing', ...pages.map((_, i) => i).filter(i => pages[i]?.type?.startsWith('NEW_'))];

            for (let i = 0; i < modes.length; i++) {
                const mode = modes[i];
                if (log) log.innerText = `READYING ${i + 1}/${modes.length}`;
                setPreviewMode(mode);
                await new Promise(r => setTimeout(r, 4500));

                const target = document.getElementById('preview-capture-area');
                if (!target) continue;

                const canvas = await html2canvas(target, {
                    scale: 1,
                    useCORS: true,
                    backgroundColor: mode === 'landing' ? '#000000' : '#ffffff',
                });

                if (canvas.width > 0) {
                    const imgData = canvas.toDataURL('image/jpeg', 0.9);
                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
                }
            }

            pdf.save(`Catalogue_${Date.now()}.pdf`);
            alert("Digital Export Successful!");
        } catch (err) {
            console.error("Shield Error:", err);
            alert("Export Error. Please try refreshing the page.");
        } finally {
            if (document.body.contains(overlay)) {
                overlay.remove();
            }
            setIsDownloading(false);
            setPreviewMode('landing');
        }
    };

    const handleSocialUpdate = (platform, value) => {
        setPremiumConfig(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [platform]: value }
        }));
    };

    const handlePageConfigUpdate = (pIdx, field, value, nestedField = null) => {
        const newPages = [...pages];
        if (nestedField) {
            newPages[pIdx].config[field][nestedField] = value;
        } else {
            newPages[pIdx].config[field] = value;
        }
        setPages(newPages);
    };

    const handleSave = () => {
        setIsSaving(true);
        const fullData = { premiumLanding: premiumConfig, pages: pages, theme: initialCatalogueData.theme };
        localStorage.setItem('digital_catalogue_full', JSON.stringify(fullData));

        setTimeout(() => {
            setIsSaving(false);
            alert('Settings saved to local storage! View at /c/preview');
        }, 1200);
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden selection:bg-primary/20">
            {/* Left: Editor Panel */}
            <div className={`flex-1 min-w-[450px] border-r border-border overflow-y-auto custom-scrollbar p-8 space-y-8 bg-surface/10 ${showPreview ? 'lg:max-w-xl' : ''}`}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-text italic">CATALOGUE <span className="text-primary">PRO</span></h1>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Management Console</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading || isSaving}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-3 px-6 py-3 rounded-2xl transition-all disabled:opacity-50"
                        >
                            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isDownloading ? 'EXPORTING...' : 'PDF'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isDownloading}
                            className="btn-salon flex items-center gap-3 px-8"
                        >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'SAVING...' : 'PUBLISH'}
                        </button>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-2 p-1.5 bg-surface/50 backdrop-blur-md border border-border/60 rounded-2xl shadow-inner">
                    {[
                        { id: 'landing', label: 'Landing', icon: ImageIcon },
                        { id: 'pages', label: 'Pages', icon: Layout },
                        { id: 'socials', label: 'Connect', icon: Send },
                        { id: 'style', label: 'Branding', icon: Palette }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-text-muted hover:bg-surface hover:text-text'}`}
                        >
                            <tab.icon className="w-3 h-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Editor Content Area */}
                <div className="min-h-[60vh]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'landing' && (
                            <motion.div key="landing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <SectionHeader title="Visual Content" subtitle="Hero Section & Cover" />
                                <EditorInput label="Background Image" icon={ImageIcon} value={premiumConfig.backgroundImage} onChange={(v) => handleLandingUpdate('backgroundImage', v)} />
                                <EditorTextarea label="Cover Title" icon={Type} value={premiumConfig.titleText} onChange={(v) => handleLandingUpdate('titleText', v)} />
                                <EditorInput label="Sub-tagline" icon={AlignLeft} value={premiumConfig.tagline} onChange={(v) => handleLandingUpdate('tagline', v)} />
                            </motion.div>
                        )}

                        {activeTab === 'pages' && (
                            <motion.div key="pages" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                <SectionHeader title="Menu Structure" subtitle="Dynamic Layouts" />
                                {pages.map((page, pIdx) => {
                                    if (page.type !== 'NEW_INDEX' && page.type !== 'NEW_LOOKBOOK' && page.type !== 'NEW_GRID') return null;
                                    return (
                                        <div key={pIdx} className="bg-surface border border-border/60 rounded-3xl overflow-hidden">
                                            <button
                                                onClick={() => {
                                                    setExpandedPage(expandedPage === pIdx ? null : pIdx);
                                                    setPreviewMode(pIdx);
                                                }}
                                                className="w-full flex items-center justify-between p-6 hover:bg-surface-alt transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl font-black text-primary/20 italic">0{pIdx + 1}</span>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{page.type.split('_').join(' ')}</p>
                                                        <p className="text-sm font-bold uppercase">{page.title}</p>
                                                    </div>
                                                </div>
                                                {expandedPage === pIdx ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>

                                            {expandedPage === pIdx && (
                                                <div className="p-6 pt-0 border-t border-border/40 space-y-6">
                                                    {page.type === 'NEW_INDEX' && (
                                                        <div className="space-y-4 pt-4">
                                                            <EditorInput label="Main Title" icon={Type} value={page.config.indexTitle} onChange={(v) => handlePageConfigUpdate(pIdx, 'indexTitle', v)} />
                                                            <div className="p-4 bg-surface-alt rounded-2xl space-y-4">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Numbered Sections</p>
                                                                {page.config.sections.map((sec, sIdx) => (
                                                                    <div key={sIdx} className="p-4 border border-border/40 rounded-xl space-y-3">
                                                                        <EditorInput label={`Section ${sec.id} Title`} icon={Type} value={sec.title} onChange={(v) => {
                                                                            const newSecs = [...pages[pIdx].config.sections];
                                                                            newSecs[sIdx].title = v;
                                                                            handlePageConfigUpdate(pIdx, 'sections', newSecs);
                                                                        }} />
                                                                        <EditorTextarea label="Description" icon={AlignLeft} value={sec.desc} onChange={(v) => {
                                                                            const newSecs = [...pages[pIdx].config.sections];
                                                                            newSecs[sIdx].desc = v;
                                                                            handlePageConfigUpdate(pIdx, 'sections', newSecs);
                                                                        }} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <EditorInput label="Welcome Title" icon={Type} value={page.config.welcomeTitle} onChange={(v) => handlePageConfigUpdate(pIdx, 'welcomeTitle', v)} />
                                                            <EditorTextarea label="Welcome Message" icon={AlignLeft} value={page.config.welcomeMessage} onChange={(v) => handlePageConfigUpdate(pIdx, 'welcomeMessage', v)} />
                                                            <EditorInput label="Hero Image" icon={ImageIcon} value={page.config.heroImage} onChange={(v) => handlePageConfigUpdate(pIdx, 'heroImage', v)} />
                                                            <EditorInput label="Sidebar Text" icon={AlignLeft} value={page.config.sideText} onChange={(v) => handlePageConfigUpdate(pIdx, 'sideText', v)} />
                                                        </div>
                                                    )}

                                                    {page.type === 'NEW_LOOKBOOK' && (
                                                        <div className="space-y-4 pt-4">
                                                            <EditorInput label="Page Title" icon={Type} value={page.config.title} onChange={(v) => handlePageConfigUpdate(pIdx, 'title', v)} />
                                                            <EditorInput label="Model Image" icon={ImageIcon} value={page.config.modelImage} onChange={(v) => handlePageConfigUpdate(pIdx, 'modelImage', v)} />
                                                            <EditorInput label="Product Image" icon={ImageIcon} value={page.config.productImage} onChange={(v) => handlePageConfigUpdate(pIdx, 'productImage', v)} />
                                                            <EditorInput label="Product Name" icon={Edit3} value={page.config.productName} onChange={(v) => handlePageConfigUpdate(pIdx, 'productName', v)} />
                                                            <EditorInput label="Price" icon={DollarSign} value={page.config.price} onChange={(v) => handlePageConfigUpdate(pIdx, 'price', v)} />
                                                            <EditorTextarea label="Description" icon={AlignLeft} value={page.config.description} onChange={(v) => handlePageConfigUpdate(pIdx, 'description', v)} />
                                                        </div>
                                                    )}

                                                    {page.type === 'NEW_GRID' && (
                                                        <div className="space-y-6 pt-4">
                                                            <EditorInput label="Header Title" icon={Type} value={page.config.title} onChange={(v) => handlePageConfigUpdate(pIdx, 'title', v)} />
                                                            <div className="p-4 bg-surface-alt rounded-2xl space-y-4">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Top Hero Section</p>
                                                                <EditorInput label="Large Image URL" icon={ImageIcon} value={page.config.topSection.image} onChange={(v) => handlePageConfigUpdate(pIdx, 'topSection', v, 'image')} />
                                                                <EditorInput label="Detail Item Name" icon={Edit3} value={page.config.topSection.detail.name} onChange={(v) => {
                                                                    const newTop = { ...pages[pIdx].config.topSection };
                                                                    newTop.detail.name = v;
                                                                    handlePageConfigUpdate(pIdx, 'topSection', newTop);
                                                                }} />
                                                            </div>
                                                            <div className="space-y-4">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary px-4">Bottom Grid Items</p>
                                                                {page.config.bottomSection.items.map((item, iIdx) => (
                                                                    <div key={iIdx} className="p-4 bg-surface-alt rounded-2xl border border-border/40 space-y-3 mx-4">
                                                                        <EditorInput label={`Item ${iIdx + 1} Name`} icon={Type} value={item.name} onChange={(v) => {
                                                                            const newItems = [...pages[pIdx].config.bottomSection.items];
                                                                            newItems[iIdx].name = v;
                                                                            const newBottom = { ...pages[pIdx].config.bottomSection, items: newItems };
                                                                            handlePageConfigUpdate(pIdx, 'bottomSection', newBottom);
                                                                        }} />
                                                                        <EditorInput label="Image URL" icon={ImageIcon} value={item.image} onChange={(v) => {
                                                                            const newItems = [...pages[pIdx].config.bottomSection.items];
                                                                            newItems[iIdx].image = v;
                                                                            const newBottom = { ...pages[pIdx].config.bottomSection, items: newItems };
                                                                            handlePageConfigUpdate(pIdx, 'bottomSection', newBottom);
                                                                        }} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}

                        {activeTab === 'socials' && (
                            <motion.div key="socials" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <SectionHeader title="Social Footprint" subtitle="External Connections" />
                                {['instagram', 'facebook', 'youtube', 'twitter', 'linkedin'].map(soc => (
                                    <EditorInput key={soc} label={soc} icon={Type} value={premiumConfig.socialLinks[soc]} onChange={(v) => handleSocialUpdate(soc, v)} />
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'style' && (
                            <motion.div key="style" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <SectionHeader title="Brand Assets" subtitle="Identity & Colors" />
                                <EditorInput label="Overlay Logo URL" icon={ImageIcon} value={premiumConfig.brandLogo} onChange={(v) => handleLandingUpdate('brandLogo', v)} />
                                <div className="space-y-4 p-6 bg-surface border border-border/40 rounded-3xl">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">Accent Color</label>
                                    <input type="color" value={premiumConfig.accentColor || '#ffffff'} onChange={(e) => handleLandingUpdate('accentColor', e.target.value)} className="w-full h-12 rounded-xl" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right: Live Preview */}
            <div className="flex-[2] relative bg-black flex flex-col group/preview">
                {/* Mode Switcher Overlay */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] p-1.5 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl flex gap-1 items-center">
                    <button
                        onClick={() => setPreviewMode('landing')}
                        className={`shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${previewMode === 'landing' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    >
                        Landing
                    </button>
                    {pages.map((p, idx) => (
                        (p.type && p.type.startsWith('NEW_')) &&
                        <button
                            key={idx}
                            onClick={() => setPreviewMode(idx)}
                            className={`shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${previewMode === idx ? 'bg-primary text-white shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            {p.title}
                        </button>
                    ))}
                </div>

                <div id="preview-capture-area" className="flex-1 overflow-hidden">
                    {previewMode === 'landing' ? (
                        <PremiumLanding data={premiumConfig} />
                    ) : (
                        pages[previewMode].type === 'NEW_INDEX' ? (
                            <PremiumIndex data={pages[previewMode].config} />
                        ) : pages[previewMode].type === 'NEW_LOOKBOOK' ? (
                            <PremiumLookbook data={pages[previewMode].config} accentColor={premiumConfig.accentColor} />
                        ) : (
                            <PremiumGrid data={pages[previewMode].config} />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-8 p-6 bg-gradient-to-r from-surface to-transparent rounded-l-3xl border-l-4 border-primary">
        <h3 className="text-sm font-black text-text uppercase tracking-widest leading-none">{title}</h3>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mt-1">{subtitle}</p>
    </div>
);

const EditorInput = ({ label, icon: Icon, value, onChange, placeholder }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">
            <Icon className="w-3 h-3 text-primary" /> {label}
        </label>
        <div className="flex items-center gap-4 bg-surface border border-border/60 rounded-3xl p-2 px-5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all group">
            <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent border-none py-3 text-sm font-bold placeholder:text-text-muted/40 outline-none" placeholder={placeholder} />
        </div>
    </div>
);

const EditorTextarea = ({ label, icon: Icon, value, onChange, placeholder }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">
            <Icon className="w-3 h-3 text-primary" /> {label}
        </label>
        <div className="bg-surface border border-border/60 rounded-3xl p-2 px-5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-transparent border-none py-3 text-sm font-bold placeholder:text-text-muted/40 outline-none resize-none leading-relaxed" placeholder={placeholder} />
        </div>
    </div>
);
