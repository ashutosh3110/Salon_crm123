import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { registerToken as requestForToken } from '../services/firebase';

const AuthContext = createContext(null);

// ── Role → Base Path Registry ──────────────────────────────────────────
import authData from '../data/authMockData.json';

// Role → Base Path Registry
const ROLE_REDIRECT_MAP = authData.redirect_map;

// Mock Users for Dev Testing
const MOCK_USERS = authData.mock_users;

/**
 * Helper to get redirection path based on user role
 */
export const getRedirectPath = (user) => {
    if (!user || !user.role) return '/login';
    return ROLE_REDIRECT_MAP[user.role] || '/admin';
};


// Determine current user role
const resolveRole = () => {
    const activeRole = localStorage.getItem('active_auth_role');
    if (activeRole && localStorage.getItem(`auth_token_${activeRole}`)) {
        return activeRole;
    }

    const path = window.location.pathname;
    if (path.startsWith('/superadmin')) return 'superadmin';
    if (path.startsWith('/manager')) return 'manager';
    if (path.startsWith('/receptionist')) return 'receptionist';
    if (path.startsWith('/stylist')) return 'stylist';
    if (path.startsWith('/inventory')) return 'inventory_manager';
    if (path.startsWith('/accountant')) return localStorage.getItem('auth_token_accountant') ? 'accountant' : 'admin';
    if (path.startsWith('/admin')) return 'admin';

    const roles = ['admin', 'manager', 'receptionist', 'stylist', 'superadmin', 'accountant', 'inventory_manager'];
    return roles.find(r => localStorage.getItem(`auth_token_${r}`)) || null;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // 1. Initial Load: Robust User Restoration
    useEffect(() => {
        const role = resolveRole();

        if (!role) {
            setLoading(false);
            return;
        }

        const storedUser = localStorage.getItem(`auth_user_${role}`);
        const token = localStorage.getItem(`auth_token_${role}`);

        if (storedUser && token) {
            try {
                const parsed = JSON.parse(storedUser);
                // Only update if the user object is different to maintain reference stability
                setUser(prev => {
                    if (prev && prev._id === parsed._id && prev.role === parsed.role) return prev;
                    return parsed;
                });
                // Initialize push notifications
                requestForToken().catch(err => console.error('[AuthContext] Push init error:', err));
            } catch (e) {
                console.error('[AuthContext] Failed to parse stored user:', e);
                localStorage.removeItem(`auth_user_${role}`);
                localStorage.removeItem(`auth_token_${role}`);
            }
        }
        setLoading(false);
    }, []); // Run ONLY ONCE on mount

    // 2. Track Navigation & Session Persistence
    useEffect(() => {
        const nonPosPanels = ['/admin', '/manager', '/receptionist', '/stylist', '/inventory', '/accountant', '/superadmin'];
        const isPanel = nonPosPanels.some(p => pathname.startsWith(p));
        const isPos = pathname.startsWith('/pos');

        if (isPanel && !isPos) {
            sessionStorage.setItem('last_panel_path', pathname + window.location.search);
        }
    }, [pathname]);

    const getExitPath = useCallback(() => {
        const fallback = getRedirectPath(user);
        return sessionStorage.getItem('last_panel_path') || fallback;
    }, [user]);

    const login = useCallback(async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data.success) {
                const { accessToken, user: userData } = response.data.data;
                
                // Save session specific to the role
                localStorage.setItem(`auth_token_${userData.role}`, accessToken);
                localStorage.setItem(`auth_user_${userData.role}`, JSON.stringify(userData));
                localStorage.setItem('active_auth_role', userData.role);
                
                // Set unified token for API service
                localStorage.setItem('token', accessToken);

                setUser(userData);
                return { accessToken, user: userData };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('[AuthContext] Login failed:', error);
            throw error;
        }
    }, []);

    const register = useCallback(async (payload) => {
        try {
            const response = await api.post('/auth/register', payload);
            
            if (response.data.success) {
                const { accessToken, user: userData } = response.data.data;

                localStorage.setItem(`auth_token_${userData.role}`, accessToken);
                localStorage.setItem(`auth_user_${userData.role}`, JSON.stringify(userData));
                localStorage.setItem('active_auth_role', userData.role);
                
                // Set unified token for API service
                localStorage.setItem('token', accessToken);

                setUser(userData);
                return { accessToken, user: userData };
            } else {
                throw new Error(response.data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('[AuthContext] Registration failed:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        const role = user?.role || 'admin';
        const fcmToken = localStorage.getItem('fcm_token');
        if (fcmToken) {
            try {
                await api.post('/notifications/remove-token', { fcmToken });
                localStorage.removeItem('fcm_token');
            } catch (err) {
                console.warn('[AuthContext] Failed to remove FCM token:', err.message);
            }
        }
        localStorage.removeItem(`auth_token_${role}`);
        localStorage.removeItem(`auth_user_${role}`);
        localStorage.removeItem('active_auth_role');
        setUser(null);
        navigate('/login');
    }, [user, navigate]);

    const updateSubscription = useCallback((newPlanId) => {
        if (!user) return;
        const updatedUser = { ...user, subscriptionPlan: newPlanId };
        const role = user.role;
        localStorage.setItem(`auth_user_${role}`, JSON.stringify(updatedUser));
        setUser(updatedUser);
    }, [user]);

    const updateProfile = useCallback(async (data) => {
        try {
            const response = await api.patch('/users/me', data);
            const updatedUser = response.data?.data ?? response.data;
            if (response.data?.success === false) {
                throw new Error(response.data.message || 'Profile update failed');
            }
            if (!updatedUser || typeof updatedUser !== 'object' || !updatedUser.email) {
                throw new Error(response.data?.message || 'Profile update failed');
            }
            const role = updatedUser.role || 'admin';
            localStorage.setItem(`auth_user_${role}`, JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('[AuthContext] Profile update failed:', error);
            const msg = error.response?.data?.message || error.message;
            throw new Error(msg);
        }
    }, [user]);

    /** Fresh user from server (includes fields not stored at login). */
    const refreshUser = useCallback(async () => {
        const response = await api.get('/users/me');
        const u = response.data;
        if (!u || typeof u !== 'object' || !u.email) {
            throw new Error('Could not load profile');
        }
        const role = u.role || 'admin';
        localStorage.setItem(`auth_user_${role}`, JSON.stringify(u));
        setUser(u);
        return u;
    }, []);

    const changePassword = useCallback(async (currentPassword, newPassword) => {
        try {
            const response = await api.post('/users/change-password', { currentPassword, newPassword });
            if (response.status === 204 || response.data?.success) {
                return response.data;
            }
            throw new Error(response.data?.message || 'Password change failed');
        } catch (error) {
            console.error('[AuthContext] Password change failed:', error);
            const msg = error.response?.data?.message || error.message;
            throw new Error(msg);
        }
    }, []);

    const isPlanActive = useMemo(() => {
        if (!user) return false;
        if (user.role === 'superadmin') return true;
        return user.subscriptionStatus === 'active';
    }, [user]);

    const value = useMemo(() => ({
        user,
        loading,
        isPlanActive,
        login,
        register,
        logout,
        updateSubscription,
        updateProfile,
        refreshUser,
        changePassword,
        isAuthenticated: !!user,
        getRedirectPath: () => getRedirectPath(user),
        getExitPath,
    }), [user, loading, isPlanActive, login, register, logout, refreshUser, getExitPath]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
