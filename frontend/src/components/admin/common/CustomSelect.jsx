import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder = "Select...", label = "", className = "", dark = false, position = "bottom" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const isTop = position === "top";

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 block text-left ${dark ? 'text-white/40' : 'text-text-muted'}`}>
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all outline-none shadow-sm border ${
                    dark 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                    : 'bg-surface border-border text-text hover:border-primary/40'
                }`}
            >
                <span className={`truncate ${!value && !dark ? "text-text-muted/60" : !value && dark ? "text-white/30" : ""}`}>{value || placeholder}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 shrink-0 ${dark ? 'text-white/40' : 'text-text-muted'} ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: isTop ? -10 : 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: isTop ? -10 : 10, scale: 0.95 }}
                            className={`absolute ${isTop ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-full border rounded-2xl shadow-2xl p-2 z-[70] overflow-hidden ${
                                dark ? 'bg-indigo-950 border-white/10 shadow-black' : 'bg-surface border-border shadow-2xl'
                            }`}
                        >
                            <div className="max-h-[240px] overflow-y-auto custom-scrollbar text-left font-sans">
                                {options.length > 0 ? (
                                    options.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                onChange(opt);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all mb-0.5 ${
                                                value === opt 
                                                ? (dark ? 'bg-indigo-500 text-white' : 'bg-primary text-primary-foreground') 
                                                : (dark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-text hover:bg-surface-alt hover:text-primary')
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-white/30' : 'text-text-muted/50'}`}>
                                            No categories found
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
