import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ options = [], value, onChange, label, className = '', placeholder = 'Select...', showFooter = false, icon: Icon }) {
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
                onClick={() => setIsOpen(!isOpen)}
                className={`custom-dropdown-trigger w-full flex items-center justify-between gap-2 px-3 bg-white border transition-all duration-200 text-left allow-curve rounded-xl
                    ${className.includes('h-11') ? 'h-11' : 'py-2'}
                    ${isOpen
                        ? 'border-primary shadow-[0_0_0_3px_rgba(var(--color-primary-rgb,99,102,241),0.12)]'
                        : 'border-border hover:border-primary/40 shadow-sm hover:shadow-md'
                    }
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />}
                    <span className={`text-[11px] font-black uppercase tracking-[0.12em] truncate leading-none ${selectedOption ? 'text-text' : 'text-text-muted'}`}>
                        {selectedOption?.label ?? placeholder}
                    </span>
                </div>
                <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                />
            </button>
 
            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="custom-dropdown-panel absolute z-[999] w-full mt-1 bg-white overflow-hidden rounded-xl"
                    style={{
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                    }}
                >
                    <div className="py-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
                        {normalizedOptions.map((opt, idx) => {
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
                                        {/* Left accent dot */}
                                        <span
                                            className={`w-1 h-1 rounded-full shrink-0 transition-colors ${isSelected ? 'bg-[#cca839]' : 'bg-border group-hover:bg-[#cca839]/40'}`}
                                        />
                                        <span className="text-[10px] font-bold tracking-wider leading-none">
                                            {opt.label}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-[#cca839] shrink-0" strokeWidth={3} />
                                    )}
                                </button>
                            );
                        })}
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
