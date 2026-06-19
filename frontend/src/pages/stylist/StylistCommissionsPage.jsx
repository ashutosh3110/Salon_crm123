import React from 'react';
import { Wallet } from 'lucide-react';

export default function StylistCommissionsPage() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm font-sans">
            
            {/* Header / Title area */}
            <div className="flex items-center justify-center px-5 pt-6 pb-6 relative">
                <h1 className="text-[17px] font-bold text-slate-900 dark:text-white text-center">
                    Earnings
                </h1>
            </div>

            <div className="px-5 pb-8 overflow-y-auto no-scrollbar">
                {/* Purple Hero Card */}
                <div className="bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] rounded-[20px] p-5 relative overflow-hidden shadow-lg shadow-[#6D28D9]/20 text-white mb-6">
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-white/90 mb-1 tracking-wide uppercase">This Month</span>
                            <span className="text-[32px] font-black tracking-tight leading-none mb-1">₹28,650</span>
                            <span className="text-[11px] font-semibold text-white/80">Total Earnings</span>
                        </div>
                        <div className="w-10 h-10 border border-white/20 rounded-xl flex items-center justify-center bg-white/10 shrink-0">
                            <Wallet className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-4 px-1 mb-8">
                    <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold text-[#4B5563] dark:text-slate-300">Commission</span>
                        <span className="text-[13px] font-black text-slate-900 dark:text-white">₹25,400</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold text-[#4B5563] dark:text-slate-300">Tips</span>
                        <span className="text-[13px] font-black text-slate-900 dark:text-white">₹2,250</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold text-[#4B5563] dark:text-slate-300">Other Incentives</span>
                        <span className="text-[13px] font-black text-slate-900 dark:text-white">₹1,000</span>
                    </div>
                </div>

                {/* Earnings History Card */}
                <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 p-4 overflow-hidden mb-8">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Earnings History</h3>
                        <button className="text-[12px] font-bold transition-opacity hover:opacity-80" style={{ color: '#7C3AED' }}>View All</button>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center p-3 rounded-xl" style={{ backgroundColor: '#F5F3FF' }}>
                            <span className="text-[13px] font-bold text-slate-700">June 2026</span>
                            <span className="text-[13px] font-black text-slate-900">₹28,650</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-transparent">
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">May 2026</span>
                            <span className="text-[13px] font-black text-slate-900 dark:text-white">₹26,300</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-transparent">
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">April 2026</span>
                            <span className="text-[13px] font-black text-slate-900 dark:text-white">₹24,100</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-transparent">
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">March 2026</span>
                            <span className="text-[13px] font-black text-slate-900 dark:text-white">₹22,500</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Added extra padding at the bottom so it doesn't get covered by the mobile navbar */}
            <div className="h-20 lg:h-0 flex-shrink-0" />
        </div>
    );
}
