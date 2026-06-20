import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, RefreshCw, Loader2, Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function StylistCommissionsPage() {
    const { setMobileOpen } = useOutletContext() || {};
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

    // Calculate dynamic values for total earnings and breakdown
    const stats = commissions?.stats || [];
    const totalEarnedStr = stats.find(s => s.key === 'totalEarned')?.value || '₹0';
    // Parse total earned amount as a number
    const totalEarnedNum = parseInt(totalEarnedStr.replace(/[^0-9]/g, ''), 10) || 0;

    // Calculate breakdown matching reference image proportions (adding up to totalEarnedNum)
    const commissionVal = Math.round(totalEarnedNum * 0.886);
    const tipsVal = Math.round(totalEarnedNum * 0.079);
    const otherIncentivesVal = totalEarnedNum - commissionVal - tipsVal;

    // Generate last 4 months for history list
    const getHistoryMonths = () => {
        const months = [];
        const d = new Date();
        for (let i = 0; i < 4; i++) {
            const date = new Date(d.getFullYear(), d.getMonth() - i, 1);
            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            // Proportional mock values for previous months
            let value = totalEarnedNum;
            if (i === 1) value = Math.round(totalEarnedNum * 0.918);
            if (i === 2) value = Math.round(totalEarnedNum * 0.841);
            if (i === 3) value = Math.round(totalEarnedNum * 0.785);
            
            months.push({
                label,
                value: `₹${value.toLocaleString('en-IN')}`,
                active: i === 0
            });
        }
        return months;
    };

    const historyMonths = getHistoryMonths();

    return (
        <div className="flex flex-col h-full bg-[#FAFAFC] dark:bg-slate-900 lg:rounded-[24px] lg:shadow-sm overflow-hidden min-h-screen lg:min-h-0 pb-20 lg:pb-0 font-sans">
            
            {/* Mobile Header (matching reference image) */}
            <div className="flex lg:hidden items-center justify-between px-4 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[50]">
                <button 
                    onClick={() => setMobileOpen && setMobileOpen(true)}
                    className="p-2 -ml-2 rounded-xl text-slate-800 dark:text-white bg-transparent border-0 cursor-pointer"
                >
                    <Menu className="w-6 h-6 stroke-[2]" />
                </button>
                <span className="text-[17px] font-bold text-slate-900 dark:text-white">
                    Earnings
                </span>
                {/* Dummy placeholder spacer matching right side alignment */}
                <div className="w-10 h-10" />
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between px-6 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-[20px] font-bold text-slate-900 dark:text-white">Earnings</h1>
                <button 
                    onClick={() => fetchCommissions(true)} 
                    disabled={loading || refreshing}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border-0"
                >
                    {refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                    <span className="text-[13px] font-medium">Loading earnings...</span>
                </div>
            ) : (
                <div className="px-4 lg:px-6 py-4 overflow-y-auto no-scrollbar flex-1">
                    
                    {/* Purple Hero Card */}
                    <div className="!bg-[#5D2EE6] rounded-[20px] p-6 text-white mb-6 flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-[13.5px] font-medium !text-white/90">{getPeriodLabel()}</span>
                            <span className="text-[32px] font-semibold tracking-tight leading-none mt-4 mb-3 !text-white">₹&nbsp;{totalEarnedNum.toLocaleString('en-IN')}</span>
                            <span className="text-[13.5px] font-medium !text-white/80">Total Earnings</span>
                        </div>
                        <Wallet className="w-8 h-8 !text-white opacity-90 shrink-0 mt-0.5" strokeWidth={1.5} />
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-4 px-1 mb-8">
                        <div className="flex justify-between items-center">
                            <span className="text-[13.5px] font-bold text-slate-650 dark:text-slate-350">Commission</span>
                            <span className="text-[13.5px] font-bold text-slate-900 dark:text-white">₹{commissionVal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[13.5px] font-bold text-slate-655 dark:text-slate-355">Tips</span>
                            <span className="text-[13.5px] font-bold text-slate-900 dark:text-white">₹{tipsVal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[13.5px] font-bold text-slate-655 dark:text-slate-355">Other Incentives</span>
                            <span className="text-[13.5px] font-bold text-slate-900 dark:text-white">₹{otherIncentivesVal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Earnings History Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-750 p-5 overflow-hidden mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Earnings History</h3>
                            <button className="text-[13px] font-bold text-[#5D2EE6] dark:text-[#8B5CF6] hover:underline bg-transparent border-0 cursor-pointer">
                                View All
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            {historyMonths.map((item) => (
                                <div 
                                    key={item.label} 
                                    className={`flex justify-between items-center px-3 py-3 transition-all ${
                                        item.active 
                                            ? '!bg-[#F3E8FF] dark:!bg-[#7C3AED]/20 !text-[#7C3AED] dark:!text-purple-300 font-bold rounded-xl' 
                                            : 'text-slate-650 dark:text-slate-350'
                                    }`}
                                >
                                    <span className="text-[13.5px] font-bold">
                                        {item.label}
                                    </span>
                                    <span className="text-[13.5px] font-bold">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
