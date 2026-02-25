import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const defaultSteps = ['Service', 'Date & Time', 'Stylist', 'Confirm'];

export default function StepIndicator({ currentStep = 0, steps = defaultSteps }) {
    return (
        <div className="flex items-center justify-between w-full px-2">
            {steps.map((label, i) => {
                const isActive = i === currentStep;
                const isCompleted = i < currentStep;

                return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isCompleted ? '#C8956C' : isActive ? '#C8956C' : '#242424',
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center relative border border-white/5"
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
                                    <span className={`text-[10px] font-black ${isActive ? 'text-white' : 'text-white/20'}`}>
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
                            <span className={`text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-[#C8956C]' : isCompleted ? 'text-white/40' : 'text-white/20'}`}>
                                {label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-[1px] mx-1.5 rounded-full overflow-hidden bg-white/5 mt-[-16px]">
                                <motion.div
                                    className="h-full bg-[#C8956C]"
                                    initial={{ width: '0%' }}
                                    animate={{ width: isCompleted ? '100%' : '0%' }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
