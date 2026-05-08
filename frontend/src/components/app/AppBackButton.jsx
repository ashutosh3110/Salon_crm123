import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const AppBackButton = ({ 
    onClick, 
    label, 
    variant = 'glass', // 'glass' | 'minimal' | 'solid'
    className = '' 
}) => {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const handleBack = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    const variants = {
        glass: {
            background: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.08)',
            color: isLight ? '#000' : '#fff',
        },
        minimal: {
            background: 'transparent',
            color: isLight ? '#000' : '#fff',
        },
        solid: {
            background: '#C8956C',
            color: '#fff',
        }
    };

    return (
        <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleBack}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all z-50 ${className}`}
            style={variants[variant]}
        >
            <div className={`flex items-center justify-center ${variant === 'glass' ? 'w-8 h-8 rounded-xl bg-[#C8956C]/10' : ''}`}>
                <ArrowLeft size={18} strokeWidth={2.5} className="text-[#C8956C]" />
            </div>
            {label && (
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    {label}
                </span>
            )}
        </motion.button>
    );
};

export default AppBackButton;
