import { createContext, useContext, useState, useEffect } from 'react';

const GenderContext = createContext(null);

export function GenderProvider({ children }) {
    const [gender, setGenderState] = useState(() => {
        // Persist across sessions
        return localStorage.getItem('app_gender') || null; // null = not yet chosen
    });

    const setGender = (g) => {
        localStorage.setItem('app_gender', g);
        setGenderState(g);
    };

    const clearGender = () => {
        localStorage.removeItem('app_gender');
        setGenderState(null);
    };

    return (
        <GenderContext.Provider value={{ gender, setGender, clearGender }}>
            {children}
        </GenderContext.Provider>
    );
}

export function useGender() {
    const ctx = useContext(GenderContext);
    if (!ctx) throw new Error('useGender must be used inside GenderProvider');
    return ctx;
}
