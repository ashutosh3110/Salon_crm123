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
                                    backgroundColor: isCompleted ? '#B85C5C' : isActive ? '#B85C5C' : '#F5F5F5',
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center relative"
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
                                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-text-muted'}`}>
                                        {i + 1}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="stepRing"
                                        className="absolute inset-0 rounded-full border-2 border-primary"
                                        style={{ margin: -3 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                            <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? 'text-primary font-bold' : isCompleted ? 'text-text-secondary' : 'text-text-muted'}`}>
                                {label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-1.5 rounded-full overflow-hidden bg-border/60 mt-[-16px]">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
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
