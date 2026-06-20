import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    className = '',
    triggerClassName = '',
    textClassName = '',
    disabled = false,
    label,
    icon: Icon,
    showFooter = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const normalizedOptions = (options || []).map(opt => {
        if (typeof opt === 'string' || typeof opt === 'number') {
            return { label: String(opt), value: opt };
        }
        return opt;
    });

    const selectedOption = normalizedOptions.find(opt => opt.value === value) || null;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative custom-dropdown-container rounded-xl ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-1.5">
                    {label}
                </label>
            )}

            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`custom-dropdown-trigger w-full flex items-center justify-between gap-2 px-3 border transition-all duration-200 text-left allow-curve rounded-xl
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100/50 dark:bg-slate-800/50' : triggerClassName.includes('bg-') ? '' : 'bg-white dark:bg-slate-800'}
                    ${className.includes('h-12') ? 'h-12' : className.includes('h-11') ? 'h-11' : 'py-2'}
                    ${isOpen && !triggerClassName.includes('border-')
                        ? 'border-primary shadow-[0_0_0_3px_rgba(var(--color-primary-rgb,99,102,241),0.12)] dark:border-primary/50'
                        : !triggerClassName.includes('border-') ? 'border-border dark:border-slate-700 hover:border-primary/40 shadow-sm hover:shadow-md' : ''
                    }
                    ${triggerClassName}
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${textClassName || 'text-text-muted'}`} />}
                    <span className={`text-[11px] font-black uppercase tracking-[0.12em] truncate leading-none ${textClassName || (selectedOption ? 'text-text' : 'text-text-muted')}`}>
                        {selectedOption?.label ?? placeholder}
                    </span>
                </div>
                <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${isOpen ? (textClassName || 'text-primary') : (textClassName || 'text-text-muted')} ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="custom-dropdown-panel absolute z-[999] w-full mt-1 bg-white dark:bg-slate-800 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl"
                >
                    <div className="py-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
                        {normalizedOptions.length === 0 ? (
                            <div className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                No options available
                            </div>
                        ) : (
                            normalizedOptions.map((opt, idx) => {
                                const isSelected = value === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }}
                                        className={`custom-dropdown-option w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors duration-150 group !border-0 !rounded-none last:!border-0
                                            ${isSelected
                                                ? 'bg-[#cca839]/10 text-[#cca839] hover:bg-[#cca839]/20 dark:bg-[#cca839]/20 dark:text-[#cca839]'
                                                : 'text-text-secondary hover:bg-slate-50 hover:text-text dark:hover:bg-slate-800/80'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            {/* Left accent icon or dot */}
                                            {opt.icon ? (
                                                <opt.icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#cca839]' : 'text-text-muted group-hover:text-[#cca839]'}`} />
                                            ) : (
                                                <span
                                                    className={`w-1 h-1 rounded-full shrink-0 transition-colors ${isSelected ? 'bg-[#cca839]' : 'bg-border group-hover:bg-[#cca839]/40'}`}
                                                />
                                            )}
                                            <span className="text-[10px] font-bold tracking-wider leading-none">
                                                {opt.label}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-[#cca839] shrink-0" strokeWidth={3} />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Bottom label */}
                    {showFooter && (
                        <div className="px-3 py-1.5 border-t border-border/40 bg-slate-50 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Select an option</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
