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

let abortController = new AbortController();

export const cancelAllRequests = () => {
    abortController.abort();
    abortController = new AbortController();
};

let callCount = 0;
let lastPath = typeof window !== 'undefined' ? window.location.pathname : '';

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        // Track and log API calls per page
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath !== lastPath) {
                callCount = 0;
                lastPath = currentPath;
                console.log(`%c[PAGE NAV] %cAPI counter reset for ${currentPath}`, 
                    'color: #3b82f6; font-weight: bold; padding: 2px 4px; border-radius: 4px; background: rgba(59,130,246,0.1)', 
                    'color: #888;'
                );
            }
            callCount++;
            console.log(`%c[API #${callCount}] %c${config.method?.toUpperCase()} %c${config.url}`, 
                'color: #C8956C; font-weight: bold; padding: 2px 4px; border-radius: 4px; background: rgba(200,149,108,0.1)', 
                'color: #888; font-weight: bold;', 
                'color: #555;'
            );
        }

        // Attach the global abort signal
        config.signal = abortController.signal;
        
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
        // Detailed logging for debugging APK connection issues
        console.error(`%c[API ERROR] %cURL: ${error.config?.url} %cCode: ${error.code}`, 
            'color: #ff5252; font-weight: bold;', 
            'color: #888;', 
            'color: #ff5252;');

        if (error.config?.skipToast) {
            return Promise.reject(error);
        }

        if (!error.response) {
            // This usually means the server is unreachable (Network Error)
            const isLocalhost = API_URL.includes('localhost');
            const message = isLocalhost 
                ? `Connection failed to ${API_URL}. If you are on a mobile device, please use your computer's IP address instead of localhost.`
                : `Network error: Unable to reach the server at ${API_URL}. Please check your internet connection.`;
            
            toast.error(message, {
                id: 'connectivity-error',
                duration: 6000
            });
        } else if (error.response?.status !== 401 && error.response?.status !== 403) {
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
