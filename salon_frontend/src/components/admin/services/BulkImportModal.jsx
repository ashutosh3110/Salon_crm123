import React, { useState } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../../services/mock/mockApi';
import toast from 'react-hot-toast';

export default function BulkImportModal({ isOpen, onClose, onRefresh, outlets = [] }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'Name': 'Hair Cut',
                'Category': 'Hair',
                'Price': 500,
                'Duration (mins)': 30,
                'Outlets (Comma Separated)': outlets[0]?.name || 'Main Branch',
                'Description': 'Professional hair styling',
                'GST %': 18,
                'Commission Type': 'percent',
                'Commission Value': 10
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Services');
        
        // Add a "Help" sheet with existing outlets
        const helpData = outlets.map(o => ({ 'Available Outlets': o.name }));
        const wsHelp = XLSX.utils.json_to_sheet(helpData);
        XLSX.utils.book_append_sheet(wb, wsHelp, 'Instructions');

        XLSX.writeFile(wb, 'Salon_Services_Template.xlsx');
        toast.success('Template downloaded!');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Sending bulk import request to:', api.defaults.baseURL + '/services/bulk-import');
            const response = await api.post('/services/bulk-import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResult(response.data);
            if (response.data.success) {
                toast.success(`Successfully imported ${response.data.importedCount} services!`);
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error.response?.data?.message || 'Failed to import services');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface-hover/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text tracking-tighter uppercase leading-none">Bulk Service Import</h2>
                            <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-widest opacity-60">Upload multiple services via Excel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-hover transition-colors rounded-none">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {!result ? (
                        <>
                            {/* Template Download Section */}
                            <div className="p-6 border border-dashed border-border flex flex-col items-center text-center gap-4 bg-surface-hover/20">
                                <div className="w-12 h-12 rounded-none bg-primary/5 flex items-center justify-center">
                                    <Download className="w-6 h-6 text-primary/40" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-text uppercase tracking-wider mb-1">New to bulk import?</h3>
                                    <p className="text-[10px] font-black text-text-muted uppercase leading-relaxed max-w-[280px]">
                                        Download our pro-template, fill in your services, and upload it back here.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Template
                                </button>
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block">Select Source File (.xlsx, .csv)</span>
                                    <div className={`relative group border-2 border-dashed transition-all duration-300 ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                        <input 
                                            type="file" 
                                            accept=".xlsx, .xls, .csv"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="p-8 flex flex-col items-center gap-3">
                                            {file ? (
                                                <>
                                                    <FileText className="w-8 h-8 text-primary animate-bounce-slow" />
                                                    <span className="text-xs font-black text-text uppercase tracking-tight truncate max-w-full">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                                                        {(file.size / 1024).toFixed(1)} KB • Ready to Import
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors stroke-[1.5px]" />
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-text transition-colors">
                                                        Drop Excel file here
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 disabled:opacity-30 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing Catalog...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Initialize Import
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        /* Result View */
                        <div className="py-2 animate-in slide-in-from-bottom-4 duration-500">
                            <div className={`p-8 border ${result.errors ? 'border-orange-500/20 bg-orange-500/5' : 'border-emerald-500/20 bg-emerald-500/5'} text-center space-y-6`}>
                                <div className="flex justify-center">
                                    {result.errors ? (
                                        <div className="w-16 h-16 rounded-none bg-orange-500/10 flex items-center justify-center">
                                            <AlertCircle className="w-8 h-8 text-orange-500" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-none bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-text uppercase tracking-tighter leading-none">
                                        {result.importedCount} Services Sync'd
                                    </h3>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">
                                        From {result.totalRows} data entries identified
                                    </p>
                                </div>

                                {result.errors && (
                                    <div className="text-left border-t border-border/20 pt-6 mt-6 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                        <p className="text-[9px] font-black text-text uppercase tracking-widest mb-3 opacity-60">Status Logs:</p>
                                        <ul className="space-y-2">
                                            {result.errors.map((err, i) => (
                                                <li key={i} className="flex gap-2 text-[9px] font-black text-orange-500 uppercase leading-none">
                                                    <span className="flex-shrink-0">•</span>
                                                    <span>{err}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setFile(null);
                                    }}
                                    className="w-full py-4 border border-border hover:bg-surface-hover text-[10px] font-black uppercase tracking-widest transition-colors"
                                >
                                    Import More Data
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-surface-hover/30 text-center border-t border-border">
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] leading-none">
                        Wapixo Data Nexus • Pro Implementation
                    </p>
                </div>
            </div>
        </div>
    );
}
