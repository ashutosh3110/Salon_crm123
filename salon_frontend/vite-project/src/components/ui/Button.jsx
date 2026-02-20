import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]',
    secondary: 'bg-surface-light dark:bg-surface-dark text-text-primary dark:text-white border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-white/10',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98]',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]',
    ghost: 'bg-transparent text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
};

const sizes = {
    xs: 'px-2.5 py-1 text-xs rounded-md',
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-2.5 text-base rounded-xl',
    xl: 'px-8 py-3 text-lg rounded-xl',
};

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    type = 'button',
    onClick,
    ...props
}, ref) => {
    return (
        <motion.button
            ref={ref}
            type={type}
            whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
            className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 ease-out cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : Icon && iconPosition === 'left' ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </motion.button>
    );
});

Button.displayName = 'Button';
export default Button;
