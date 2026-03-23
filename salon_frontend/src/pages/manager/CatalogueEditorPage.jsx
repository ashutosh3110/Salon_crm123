import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Image as ImageIcon, RefreshCw,
    Facebook, Twitter, Linkedin, Instagram, Youtube,
    Type, Palette, AlignLeft, Eye, EyeOff, Layout, Plus, Trash2, ChevronRight, ChevronDown, Send, Edit3, DollarSign, Download
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import PremiumLanding from '../../components/catalogue/PremiumLanding';
import PremiumIndex from '../../components/catalogue/PremiumIndex';
import PremiumLookbook from '../../components/catalogue/PremiumLookbook';
import PremiumGrid from '../../components/catalogue/PremiumGrid';
import initialCatalogueData from '../../data/digitalCatalogueData.json';
import { useBusiness } from '../../contexts/BusinessContext';

export default function CatalogueEditorPage() {
    const { catalogue, catalogueLoading, updateCatalogue } = useBusiness();
    
    const [premiumConfig, setPremiumConfig] = useState(initialCatalogueData.premiumLanding);
    const [pages, setPages] = useState(initialCatalogueData.pages);
    const [showPreview, setShowPreview] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('landing'); // landing, pages, style, socials
    const [expandedPage, setExpandedPage] = useState(0);
    const [previewMode, setPreviewMode] = useState('landing'); // landing or page index
    const [isDownloading, setIsDownloading] = useState(false);

    // Sync state with backend data when loaded
    useEffect(() => {
        if (catalogue) {
            if (catalogue.premiumLanding) setPremiumConfig(catalogue.premiumLanding);
            if (catalogue.pages) setPages(catalogue.pages);
        }
    }, [catalogue]);

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
            const modes = ['landing', ...pages.map((_, i) => i)];

            for (let i = 0; i < modes.length; i++) {
                const mode = modes[i];
                if (log) log.innerText = `RENDERING PAGE ${i + 1} OF ${modes.length}...`;
                setPreviewMode(mode);
                await new Promise(r => setTimeout(r, 3000)); // Increased timeout for heavy assets

                const target = document.getElementById('preview-capture-area');
                if (!target) continue;

                // Bulletproof toJpeg options
                const imgData = await toJpeg(target, {
                    quality: 0.8,
                    pixelRatio: 1,
                    backgroundColor: mode === 'landing' ? '#000000' : '#ffffff',
                    cacheBust: true,
                    skipFontFace: true,
                    imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
                });

                if (imgData) {
                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
                }
            }

            pdf.save(`Catalogue_${Date.now()}.pdf`);
            alert("Digital Export Successful!");
        } catch (err) {
            console.error("PDF Export Error:", err);
            // More descriptive error reporting for better debugging
            if (log) log.innerText = `ERROR: ${err.message || String(err)}`;
            alert(`Export Error: ${err.message || String(err) || "Unknown Error"}`);
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

    const handleSave = async () => {
        setIsSaving(true);
        const fullData = { 
            premiumLanding: premiumConfig, 
            pages: pages, 
            theme: initialCatalogueData.theme,
            title: premiumConfig.titleText?.split('\n')[0] || 'My Catalogue'
        };
        
        try {
            await updateCatalogue(fullData);
            alert('Catalogue Published Successfully!');
        } catch (err) {
            console.error('Failed to save catalogue:', err);
            alert('Selection Error: Check connection.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden selection:bg-primary/20">
            {/* Left: Editor Panel */}
            <div className={`flex-1 w-full lg:max-w-xl border-r border-border overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-6 sm:space-y-8 bg-surface/10 ${showPreview ? 'hidden lg:block' : 'block'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden mb-6 sm:mb-8 text-left">
                    <div className="leading-none text-left">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none italic">Catalogue <span className="text-primary">Pro</span></h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">Console :: brand_registry_v5.0</p>
                    </div>
                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading || isSaving}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-all disabled:opacity-50"
                        >
                            {isDownloading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} PDF
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isDownloading}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                        >
                            {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Publish
                        </button>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-surface/50 backdrop-blur-md border border-border/60 rounded-2xl shadow-inner overflow-x-auto hide-scrollbar shrink-0">
                    {[
                        { id: 'landing', label: 'Landing', icon: ImageIcon },
                        { id: 'pages', label: 'Pages', icon: Layout },
                        { id: 'socials', label: 'Connect', icon: Send },
                        { id: 'style', label: 'Branding', icon: Palette }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-text-muted hover:bg-surface hover:text-text'}`}
                        >
                            <tab.icon className="w-3 h-3" />
                            <span>{tab.label}</span>
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

                {/* Padding for Bottom Bar on Mobile */}
                <div className="h-24 sm:h-0" />

                {/* Mobile Sticky Action Bar */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-xl border-t border-border z-[100] flex gap-3">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-text-muted active:bg-surface-alt transition-all"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isDownloading}
                        className="flex-[1.5] flex items-center justify-center gap-2 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Publish
                    </button>
                </div>
            </div>

            {/* Right: Live Preview */}
            <div className={`flex-[2] relative bg-black flex flex-col group/preview ${showPreview ? 'block' : 'hidden lg:flex'}`}>
                {/* Mode Switcher Overlay */}
                <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] p-1.5 bg-black/60 backdrop-blur-2xl border border-white/10 flex gap-2 items-center overflow-x-auto max-w-[95%] hide-scrollbar rounded-none">
                    <button
                        onClick={() => setPreviewMode('landing')}
                        className={`shrink-0 px-3 sm:px-4 py-2 text-[7px] sm:text-[8px] font-black uppercase tracking-widest transition-all ${previewMode === 'landing' ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    >
                        Landing
                    </button>
                    {pages.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPreviewMode(idx)}
                            className={`shrink-0 px-3 sm:px-4 py-2 text-[7px] sm:text-[8px] font-black uppercase tracking-widest transition-all ${previewMode === idx ? 'bg-primary text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            {p.title}
                        </button>
                    ))}
                </div>

                <div className="absolute bottom-4 right-4 z-[100] lg:hidden">
                    <button
                        onClick={() => setShowPreview(false)}
                        className="p-3 bg-white text-black rounded-full shadow-2xl flex items-center gap-2 border border-black/10"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Edit Mode</span>
                    </button>
                </div>

                <div id="preview-capture-area" className="flex-1 overflow-hidden">
                    {previewMode === 'landing' ? (
                        <PremiumLanding data={premiumConfig} />
                    ) : (
                        pages[previewMode].type === 'NEW_INDEX' ? (
                            <PremiumIndex data={pages[previewMode].config || pages[previewMode].content} />
                        ) : pages[previewMode].type === 'NEW_LOOKBOOK' ? (
                            <PremiumLookbook data={pages[previewMode].config || pages[previewMode].content} accentColor={premiumConfig.accentColor} />
                        ) : (
                            <PremiumGrid data={pages[previewMode].config || pages[previewMode].content} />
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

const EditorInput = ({ label, icon: Icon, value, onChange, placeholder, inputMode = "text" }) => (
    <div className="space-y-2 p-1">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">
            <Icon className="w-3.5 h-3.5 text-primary" /> {label}
        </label>
        <div className="flex items-center gap-4 bg-surface border border-border/60 rounded-2xl p-3 sm:p-2 px-5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all group shadow-sm sm:shadow-none translate-y-0 active:translate-y-[1px]">
            <input 
                type="text" 
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)} 
                className="flex-1 bg-transparent border-none py-2 sm:py-3 text-sm font-bold placeholder:text-text-muted/40 outline-none" 
                placeholder={placeholder}
                inputMode={inputMode}
                autoCapitalize="none"
                autoComplete="off"
            />
        </div>
    </div>
);

const EditorTextarea = ({ label, icon: Icon, value, onChange, placeholder }) => (
    <div className="space-y-2 p-1">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">
            <Icon className="w-3.5 h-3.5 text-primary" /> {label}
        </label>
        <div className="bg-surface border border-border/60 rounded-2xl p-3 sm:p-2 px-5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm sm:shadow-none active:translate-y-[1px]">
            <textarea 
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)} 
                rows={3} 
                className="w-full bg-transparent border-none py-2 sm:py-3 text-sm font-bold placeholder:text-text-muted/40 outline-none resize-none leading-relaxed" 
                placeholder={placeholder}
                autoCapitalize="sentences"
                autoComplete="off"
            />
        </div>
    </div>
);
