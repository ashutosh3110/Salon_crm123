import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('[AuthContext] Failed to parse stored user:', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        console.log('[Auth] Mock Login active for:', email);

        const mockUser = {
            id: `mock-${Date.now()}`,
            email: email || 'admin@salon.com',
            name: (email || 'admin').split('@')[0].toUpperCase(),
            role: 'admin',
            isMock: true
        };
        const mockToken = `mock-token-${Date.now()}`;

        localStorage.clear();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
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
            isMock: true
        };
        const mockToken = `mock-token-${Date.now()}`;

        localStorage.clear();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return { accessToken: mockToken, user: mockUser };
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
