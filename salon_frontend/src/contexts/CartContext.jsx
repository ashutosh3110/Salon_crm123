import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCustomerAuth } from './CustomerAuthContext';
import { useBusiness } from './BusinessContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { customer } = useCustomerAuth();
    const { activeSalonId } = useBusiness();
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const location = useLocation();

    const fetchCart = useCallback(async () => {
        if (!customer) return;
        setLoading(true);
        try {
            const res = await api.get('/cart');
            if (res.data.success) {
                setCart(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    }, [customer]);

    useEffect(() => {
        if (!location.pathname.startsWith('/superadmin')) {
            fetchCart();
        }
    }, [fetchCart, location.pathname]);

    const addToCart = async (productId, quantity = 1) => {
        if (!customer) {
            // Optional: handle guest cart in localStorage
            return;
        }

        const pId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
        try {
            const res = await api.post('/cart', {
                productId: pId,
                quantity,
                salonId: activeSalonId || localStorage.getItem('active_salon_id')
            });
            if (res.data.success) {
                setCart(res.data.data);
                setIsCartOpen(true);
                return true;
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            return false;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            return removeFromCart(productId);
        }
        return addToCart(productId, quantity);
    };

    const removeFromCart = async (productId) => {
        try {
            const res = await api.delete(`/cart/${productId}`);
            if (res.data.success) {
                setCart(res.data.data);
                return true;
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            return false;
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('/cart');
            setCart({ items: [] });
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.items.reduce((acc, item) => {
        const price = item.productId?.sellingPrice || 0;
        return acc + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            cartCount,
            cartTotal,
            refreshCart: fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
