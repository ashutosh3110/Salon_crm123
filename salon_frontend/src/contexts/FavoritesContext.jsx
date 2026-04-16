import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useCustomerAuth } from './CustomerAuthContext';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const { isCustomerAuthenticated } = useCustomerAuth();
    const [favoriteSalons, setFavoriteSalons] = useState([]);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (!isCustomerAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/auth/favorites');
            if (res.data.success) {
                setFavoriteSalons(res.data.data.outlets || []);
                setFavoriteProducts(res.data.data.products || []);
            }
        } catch (err) {
            console.error('[Favorites] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [isCustomerAuthenticated]);

    useEffect(() => {
        if (isCustomerAuthenticated) {
            fetchFavorites();
        } else {
            setFavoriteSalons([]);
            setFavoriteProducts([]);
        }
    }, [isCustomerAuthenticated, fetchFavorites]);

    const toggleSalonLike = async (salonId) => {
        if (!isCustomerAuthenticated) return;

        try {
            const res = await api.post(`/outlets/${salonId}/like`);
            if (res.data.success) {
                fetchFavorites();
            }
        } catch (err) {
            console.error('[Favorites] Toggle Salon error:', err);
        }
    };

    const toggleProductLike = async (productId) => {
        if (!isCustomerAuthenticated) return;
        
        try {
            const res = await api.post(`/products/${productId}/like`);
            if (res.data.success) {
                fetchFavorites();
            }
        } catch (err) {
            console.error('[Favorites] Toggle Product error:', err);
        }
    };

    const isSalonLiked = (salonId) => favoriteSalons.some(o => o._id === salonId);
    const isProductLiked = (productId) => favoriteProducts.some(p => p._id === productId);

    return (
        <FavoritesContext.Provider value={{
            favoriteSalons,
            toggleSalonLike,
            isSalonLiked,
            favoriteProducts,
            toggleProductLike,
            isProductLiked,
            loading,
            refreshFavorites: fetchFavorites
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export const useFavorites = () => useContext(FavoritesContext);
