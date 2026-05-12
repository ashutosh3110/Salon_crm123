import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useCustomerAuth } from './CustomerAuthContext';
import { useBusiness } from './BusinessContext';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const { isCustomerAuthenticated } = useCustomerAuth();
    const { userSession } = useBusiness();
    const [favoriteSalons, setFavoriteSalons] = useState([]);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [favoriteServices, setFavoriteServices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (!isCustomerAuthenticated) return;
        
        setLoading(true);
        try {
            const res = await api.get('/auth/favorites');
            if (res.data.success) {
                setFavoriteSalons(res.data.data.outlets || []);
                setFavoriteProducts(res.data.data.products || []);
                setFavoriteServices(res.data.data.services || []);
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
            setFavoriteServices([]);
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

    const toggleFavorite = async (type, id) => {
        if (!isCustomerAuthenticated) return;
        
        try {
            const res = await api.post('/auth/toggle-favorite', { type, id });
            if (res.data.success) {
                fetchFavorites();
            }
        } catch (err) {
            console.error(`[Favorites] Toggle ${type} error:`, err);
        }
    };

    const isSalonLiked = (salonId) => favoriteSalons.some(o => (o._id || o) === salonId);
    const isProductLiked = (productId) => favoriteProducts.some(p => (p._id || p) === productId);
    const isServiceLiked = (serviceId) => favoriteServices.some(s => (s._id || s) === serviceId);

    return (
        <FavoritesContext.Provider value={{
            favoriteSalons,
            toggleSalonLike,
            isSalonLiked,
            favoriteProducts,
            toggleProductLike: (id) => toggleFavorite('product', id),
            isProductLiked,
            favoriteServices,
            toggleServiceLike: (id) => toggleFavorite('service', id),
            isServiceLiked,
            loading,
            refreshFavorites: fetchFavorites
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export const useFavorites = () => useContext(FavoritesContext);
