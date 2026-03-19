import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

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


export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Determine current panel role from URL
    const getCurrentPanel = (path) => {
        if (path.startsWith('/superadmin')) return 'superadmin';
        if (path.startsWith('/manager')) return 'manager';
        if (path.startsWith('/receptionist')) return 'receptionist';
        if (path.startsWith('/stylist')) return 'stylist';
        if (path.startsWith('/inventory')) return 'inventory_manager';
        if (path.startsWith('/accountant')) return 'accountant';
        if (path.startsWith('/admin')) return 'admin';
        return null; // Don't default to admin
    };

    useEffect(() => {
        let role = getCurrentPanel(window.location.pathname);

        // For shared pages like POS, prioritize the explicitly active role
        if (!role || window.location.pathname.startsWith('/pos')) {
            const activeRole = localStorage.getItem('active_auth_role');
            if (activeRole && localStorage.getItem(`auth_token_${activeRole}`)) {
                role = activeRole;
            } else {
                // Fallback: search for any logged-in role
                const possibleRoles = ['admin', 'manager', 'receptionist', 'stylist', 'inventory_manager', 'accountant', 'superadmin'];
                role = possibleRoles.find(r => localStorage.getItem(`auth_token_${r}`));
            }
        }

        if (!role) {
            setLoading(false);
            return;
        }

        const storedUser = localStorage.getItem(`auth_user_${role}`);
        const token = localStorage.getItem(`auth_token_${role}`);

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('[AuthContext] Failed to parse stored user:', e);
                localStorage.removeItem(`auth_user_${role}`);
                localStorage.removeItem(`auth_token_${role}`);
            }
        }
        setLoading(false);
    }, [pathname]);

    // Track the last visited panel path for "Exit POS" functionality
    useEffect(() => {
        const nonPosPanels = ['/admin', '/manager', '/receptionist', '/stylist', '/inventory', '/accountant', '/superadmin'];
        const isPanel = nonPosPanels.some(p => pathname.startsWith(p));
        const isPos = pathname.startsWith('/pos');

        if (isPanel && !isPos) {
            sessionStorage.setItem('last_panel_path', pathname + window.location.search);
        }
    }, [pathname]);

    const getExitPath = () => {
        const fallback = getRedirectPath(user);
        return sessionStorage.getItem('last_panel_path') || fallback;
    };

    const login = async (email, password) => {
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
    };

    const register = async (payload) => {
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
    };

    const logout = () => {
        const role = user?.role || 'admin';
        localStorage.removeItem(`auth_token_${role}`);
        localStorage.removeItem(`auth_user_${role}`);
        localStorage.removeItem('active_auth_role');
        setUser(null);
        navigate('/login');
    };

    const updateSubscription = (newPlanId) => {
        if (!user) return;
        const updatedUser = { ...user, subscriptionPlan: newPlanId };
        const role = user.role;
        localStorage.setItem(`auth_user_${role}`, JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const updateProfile = async (data) => {
        try {
            const response = await api.patch('/users/me', data);
            if (response.data.success) {
                const updatedUser = response.data.data;
                const role = updatedUser.role || 'admin';
                localStorage.setItem(`auth_user_${role}`, JSON.stringify(updatedUser));
                setUser(updatedUser);
                return updatedUser;
            } else {
                throw new Error(response.data.message || 'Profile update failed');
            }
        } catch (error) {
            console.error('[AuthContext] Profile update failed:', error);
            throw error;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await api.post('/users/change-password', { currentPassword, newPassword });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Password change failed');
            }
            return response.data;
        } catch (error) {
            console.error('[AuthContext] Password change failed:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateSubscription,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
        getRedirectPath: () => getRedirectPath(user),
        getExitPath,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
