import axios from 'axios';
import toast from 'react-hot-toast';
import mockApi from './mock/mockApi';

/**
 * Backend mounts all routes under `/v1` (NOT `/api/v1`).
 */
const normalizeApiBaseUrl = (url) => {
    const fallback = 'http://localhost:3000';
    let raw = String(url || fallback).trim().replace(/\/+$/, '');
    raw = raw.replace(/\/api\/v1$/i, '/v1');
    if (/\/api$/i.test(raw)) {
        raw = raw.replace(/\/api$/i, '');
    }
    if (!raw.endsWith('/v1')) {
        raw = `${raw}/v1`;
    }
    return raw;
};

const getFriendlyErrorMessage = (error) => {
    if (!error.response) {
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            return 'backend not connected plz try again';
        }
        return 'Something went wrong. Please try again.';
    }

    const { status, data } = error.response;
    const message = data?.message || '';

    if (status === 403 && message.toLowerCase().includes('limit reached')) {
        return 'Staff limit reached. Please upgrade your plan.';
    }
    if (status === 400 && message.toLowerCase().includes('email already taken')) {
        return 'This email is already in use.';
    }
    if (status === 401) {
        return 'Your session has expired. Please login again.';
    }
    if (status >= 500) {
        return 'Something went wrong on the server. Please try again later.';
    }

    return message || 'An unexpected error occurred.';
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

// Create original axios instance
const apiInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get role
const getCurrentRole = () => {
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
    const roles = ['admin', 'manager', 'receptionist', 'stylist', 'superadmin', 'accountant', 'inventory_manager'];
    const found = roles.find(r => localStorage.getItem(`auth_token_${r}`));
    return found || 'admin';
};

// Interceptors for the REAL instance (incase we ever switch back)
apiInstance.interceptors.request.use(
    (config) => {
        const path = window.location.pathname;
        if (path.startsWith('/app')) {
            const token = localStorage.getItem('customer_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            try {
                const activeTenantId = localStorage.getItem('active_tenant_id');
                if (activeTenantId) config.headers['X-Tenant-Id'] = activeTenantId;
            } catch { /* ignore */ }
        } else {
            const role = getCurrentRole();
            const token = localStorage.getItem(`auth_token_${role}`);
            if (token) config.headers.Authorization = `Bearer ${token}`;
            try {
                const userRaw = localStorage.getItem(`auth_user_${role}`);
                if (userRaw) {
                    const u = JSON.parse(userRaw);
                    if (u?.tenantId) config.headers['X-Tenant-Id'] = String(u.tenantId);
                }
            } catch { /* ignore */ }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        if (!response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
            error.isNetworkError = true;
        }
        if (response?.status === 401) {
            const path = window.location.pathname;
            const isPublicPage = path === '/' || ['/login', '/register', '/forgot-password', '/admin/login', '/superadmin/login', '/blog', '/contact', '/launchpad', '/app/login'].some(p => path === p || path.startsWith(p));
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
        const path = window.location.pathname;
        const isLoginPage = path.includes('/login') || path === '/';
        if (response?.status !== 401 && !isLoginPage) {
            toast.error(getFriendlyErrorMessage(error), { id: 'api-error-toast' });
        }
        return Promise.reject(error);
    }
);

/**
 * OFFLINE MIGRATION CORE:
 * We proxy the exported 'api' object to use mockApi for ALL network calls.
 * This removes all "backend not connected" toasts globally.
 */
const api = {
    ...apiInstance,
    get: mockApi.get,
    post: mockApi.post,
    put: mockApi.put,
    patch: mockApi.patch,
    delete: mockApi.delete,
    interceptors: apiInstance.interceptors,
    defaults: apiInstance.defaults
};

export default api;
