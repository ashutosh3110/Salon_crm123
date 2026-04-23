
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mockApi from '../services/mock/mockApi';
import authData from '../data/authMockData.json';

import api, { cancelAllRequests } from '../services/api';

const AuthContext = createContext(null);

const ROLE_REDIRECT_MAP = authData.redirect_map || {};

/**
 * NAMED EXPORT: Restored to fix AuthPage.jsx import error
 */
export const getRedirectPath = (user) => {
    if (!user || !user.role) return '/login';
    const roleKey = String(user.role).toLowerCase();
    return ROLE_REDIRECT_MAP[roleKey] || '/admin';
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const role = localStorage.getItem('active_auth_role');
        if (role) {
            const storedUser = localStorage.getItem(`auth_user_${role}`);
            if (storedUser) {
                try { setUser(JSON.parse(storedUser)); } catch (e) {}
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            // 1. Try Real Backend First
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { accessToken, user: userData } = response.data.data;
                const role = userData.role || 'admin';
                
                localStorage.setItem(`auth_token_${role}`, accessToken);
                localStorage.setItem(`auth_user_${role}`, JSON.stringify(userData));
                localStorage.setItem('active_auth_role', role);
                localStorage.setItem('token', accessToken);
                
                setUser(userData);
                return { accessToken, user: userData };
            }
        } catch (realErr) {
            console.error('[AuthContext] Login failed:', realErr.response?.data?.message || realErr.message);
            throw realErr;
        }
    }, []);

    const logout = useCallback(() => {
        // 0. Cancel all pending requests immediately
        cancelAllRequests();

        const role = user?.role || localStorage.getItem('active_auth_role') || 'admin';
        
        // 1. Clear Auth specific keys
        localStorage.removeItem(`auth_token_${role}`);
        localStorage.removeItem(`auth_user_${role}`);
        localStorage.removeItem('active_auth_role');
        localStorage.removeItem('token');
        
        // 2. Clear Tenant/Business specific keys to prevent background API calls
        localStorage.removeItem('active_salon_id');
        localStorage.removeItem('active_outlet_id');
        localStorage.removeItem('active_tenant_id');
        localStorage.removeItem('wapixo_selected_outlet');
        
        // 3. Clear Customer session if any
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        localStorage.removeItem('fcm_token');

        // 4. Reset state
        setUser(null);
        
        // 5. Redirect based on role
        if (role === 'superadmin') {
            navigate('/superadmin/login');
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        register: async (formData) => {
            const response = await api.post('/salons/register', {
                ...formData
            });
            return response.data;
        },
        isAuthenticated: !!user
    }), [user, loading, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    return context || { isAuthenticated: false, loading: false };
}
