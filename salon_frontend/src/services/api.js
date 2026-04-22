import axios from 'axios';
import toast from 'react-hot-toast';

const envUrl = import.meta.env.VITE_API_URL;
let API_URL = '/api';

if (envUrl && envUrl.startsWith('http')) {
    let cleaned = envUrl;
    // Fix accidental double protocol typos like https://https://domain.com
    if (cleaned.toLowerCase().includes('://https://')) {
        cleaned = cleaned.replace(/:\/\/https:\/\//i, '://');
    } else if (cleaned.toLowerCase().includes('://http://')) {
        cleaned = cleaned.replace(/:\/\/http:\/\//i, '://');
    }

    try {
        const parsed = new URL(cleaned);
        // If hostname is just 'https' or 'http', it's a malformed config
        // Allow dots (domains) or 'localhost'
        const isLocalhost = parsed.hostname === 'localhost';
        const isProperDomain = parsed.hostname.includes('.');
        const isInvalidProtocolHost = parsed.hostname === 'https' || parsed.hostname === 'http';

        if (!isInvalidProtocolHost && (isProperDomain || isLocalhost)) {
            API_URL = cleaned;
        } else {
            API_URL = '/api';
        }
    } catch (e) {
        API_URL = '/api';
    }
}

export const API_BASE_URL = API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {}
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('customer_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status !== 401) {
            const message = error.response?.data?.message || 'A network error occurred';
            
            // Check if it's an image size limit error to show as info instead of error
            if (message.toLowerCase().includes('image too large')) {
                toast(message, {
                    id: 'global-api-error',
                    icon: 'ℹ️',
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        borderRadius: '8px',
                    },
                });
            } else {
                toast.error(message, {
                    id: 'global-api-error',
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
