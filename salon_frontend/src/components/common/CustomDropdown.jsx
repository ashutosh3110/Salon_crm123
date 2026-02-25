import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ options, value, onChange, label, className = '', placeholder = 'Select...' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || null;

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
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-1.5">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border transition-all duration-200 text-left
                    ${isOpen
                        ? 'border-primary shadow-[0_0_0_3px_rgba(var(--color-primary-rgb,99,102,241),0.12)]'
                        : 'border-border hover:border-primary/40 shadow-sm hover:shadow-md'
                    }
                `}
            >
                <span className={`text-[11px] font-black uppercase tracking-[0.12em] truncate leading-none ${selectedOption ? 'text-text' : 'text-text-muted'}`}>
                    {selectedOption?.label ?? placeholder}
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="absolute z-[999] w-full mt-1 bg-white overflow-hidden"
                    style={{
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                    }}
                >
                    {/* Top accent bar */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />

                    <div className="py-1 max-h-56 overflow-y-auto">
                        {options.map((opt, idx) => {
                            const isSelected = value === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150 group
                                        ${isSelected
                                            ? 'bg-primary/5 text-primary'
                                            : 'text-text-secondary hover:bg-surface-alt hover:text-text'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Left accent dot */}
                                        <span
                                            className={`w-1 h-1 rounded-full shrink-0 transition-colors ${isSelected ? 'bg-primary' : 'bg-border group-hover:bg-primary/40'}`}
                                        />
                                        <span className="text-[11px] font-black uppercase tracking-[0.12em] leading-none">
                                            {opt.label}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={3} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom label */}
                    <div className="px-4 py-2 border-t border-border/40 bg-surface-alt/50 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.18em]">Select an option</span>
                    </div>
                </div>
            )}
        </div>
    );
}
