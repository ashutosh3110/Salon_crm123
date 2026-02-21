import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            console.log('[AuthContext] Attempting login for:', email);
            const response = await api.post('/auth/login', { email, password });
            console.log('[AuthContext] Login response received:', response.data);

            const body = response.data;
            if (!body || !body.data) {
                throw new Error('Invalid response structure from server');
            }

            const { accessToken, user: userData } = body.data;

            if (!accessToken) throw new Error('No access token received');

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return body.data;
        } catch (error) {
            console.error('[AuthContext] Login error details:', error.response?.data || error.message);
            throw error;
        }
    };

    const register = async (payload) => {
        try {
            console.log('[AuthContext] Attempting registration for:', payload.email);
            const response = await api.post('/auth/register', payload);
            console.log('[AuthContext] Register response received:', response.data);

            const body = response.data;
            if (!body || !body.data) {
                throw new Error('Invalid response structure from server');
            }

            const { accessToken, user: userData } = body.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return body.data;
        } catch (error) {
            console.error('[AuthContext] Registration error details:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/admin/login');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
