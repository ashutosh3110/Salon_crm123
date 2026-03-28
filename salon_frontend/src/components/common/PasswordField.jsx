import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({ 
    containerClassName = '', 
    inputClassName = '', 
    iconClassName = 'w-4 h-4',
    buttonClassName = '',
    children,
    ...props 
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`relative ${containerClassName}`}>
            {children}
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className={inputClassName}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:opacity-70 transition-opacity focus:outline-none ${buttonClassName}`}
                tabIndex="-1"
            >
                {showPassword ? (
                    <EyeOff className={iconClassName} />
                ) : (
                    <Eye className={iconClassName} />
                )}
            </button>
        </div>
    );
}
