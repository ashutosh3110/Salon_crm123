import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const defaultSteps = ['Service', 'Date & Time', 'Stylist', 'Confirm'];

export default function StepIndicator({ currentStep = 0, steps = defaultSteps }) {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        inactive: isLight ? '#E5E7EB' : '#242424',
        textInactive: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
        textMuted: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
        accent: '#C8956C',
        line: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
    };

    return (
        <div className="flex items-center justify-between w-full px-1">
            {steps.map((label, i) => {
                const isActive = i === currentStep;
                const isCompleted = i < currentStep;

                return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.05 : 1,
                                    backgroundColor: isCompleted ? colors.accent : isActive ? colors.accent : colors.inactive,
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-9 h-9 rounded-full flex items-center justify-center relative border border-white/5 shadow-sm"
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                    >
                                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                    </motion.div>
                                ) : (
                                    <span className={`text-[10px] font-black ${isActive ? 'text-white' : ''}`} style={{ color: !isActive ? colors.textInactive : 'white' }}>
                                        {i + 1}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="stepRing"
                                        className="absolute inset-0 rounded-full border-2 border-[#C8956C]"
                                        style={{ margin: -3 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: isActive ? colors.accent : (isCompleted ? colors.textMuted : colors.textInactive) }}>
                                {label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-[2px] mx-2 rounded-full overflow-hidden mt-[-20px]" style={{ background: colors.line }}>
                                <motion.div
                                    className="h-full"
                                    style={{ background: colors.accent }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: isCompleted ? '100%' : '0%' }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
