import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get role from current path
const getCurrentRole = () => {
    const path = window.location.pathname;
    if (path.startsWith('/superadmin')) return 'superadmin';
    if (path.startsWith('/manager')) return 'manager';
    if (path.startsWith('/receptionist')) return 'receptionist';
    if (path.startsWith('/stylist')) return 'stylist';
    if (path.startsWith('/inventory')) return 'inventory_manager';
    if (path.startsWith('/accountant')) return 'accountant';
    return 'admin';
};

// Request interceptor — attach JWT token
api.interceptors.request.use(
    (config) => {
        const path = window.location.pathname;
        // Customer app uses customer_token
        if (path.startsWith('/app')) {
            const token = localStorage.getItem('customer_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } else {
            const role = getCurrentRole();
            const token = localStorage.getItem(`auth_token_${role}`);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn(`[API] No token found for role: ${role}`);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (avoid redirect loop on login/register pages)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const path = window.location.pathname;
            const isPublicPage = path === '/' || ['/login', '/register', '/forgot-password', '/admin/login', '/superadmin/login', '/blog', '/contact', '/launchpad', '/app/login'].some(p => path === p || path.startsWith(p)) || path.startsWith('/c/');
            if (!isPublicPage) {
                if (path.startsWith('/app')) {
                    localStorage.removeItem('customer_token');
                    localStorage.removeItem('customer_user');
                    window.location.href = '/app/login';
                } else {
                    const role = getCurrentRole();
                    localStorage.removeItem(`auth_token_${role}`);
                    localStorage.removeItem(`auth_user_${role}`);
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
