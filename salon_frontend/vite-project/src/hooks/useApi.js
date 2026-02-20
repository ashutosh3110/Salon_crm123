import { useState, useCallback } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import mockData from '../data/data.json';

/**
 * Custom hook for API calls with loading, error, and success states
 */
export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (method, url, data = null, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            // MOCK API INTERCEPTOR
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Extract resource name from URL (e.g., '/clients' -> 'clients')
            const resource = url.split('/').find(part => part && part !== 'v1'); // simplified

            // Check for mock data match (very basic router)
            if (mockData[resource]) {
                return {
                    data: mockData[resource],
                    total: mockData[resource].length,
                    page: 1,
                    limit: 10
                };
            }

            // Special cases
            if (resource === 'dashboard' || resource === 'stats') {
                return mockData.stats;
            }

            // Fallback for POST/PUT/DELETE
            if (method !== 'get') {
                console.log(`[Mock API] ${method.toUpperCase()} request to ${url} with data:`, data);
                return { success: true, message: 'Operation successful (Mock)' };
            }

            // If no mock data found, optionally error or return empty array
            console.warn(`[Mock API] No data found for ${url}, returning empty array`);
            return [];

            /* REAL API CALL (Disabled)
            const config = { method, url, ...options };
            if (data) {
                if (method === 'get') {
                    config.params = data;
                } else {
                    config.data = data;
                }
            }
            const response = await api(config);
            if (options.successMessage) {
                toast.success(options.successMessage);
            }
            return response.data;
            */
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Something went wrong';
            setError(message);

            if (!options.silent) {
                toast.error(message);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const get = useCallback((url, params, opts) => request('get', url, params, opts), [request]);
    const post = useCallback((url, data, opts) => request('post', url, data, opts), [request]);
    const put = useCallback((url, data, opts) => request('put', url, data, opts), [request]);
    const patch = useCallback((url, data, opts) => request('patch', url, data, opts), [request]);
    const del = useCallback((url, opts) => request('delete', url, null, opts), [request]);

    return { loading, error, get, post, put, patch, del, request };
};
