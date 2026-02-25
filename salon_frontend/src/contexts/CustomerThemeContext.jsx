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

    return (
        <CustomerThemeContext.Provider value={{ theme, toggleTheme }}>
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
