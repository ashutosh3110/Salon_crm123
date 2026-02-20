import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    helperText,
    icon: Icon,
    type = 'text',
    className = '',
    containerClassName = '',
    required = false,
    ...props
}, ref) => {
    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-text-primary dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`
            w-full px-4 py-2.5 rounded-xl text-sm
            bg-surface-light dark:bg-white/5
            border border-border-light dark:border-border-dark
            text-text-primary dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-gray-400 mt-1">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
