import axios from 'axios';

/**
 * Backend mounts all routes under `/v1` (NOT `/api/v1`).
 * Wrong base → requests hit no route → 404 "Not found".
 */
const normalizeApiBaseUrl = (url) => {
    const fallback = 'http://localhost:3000';
    let raw = String(url || fallback).trim().replace(/\/+$/, '');
    // Common mistake: VITE_API_URL=http://localhost:3000/api/v1 → server has no /api prefix
    raw = raw.replace(/\/api\/v1$/i, '/v1');
    // .../api → strip /api then we'll append /v1
    if (/\/api$/i.test(raw)) {
        raw = raw.replace(/\/api$/i, '');
    }
    if (!raw.endsWith('/v1')) {
        raw = `${raw}/v1`;
    }
    return raw;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get role from session/path
const getCurrentRole = () => {
    // 1. Check for explicitly set active role (most reliable)
    const activeRole = localStorage.getItem('active_auth_role');
    if (activeRole && localStorage.getItem(`auth_token_${activeRole}`)) {
        return activeRole;
    }

    // 2. Fallback to path detection
    const path = window.location.pathname;
    if (path.startsWith('/superadmin')) return 'superadmin';
    if (path.startsWith('/manager')) return 'manager';
    if (path.startsWith('/receptionist')) return 'receptionist';
    if (path.startsWith('/stylist')) return 'stylist';
    if (path.startsWith('/inventory')) return 'inventory_manager';
    
    // 3. Last resort: Find ANY available token
    const roles = ['admin', 'manager', 'receptionist', 'stylist', 'superadmin', 'accountant', 'inventory_manager'];
    const found = roles.find(r => localStorage.getItem(`auth_token_${r}`));
    return found || 'admin';
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
            // Superadmin (and similar) need tenant scope on the server; validateTenant reads this header.
            try {
                const userRaw = localStorage.getItem(`auth_user_${role}`);
                if (userRaw) {
                    const u = JSON.parse(userRaw);
                    if (u?.tenantId) {
                        config.headers['X-Tenant-Id'] = String(u.tenantId);
                    }
                }
            } catch {
                /* ignore */
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
        // No response = connection refused, CORS blocked, wrong URL, or server down
        if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
            error.isNetworkError = true;
            error.networkHint = `API unreachable (${API_BASE_URL}). Start the backend, set VITE_API_URL in .env.local, and ensure CORS allows this origin.`;
        }
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
