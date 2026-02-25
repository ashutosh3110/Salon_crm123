import React from 'react';

export default function POSPage() {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-160px)] border border-border rounded-none bg-surface p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 transform rotate-45">
                    <div className="-rotate-45 font-black text-primary text-xl">POS</div>
                </div>
                <h1 className="text-sm font-black text-text uppercase tracking-[0.3em]">Transaction Terminal Node</h1>
                <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.2em] opacity-60">Initializing core commerce protocols...</p>
            </div>
        </div>
    );
}
