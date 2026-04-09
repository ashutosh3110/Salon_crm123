import { Outlet, useLocation } from 'react-router-dom';
import { CustomerAuthProvider } from '../contexts/CustomerAuthContext';
import { GenderProvider } from '../contexts/GenderContext';
import { CartProvider } from '../contexts/CartContext';
import { CustomerThemeProvider } from '../contexts/CustomerThemeContext';
import { WalletProvider } from '../contexts/WalletContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';

export default function CustomerAppWrapper() {
    const location = useLocation();

    return (
        <GenderProvider>
            <CartProvider>
                <CustomerThemeProvider>
                    <FavoritesProvider>
                        <Outlet />
                    </FavoritesProvider>
                </CustomerThemeProvider>
            </CartProvider>
        </GenderProvider>
    );
}
