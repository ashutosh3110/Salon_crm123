import { createContext, useContext, useState, useEffect } from 'react';

const CustomerThemeContext = createContext(null);

export function CustomerThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('customer_theme') || 'dark'; // Default to dark for premium feel
    });

    useEffect(() => {
        localStorage.setItem('customer_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const isLight = theme === 'light';

    const colors = {
        background: isLight ? '#FCF9F6' : '#0F0F0F', // Standardized key
        bg: isLight ? '#FCF9F6' : '#0F0F0F',         // Legacy key for compatibility
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        input: isLight ? '#EDF0F2' : '#242424',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
        accent: '#C8956C'
    };

    return (
        <CustomerThemeContext.Provider value={{ theme, toggleTheme, colors, isLight }}>
            <div className={`customer-app-root ${theme}`}>
                {children}
            </div>
        </CustomerThemeContext.Provider>
    );
}

export function useCustomerTheme() {
    const context = useContext(CustomerThemeContext);
    if (!context) throw new Error('useCustomerTheme must be used within CustomerThemeProvider');
    return context;
}
