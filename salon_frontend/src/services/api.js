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
        const role = getCurrentRole();
        const token = localStorage.getItem(`auth_token_${role}`);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 + token refresh
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const role = getCurrentRole();
            localStorage.removeItem(`auth_token_${role}`);
            localStorage.removeItem(`auth_user_${role}`);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
