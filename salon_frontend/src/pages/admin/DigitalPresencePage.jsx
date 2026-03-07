import { useState, useEffect, useRef } from 'react';
import {
    Globe, Share2, QrCode, MessageSquare,
    Facebook, Instagram, Copy, CheckCircle,
    FileText, CloudUpload, ArrowRight, RefreshCw, Link as LinkIcon,
    Download, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

export default function DigitalPresence() {
    const [step, setStep] = useState('upload'); // 'upload', 'share'
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [copyStatus, setCopyStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(null); // 'qr' or 'poster'

    // Refs for capturing
    const qrSectionRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setLoading(true);
            setTimeout(() => {
                setUploadedFile(file);
                // Simulated public URL
                setFileUrl(`https://salon-profile.com/view/${Math.random().toString(36).substring(7)}`);
                setStep('share');
                setLoading(false);
            }, 1200);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    const handleShare = async (platform) => {
        const shareData = {
            title: 'Our Digital Catalogue',
            text: '✨ Check out our latest salon services and pricing! ✨',
            url: publicUrl
        };

        switch (platform) {
            case 'native':
                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                    } catch (err) {
                        console.log('Share failed', err);
                    }
                } else {
                    copyToClipboard(publicUrl);
                }
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + '\n' + shareData.url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`, '_blank');
                break;
            case 'instagram':
                copyToClipboard(publicUrl);
                alert('✨ Link copied! Paste this in your Instagram Bio to share your catalogue with followers.');
                break;
            default:
                copyToClipboard(publicUrl);
        }
    };

    const downloadQRImage = () => {
        setIsDownloading('qr');
        setTimeout(() => {
            const canvas = document.getElementById('qr-download-canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `Salon-QR-${uploadedFile?.name.replace('.pdf', '') || 'Catalogue'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
            setIsDownloading(null);
        }, 500);
    };


    const publicUrl = fileUrl || "https://salon-catalogue.com/premium-menu";

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Digital Presence
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        Sync your hardcopy menu with the digital world
                    </p>
                </div>

                {step === 'share' && (
                    <button
                        onClick={() => {
                            setStep('upload');
                            setUploadedFile(null);
                            setFileUrl(null);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm group"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> New Catalogue
                    </button>
                )}
            </header>

            <AnimatePresence mode="wait">
                {step === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-3xl mx-auto h-[60vh] flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 text-center"
                    >
                        <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-8 relative">
                            <CloudUpload className="w-12 h-12 text-primary" />
                            {loading && <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-[2rem] animate-spin" />}
                        </div>

                        <div className="space-y-4 mb-12">
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight italic">
                                {loading ? "Syncing Data..." : "Go Digital in Seconds"}
                            </h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
                                Upload your menu PDF. Our system will generate a smart QR code and a public link for your clients to access anywhere.
                            </p>
                        </div>

                        <label className="relative cursor-pointer group">
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={loading}
                            />
                            <div className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-black/20 hover:bg-black transition-all active:scale-95 flex items-center gap-4">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                {loading ? "PROCESSING..." : "SELECT CATALOGUE"}
                            </div>
                        </label>
                    </motion.div>
                )}

                {step === 'share' && (
                    <motion.div
                        key="share"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start mb-20"
                    >
                        {/* QR Code Section */}
                        <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                            <div ref={qrSectionRef} className="p-8 bg-white rounded-[2.5rem] mb-8 border border-slate-100 ring-8 ring-slate-50">
                                <QRCodeSVG value={publicUrl} size={220} level="H" includeMargin={false} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-2">Public QR Code</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-10">Scan to browse digital menu</p>

                            <div className="w-full space-y-3">
                                <button
                                    onClick={downloadQRImage}
                                    disabled={isDownloading}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isDownloading === 'qr' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />}
                                    DOWNLOAD QR IMAGE
                                </button>
                            </div>
                        </div>

                        {/* Social Share Section */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/20">
                                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                                        <Globe className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase italic">Public Stream</h3>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global access enabled</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Broadcasting Options</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleShare('whatsapp')}
                                            className="flex flex-col items-center justify-center gap-3 py-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white group"
                                        >
                                            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                                <MessageSquare className="w-5 h-5 text-[#25D366]" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('instagram')}
                                            className="flex flex-col items-center justify-center gap-3 py-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white group"
                                        >
                                            <div className="p-3 bg-pink-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                                <Instagram className="w-5 h-5 text-[#E4405F]" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="flex flex-col items-center justify-center gap-3 py-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white group"
                                        >
                                            <div className="p-3 bg-blue-600/20 rounded-xl group-hover:scale-110 transition-transform">
                                                <Facebook className="w-5 h-5 text-[#1877F2]" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('native')}
                                            className="flex flex-col items-center justify-center gap-3 py-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white group"
                                        >
                                            <div className="p-3 bg-primary/20 rounded-xl group-hover:scale-110 transition-transform">
                                                <LinkIcon className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Smart Share</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-12 p-6 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sharable Public Link</p>
                                        {copyStatus && <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">Copied!</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-black/30 rounded-xl px-4 py-3 text-xs font-bold text-white/40 truncate border border-white/5 italic">
                                            {publicUrl}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(publicUrl)}
                                            className={`p-4 rounded-xl transition-all ${copyStatus ? 'bg-emerald-500' : 'bg-primary hover:scale-105 active:scale-95 shadow-xl shadow-primary/20'}`}
                                        >
                                            {copyStatus ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center justify-between group overflow-hidden relative">
                                <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-primary transition-colors">
                                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{uploadedFile?.name || "premium_menu.pdf"}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Sync Active & Public
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Canvas for High-Quality Download */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                <QRCodeCanvas
                    id="qr-download-canvas"
                    value={publicUrl}
                    size={1024}
                    level="H"
                    includeMargin={true}
                />
            </div>
        </div>
    );
}
