import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useCustomerAuth } from './CustomerAuthContext';
import { useSocket } from './SocketContext';
import { useBusiness } from './BusinessContext';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const { customer, isCustomerAuthenticated } = useCustomerAuth();
    const socket = useSocket();
    const { activeSalonId } = useBusiness();
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

    useEffect(() => {
        if (!socket || !isCustomerAuthenticated) return;

        const joinRoom = () => {
            const sid = activeSalonId || localStorage.getItem('active_salon_id');
            if (sid) {
                socket.emit('join_salon', sid);
                console.log(`[Socket] Joined salon room: ${sid}`);
            }
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on('connect', joinRoom);

        socket.on('product_liked', () => {
            console.log('[Socket] Product like update received');
            fetchFavorites(); // Refresh list when anyone likes/unlikes
        });

        socket.on('outlet_liked', () => {
            fetchFavorites();
        });

        return () => {
            socket.off('connect', joinRoom);
            socket.off('product_liked');
            socket.off('outlet_liked');
        };
    }, [socket, isCustomerAuthenticated, fetchFavorites, activeSalonId]);

    const toggleSalonLike = async (salonId) => {
        if (!isCustomerAuthenticated) return;

        if (socket?.connected) {
            socket.emit('outlet_like_toggle', { 
                outletId: salonId, 
                customerId: customer._id 
            });
            return;
        }

        try {
            const res = await api.post(`/outlets/${salonId}/like`);
            if (res.data.success) {
                // Socket listener handles refresh
            }
        } catch (err) {
            console.error('[Favorites] Toggle Salon error:', err);
        }
    };

    const toggleProductLike = async (productId, salonId) => {
        if (!isCustomerAuthenticated) return;
        
        if (socket?.connected) {
            socket.emit('product_like_toggle', { 
                productId, 
                customerId: customer._id,
                salonId: salonId || activeSalonId || localStorage.getItem('active_salon_id')            });
            return;
        }

        // Fallback to API if socket not available
        try {
            const res = await api.post(`/products/${productId}/like`);
            if (res.data.success) {
                // Socket listener will handle the refresh
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
