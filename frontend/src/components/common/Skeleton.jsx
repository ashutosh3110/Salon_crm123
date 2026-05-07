import React from 'react';

export default function Skeleton({ className = '', variant = 'text' }) {
    const baseClasses = 'animate-pulse bg-slate-200 rounded-lg';

    switch (variant) {
        case 'circle':
            return <div className={`${baseClasses} rounded-full ${className}`} />;
        case 'rect':
            return <div className={`${baseClasses} ${className}`} />;
        case 'card':
            return (
                <div className={`p-5 bg-white border border-border rounded-3xl space-y-4 ${className}`}>
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
                        <div className="w-10 h-4 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-1/2 bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>
            );
        default:
            return <div className={`${baseClasses} h-4 w-full ${className}`} />;
    }
}
