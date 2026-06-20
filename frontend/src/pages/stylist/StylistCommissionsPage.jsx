import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function StylistCommissionsPage() {
    const [commissions, setCommissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState('CURRENT_CYCLE'); // CURRENT_CYCLE | PREVIOUS_CYCLE | FISCAL_YTD

    const fetchCommissions = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const res = await api.get(`/hr/commissions/me?period=${period}`);
            if (res.data && res.data.success) {
                setCommissions(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching commissions:', err);
            toast.error('Failed to load earnings data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [period]);

    useEffect(() => {
        fetchCommissions();
    }, [fetchCommissions]);

    const getPeriodLabel = () => {
        if (period === 'PREVIOUS_CYCLE') return 'Last Month';
        if (period === 'FISCAL_YTD') return 'Year to Date';
        return 'This Month';
    };

    const stats = commissions?.stats || [];
    const earningsHistory = commissions?.earningsHistory || [];

    const totalEarnedVal = stats.find(s => s.key === 'totalEarned')?.value || '₹0';
    const baseSalaryVal = stats.find(s => s.key === 'baseAllocation')?.value || '₹0';
    const yieldUnitsVal = stats.find(s => s.key === 'yieldUnits')?.value || '0';
    const repIndexVal = stats.find(s => s.key === 'repIndex')?.value || 'N/A';

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm font-sans">
            
            {/* Header / Title area */}
            <div className="flex items-center justify-between px-5 pt-6 pb-2">
                <h1 className="text-[18px] lg:text-[22px] font-bold text-slate-900 dark:text-white">
                    Earnings
                </h1>
                <button 
                    onClick={() => fetchCommissions(true)} 
                    disabled={loading || refreshing}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                    {refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                </button>
            </div>

            {/* Period Selector Tabs */}
            <div className="px-5 pt-2 pb-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 min-w-max">
                    <button
                        onClick={() => setPeriod('CURRENT_CYCLE')}
                        className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                            period === 'CURRENT_CYCLE'
                                ? 'bg-[#7C3AED] text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        This Month
                    </button>
                    <button
                        onClick={() => setPeriod('PREVIOUS_CYCLE')}
                        className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                            period === 'PREVIOUS_CYCLE'
                                ? 'bg-[#7C3AED] text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        Last Month
                    </button>
                    <button
                        onClick={() => setPeriod('FISCAL_YTD')}
                        className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                            period === 'FISCAL_YTD'
                                ? 'bg-[#7C3AED] text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        This Year (YTD)
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                    <span className="text-[13px] font-medium">Loading earnings...</span>
                </div>
            ) : (
                <div className="px-5 pb-8 overflow-y-auto no-scrollbar flex-1">
                    {/* Purple Hero Card */}
                    <div className="bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] rounded-[20px] p-5 relative overflow-hidden shadow-lg shadow-[#6D28D9]/20 text-white mb-6">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold text-white/90 mb-1 tracking-wide uppercase">{getPeriodLabel()}</span>
                                <span className="text-[32px] font-black tracking-tight leading-none mb-1">{totalEarnedVal}</span>
                                <span className="text-[11px] font-semibold text-white/80">Commission Earned</span>
                            </div>
                            <div className="w-10 h-10 border border-white/20 rounded-xl flex items-center justify-center bg-white/10 shrink-0">
                                <Wallet className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-4 px-1 mb-8">
                        <div className="flex justify-between items-center">
                            <span className="text-[13px] font-bold text-[#4B5563] dark:text-slate-300">Base Salary</span>
                            <span className="text-[13px] font-black text-slate-900 dark:text-white">{baseSalaryVal}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[13px] font-bold text-[#4B5563] dark:text-slate-300">Items Processed</span>
                            <span className="text-[13px] font-black text-slate-900 dark:text-white">{yieldUnitsVal}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[13px] font-bold text-[#4B5563] dark:text-slate-300">Quality Rating</span>
                            <span className="text-[13px] font-black text-slate-900 dark:text-white">{repIndexVal} / 5.0</span>
                        </div>
                    </div>

                    {/* Earnings History Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 p-4 overflow-hidden mb-8">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Earnings History</h3>
                        </div>

                        {earningsHistory.length === 0 ? (
                            <div className="py-6 text-center text-slate-500 text-[13px] font-medium">
                                No history records found for this period.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {earningsHistory.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 gap-3">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate block">{item.services}</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{item.date}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[13px] font-black text-slate-900 dark:text-white block">₹{item.commission}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] inline-block mt-0.5 ${item.status === 'SETTLED' ? 'bg-[#E6F8EF] text-[#059669]' : 'bg-[#FFF0E6] text-[#EA580C]'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Added extra padding at the bottom so it doesn't get covered by the mobile navbar */}
            <div className="h-20 lg:h-0 flex-shrink-0" />
        </div>
    );
}
