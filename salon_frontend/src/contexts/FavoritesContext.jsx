import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const [favoriteSalons, setFavoriteSalons] = useState(() => {
        const saved = localStorage.getItem('app_favorite_salons');
        return saved ? JSON.parse(saved) : [];
    });

    const [favoriteProducts, setFavoriteProducts] = useState(() => {
        const saved = localStorage.getItem('app_favorite_products');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('app_favorite_salons', JSON.stringify(favoriteSalons));
    }, [favoriteSalons]);

    useEffect(() => {
        localStorage.setItem('app_favorite_products', JSON.stringify(favoriteProducts));
    }, [favoriteProducts]);

    const toggleSalonLike = (salonId) => {
        setFavoriteSalons(prev =>
            prev.includes(salonId)
                ? prev.filter(id => id !== salonId)
                : [...prev, salonId]
        );
    };

    const toggleProductLike = (productId) => {
        setFavoriteProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const isSalonLiked = (salonId) => favoriteSalons.includes(salonId);
    const isProductLiked = (productId) => favoriteProducts.includes(productId);

    return (
        <FavoritesContext.Provider value={{
            favoriteSalons,
            toggleSalonLike,
            isSalonLiked,
            favoriteProducts,
            toggleProductLike,
            isProductLiked
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export const useFavorites = () => useContext(FavoritesContext);
