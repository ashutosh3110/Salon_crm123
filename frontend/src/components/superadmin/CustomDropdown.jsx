import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomDropdown({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    className = '',
    variant = 'filter' // 'filter' | 'form'
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = options.find(o => o.value === value) || options.find(o => o.key === value);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const baseCls = variant === 'filter'
        ? 'px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm hover:border-primary/30 hover:text-primary transition-all shadow-sm active:scale-95'
        : 'w-full px-4 py-3 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm active:scale-[0.99]';

    return (
        <div ref={ref} className={`relative ${variant === 'form' ? 'w-full' : 'inline-block'}`}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`${baseCls} flex items-center justify-between gap-3 min-w-[160px] ${className} ${open ? 'border-primary ring-4 ring-primary/10' : ''}`}
            >
                <div className="flex items-center gap-2.5 truncate">
                    {selected?.icon && (
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${open ? 'bg-primary/10 text-primary' : 'bg-surface text-text-muted'}`}>
                            <selected.icon className="w-3.5 h-3.5" />
                        </div>
                    )}
                    <span className={`truncate font-semibold ${selected ? 'text-text' : 'text-text-muted'}`}>
                        {selected?.label || placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${open ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-[100] mt-2 w-full min-w-[200px] bg-white/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-1.5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 origin-top overflow-hidden ring-1 ring-black/5">
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                        {options.map((opt, i) => (
                            <button
                                key={opt.value || opt.key || i}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value || opt.key);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition-all
                                    ${value === (opt.value || opt.key)
                                        ? 'text-primary bg-primary/5 mx-1.5 w-[calc(100%-12px)] rounded-xl'
                                        : 'text-text-secondary hover:text-primary hover:bg-surface mx-1.5 w-[calc(100%-12px)] rounded-xl'}
                                `}
                            >
                                {opt.icon && (
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${value === (opt.value || opt.key) ? 'bg-primary/10 text-primary' : 'bg-surface text-text-muted'}`}>
                                        <opt.icon className="w-3.5 h-3.5" />
                                    </div>
                                )}
                                <span className="flex-1 text-left truncate">{opt.label}</span>
                                {value === (opt.value || opt.key) && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
