import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CustomerAuthProvider } from '../contexts/CustomerAuthContext';
import { GenderProvider } from '../contexts/GenderContext';
import { CartProvider } from '../contexts/CartContext';
import { CustomerThemeProvider } from '../contexts/CustomerThemeContext';
import AppSplashScreen from '../components/app/AppSplashScreen';

export default function CustomerAppWrapper() {
    const [showSplash, setShowSplash] = useState(true);
    const location = useLocation();

    return (
        <CustomerAuthProvider>
            <GenderProvider>
                <CartProvider>
                    <CustomerThemeProvider>
                        <AnimatePresence mode="wait">
                            {showSplash ? (
                                <AppSplashScreen key="splash" onComplete={() => setShowSplash(false)} />
                            ) : (
                                <Outlet key="app-content" />
                            )}
                        </AnimatePresence>
                    </CustomerThemeProvider>
                </CartProvider>
            </GenderProvider>
        </CustomerAuthProvider>
    );
}
