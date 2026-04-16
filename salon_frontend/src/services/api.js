import axios from 'axios';

const envUrl = import.meta.env.VITE_API_URL;
const API_URL = (envUrl && envUrl.startsWith('http')) ? envUrl : '/api';
export const API_BASE_URL = API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the auth token to every request
// Priority: admin token > customer token
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

export default api;
