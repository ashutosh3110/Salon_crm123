import React from 'react';
import { NavLink } from 'react-router-dom';
import { Lock, Crown, ArrowRight, ShieldAlert } from 'lucide-react';

export default function FeatureLockedPage() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-border/50">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                </div>
            </div>

            <h1 className="text-3xl font-black text-text tracking-tight mb-3">Feature Locked</h1>
            <p className="text-text-secondary font-medium max-w-md mx-auto mb-10 leading-relaxed">
                This module is not available in your current subscription plan. Upgrade to a higher tier to unlock advanced capabilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <NavLink 
                    to="/admin/subscription"
                    className="px-8 py-4 rounded-2xl bg-text text-white text-sm font-bold uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-text/20 hover:bg-primary transition-all group active:scale-95"
                >
                    <Crown className="w-4 h-4 text-primary-light" />
                    View Upgrade Options
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </NavLink>
                
                <NavLink 
                    to="/admin"
                    className="px-8 py-4 rounded-2xl bg-surface text-text text-sm font-bold uppercase tracking-widest hover:bg-border transition-all active:scale-95"
                >
                    Back to Dashboard
                </NavLink>
            </div>

            <div className="mt-16 pt-8 border-t border-border/60 w-full max-w-lg">
                <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Available In</div>
                        <div className="text-xs font-bold text-text">Basic & Above</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Integration</div>
                        <div className="text-xs font-bold text-text">Included</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Support</div>
                        <div className="text-xs font-bold text-text">24/7 Access</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
