import { useState, useEffect } from 'react';
import { Database, Download, Upload, RefreshCw, Calendar, FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function SADatabaseBackupPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [backingUp, setBackingUp] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/super-admin/database/backup/history');
            if (res.data?.success) {
                setHistory(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch backup history:', err);
            showToast('Failed to load backup logs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleBackup = async () => {
        setBackingUp(true);
        showToast('Initiating database backup generation...', 'info');
        try {
            // Trigger backup endpoint with responseType blob to handle file stream download
            const response = await api.get('/super-admin/database/backup/json', {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Extract filename from headers if possible or generate one
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('download', `backup-${timestamp}.json`);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showToast('Backup downloaded successfully!');
            // Refresh logs
            fetchHistory();
        } catch (err) {
            console.error('Backup failed:', err);
            showToast('Failed to generate or download database backup.', 'error');
            fetchHistory(); // Still fetch history to show any logged failure
        } finally {
            setBackingUp(false);
        }
    };

    const handleRestoreClick = () => {
        if (!selectedFile) {
            showToast('Please select a backup file first.', 'error');
            return;
        }
        setShowRestoreConfirm(true);
    };

    const handleConfirmRestore = async () => {
        setShowRestoreConfirm(false);
        setRestoring(true);
        showToast('Restoring database from backup...', 'info');

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    const response = await api.post('/super-admin/database/restore', backupData);
                    if (response.data?.success) {
                        showToast('Database restored! Redirecting to login...', 'success');
                        setSelectedFile(null);
                        const fileInput = document.getElementById('restore-file-input');
                        if (fileInput) fileInput.value = '';
                        
                        setTimeout(() => {
                            localStorage.clear();
                            window.location.href = '/superadmin/login';
                        }, 2500);
                    } else {
                        showToast(response.data?.message || 'Restore failed.', 'error');
                    }
                } catch (parseErr) {
                    console.error(parseErr);
                    showToast('Invalid JSON file format.', 'error');
                } finally {
                    setRestoring(false);
                }
            };
            reader.readAsText(selectedFile);
        } catch (err) {
            console.error('Restore failed:', err);
            showToast('Failed to restore database.', 'error');
            setRestoring(false);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) + ', ' + date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Calculate last backup date
    const lastSuccessfulBackup = history.find(h => h.status === 'success');
    const lastBackupTime = lastSuccessfulBackup ? formatDate(lastSuccessfulBackup.createdAt) : 'No backups found';

    return (
        <div className="space-y-6 pb-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                    {toast.type === 'error' ? (
                        <XCircle className="w-4 h-4 shrink-0" />
                    ) : toast.type === 'info' ? (
                        <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                    ) : (
                        <CheckCircle className="w-4 h-4 shrink-0" />
                    )}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight">Database Backup</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Manage and download your MongoDB backups</p>
                </div>
                <button
                    onClick={fetchHistory}
                    disabled={loading}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white border border-border hover:border-primary/30 text-text-secondary hover:text-primary transition-all rounded-xl shadow-sm text-xs font-bold"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Logs</span>
                </button>
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Backup Actions Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Database className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-text text-sm">Database Controls</h3>
                                <p className="text-[11px] text-text-muted mt-0.5">Generate fresh system snapshots</p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4 space-y-4">
                            <div>
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">Last Successful Backup</span>
                                <span className="text-sm font-semibold text-text mt-1 block">{lastBackupTime}</span>
                            </div>

                            <button
                                onClick={handleBackup}
                                disabled={backingUp}
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#B4912B] via-[#C69F32] to-[#8B6F23] text-white text-sm font-bold hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#B4912B]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {backingUp ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Generating Backup...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        <span>Download Backup</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 space-y-2.5">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">Important Security Notice</span>
                            </div>
                            <p className="leading-relaxed">
                                This backup contains a complete snapshot of all platform data, including salons, users, staff, bookings, billing, memberships, inventory, CRM, settings, and reports.
                            </p>
                            <p className="leading-relaxed font-semibold">
                                Please store the backup file in a secure, encrypted location to protect client confidentiality.
                            </p>
                        </div>
                    </div>

                    {/* Restore Backup Card */}
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-text text-sm">Restore Database</h3>
                                <p className="text-[11px] text-text-muted mt-0.5">Restore system data from a JSON snapshot</p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">Choose Backup File</label>
                                <input
                                    id="restore-file-input"
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                />
                            </div>

                            <button
                                onClick={handleRestoreClick}
                                disabled={restoring || !selectedFile}
                                className="w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {restoring ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Restoring Database...</span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Restore Backup</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Backup History Listing */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-border text-text-secondary flex items-center justify-center shrink-0">
                                    <FileText className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text text-sm">Backup History & Audit Logs</h3>
                                    <p className="text-[11px] text-text-muted mt-0.5">Audit log of database snapshot downloads</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">Loading History...</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                    <Database className="w-10 h-10 text-text-muted/40 mb-3" />
                                    <h4 className="font-bold text-text text-sm">No Backups Found</h4>
                                    <p className="text-xs text-text-muted mt-1 max-w-[280px]">Generate your first database backup by clicking the button on the left.</p>
                                </div>
                            ) : (
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-border bg-slate-50/50 text-[10px] font-black text-text-muted uppercase tracking-wider">
                                            <th className="py-3 px-5">Date & Time</th>
                                            <th className="py-3 px-5">Backup Size</th>
                                            <th className="py-3 px-5">Performed By</th>
                                            <th className="py-3 px-5">IP Address</th>
                                            <th className="py-3 px-5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border text-xs">
                                        {history.map((log) => (
                                            <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="py-4 px-5 font-semibold text-text whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                        <span>{formatDate(log.createdAt)}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 font-semibold text-text-secondary whitespace-nowrap">
                                                    {log.status === 'success' ? formatBytes(log.size) : '—'}
                                                </td>
                                                <td className="py-4 px-5 text-text-secondary">
                                                    <div className="font-semibold text-text">{log.performedBy?.name || 'Unknown'}</div>
                                                    <div className="text-[10px] text-text-muted mt-0.5">{log.performedBy?.email || 'N/A'}</div>
                                                </td>
                                                <td className="py-4 px-5 font-mono text-[11px] text-text-muted">
                                                    {log.ipAddress}
                                                </td>
                                                <td className="py-4 px-5 text-right whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                        log.status === 'success'
                                                            ? 'bg-green-50 border-green-200 text-green-700'
                                                            : 'bg-red-50 border-red-200 text-red-700'
                                                    }`}>
                                                        {log.status === 'success' ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3" />
                                                                <span>Success</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3 h-3" />
                                                                <span>Failed</span>
                                                            </>
                                                        )}
                                                    </span>
                                                    {log.errorMessage && (
                                                        <div className="text-[9px] text-red-500 font-medium mt-1 max-w-[200px] truncate" title={log.errorMessage}>
                                                            {log.errorMessage}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Confirmation Dialog Modal */}
            {showRestoreConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
                    <div className="bg-white border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <AlertTriangle className="w-6 h-6 animate-bounce" />
                            </div>
                            <h3 className="text-lg font-black text-text uppercase tracking-tight">Warning!</h3>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-text-secondary leading-relaxed font-semibold">
                                Current database ka sara data permanently delete ho jayega.
                            </p>
                            <p className="text-xs text-text-muted leading-relaxed">
                                System will automatically create a safety backup before applying the restore.
                            </p>
                            <p className="text-sm font-black text-red-600 uppercase tracking-wider">
                                Are you sure?
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowRestoreConfirm(false)}
                                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text uppercase tracking-wider transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRestore}
                                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/25 hover:bg-red-700 active:scale-95 transition-all"
                            >
                                Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
