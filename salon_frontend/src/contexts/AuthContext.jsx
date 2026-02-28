import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// ── Role → Base Path Registry ──────────────────────────────────────────
const ROLE_REDIRECT_MAP = {
    superadmin: '/superadmin',
    admin: '/admin',
    manager: '/manager',
    receptionist: '/receptionist',
    stylist: '/stylist',
    accountant: '/accountant',
    inventory_manager: '/inventory',
};

export function getRedirectPath(user) {
    if (!user || !user.role) return '/login';
    return ROLE_REDIRECT_MAP[user.role] || '/admin';
}

// ── Mock Users for Dev Testing ─────────────────────────────────────────
const MOCK_USERS = {
    'admin@salon.com': { role: 'admin', name: 'Salon Owner' },
    'manager@salon.com': { role: 'manager', name: 'Rajesh Manager' },
    'reception@salon.com': { role: 'receptionist', name: 'Priya Receptionist' },
    'stylist@salon.com': { role: 'stylist', name: 'Anita Stylist' },
    'accounts@salon.com': { role: 'accountant', name: 'Deepak Accountant' },
    'inventory@salon.com': { role: 'inventory_manager', name: 'Suresh Inventory' },
    'superadmin@salon.com': { role: 'superadmin', name: 'Super Admin' },
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
        return 'admin'; // default
    };

    useEffect(() => {
        const role = getCurrentPanel(window.location.pathname);
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

    const login = async (email, password) => {
        console.log('[Auth] Mock Login active for:', email);

        const mockInfo = MOCK_USERS[email] || { role: 'admin', name: (email || 'admin').split('@')[0] };

        const mockUser = {
            id: `mock-${Date.now()}`,
            email: email || 'admin@salon.com',
            name: mockInfo.name,
            role: mockInfo.role,
            isMock: true,
        };
        const mockToken = `mock-token-${Date.now()}`;

        // Save session specific to the role
        localStorage.setItem(`auth_token_${mockUser.role}`, mockToken);
        localStorage.setItem(`auth_user_${mockUser.role}`, JSON.stringify(mockUser));

        setUser(mockUser);
        return { accessToken: mockToken, user: mockUser };
    };

    const register = async (payload) => {
        console.log('[Auth] Mock Registration active for:', payload.email);

        const mockUser = {
            id: `mock-reg-${Date.now()}`,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            role: 'admin',
            isMock: true,
        };
        const mockToken = `mock-token-${Date.now()}`;

        localStorage.setItem(`auth_token_${mockUser.role}`, mockToken);
        localStorage.setItem(`auth_user_${mockUser.role}`, JSON.stringify(mockUser));

        setUser(mockUser);
        return { accessToken: mockToken, user: mockUser };
    };

    const logout = () => {
        const role = user?.role || 'admin';
        localStorage.removeItem(`auth_token_${role}`);
        localStorage.removeItem(`auth_user_${role}`);
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        getRedirectPath: () => getRedirectPath(user),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
