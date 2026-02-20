import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import mockData from '../data/data.json';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        // MOCK LOGIN FOR FRONTEND DEV
        const mockUser = mockData.users.find(u => u.email === email && u.password === password);

        if (mockUser) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const userData = { ...mockUser };
            const tokens = { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };

            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);
            return userData;
        }

        // If no mock user found, throw error
        throw new Error('Invalid email or password');

        /* REAL API CALL (Disabled for Frontend Dev)
        const { data } = await api.post('/auth/login', { email, password });
        const { user: userData, tokens } = data;

        localStorage.setItem('accessToken', tokens?.accessToken || data.accessToken);
        localStorage.setItem('refreshToken', tokens?.refreshToken || data.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(userData || data.user));

        setUser(userData || data.user);
        setIsAuthenticated(true);

        return userData || data.user;
        */
    }, []);

    const register = useCallback(async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        const { user: userData, tokens } = data;

        localStorage.setItem('accessToken', tokens?.accessToken || data.accessToken);
        localStorage.setItem('refreshToken', tokens?.refreshToken || data.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(userData || data.user));

        setUser(userData || data.user);
        setIsAuthenticated(true);

        return userData || data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const updateUser = useCallback((updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    }, [user]);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
