import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; // Use real API
import { registerToken as requestForToken } from '../services/firebase';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const stored = localStorage.getItem('customer_user');
        const token = localStorage.getItem('customer_token');
        if (stored && token) {
            try {
                setCustomer(JSON.parse(stored));
            } catch {
                localStorage.removeItem('customer_user');
                localStorage.removeItem('customer_token');
            }
        }
        // Initialize push notifications for customer
        if (stored && token) {
            requestForToken().catch(err => console.error('[CustomerAuth] Push init error:', err));
        }
        setLoading(false);
    }, []);

    // Step 1: Request OTP — POST /auth/request-otp { phone, tenantId }
    const requestOtp = async (phone, tenantId) => {
        if (!tenantId) throw new Error('Please select a salon first');
        const res = await api.post('/auth/request-otp', { phone, tenantId });
        return {
            success: true,
            message: 'OTP sent successfully',
            otp: res.data?.otp // Capture for debug
        };
    };

    // Step 2: Verify OTP — POST /auth/login-otp { phone, tenantId, otp }
    const verifyOtp = async (phone, otp, tenantId, outletId = '', referralCode = '') => {
        if (!tenantId) throw new Error('Please select a salon first');
        const res = await api.post('/auth/login-otp', { phone, tenantId, outletId, otp, referralCode });
        const { accessToken, client } = res.data?.data || res.data;
        const cust = {
            _id: client._id,
            name: client.name || '',
            phone: client.phone,
            email: client.email || '',
            gender: client.gender || '',
            birthday: client.birthday || null,
            loyaltyPoints: client.loyaltyPoints || 0,
            referralCode: client.referralCode || '',
            tenantId: client.tenantId,
            salonId: client.salonId || client.tenantId,
            lastOutletId: client.lastOutletId || outletId,
            role: 'customer',
            isNewUser: client.isNewUser ?? true,
        };
        return { customer: cust, token: accessToken };
    };

    // Step 3: Complete profile (for new users)
    const completeProfile = async (profileData) => {
        const updatedCustomer = { ...customer, ...profileData, isNewUser: false };
        try {
            await api.patch(`/clients/${customer._id}`, profileData);
        } catch (e) {
            console.warn('[CustomerAuth] Profile update failed, saving locally:', e);
        }
        localStorage.setItem('customer_user', JSON.stringify(updatedCustomer));
        setCustomer(updatedCustomer);
        return updatedCustomer;
    };

    // Login: combines OTP verify + localStorage save
    const customerLogin = useCallback(async (phone, otp, tenantId, outletId = '', referralCode = '') => {
        const { customer: cust, token } = await verifyOtp(phone, otp, tenantId, outletId, referralCode);
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(cust));
        setCustomer(cust);
        // Register for push notifications after login
        requestForToken().catch(err => console.error('[CustomerAuth] Push registration error:', err));
        return cust;
    }, []);

    const customerLogout = async () => {
        // Clear ALL data from localStorage for security
        localStorage.clear();

        setCustomer(null);
        navigate('/app/login');
    };


    const updateCustomer = useCallback(async (data) => {
        const payload = { ...data };
        try {
            const res = await api.patch('/customer/profile', payload);
            if (res.data?.success) {
                const updated = { ...customer, ...res.data.data };
                localStorage.setItem('customer_user', JSON.stringify(updated));
                setCustomer(updated);
                return updated;
            }
        } catch (e) {
            console.error('[CustomerAuth] Profile update failed:', e);
            // Fallback for offline/development if needed, but better to fail if API is required
            const updated = { ...customer, ...data };
            localStorage.setItem('customer_user', JSON.stringify(updated));
            setCustomer(updated);
            return updated;
        }
    }, [customer]);

    const refreshProfile = useCallback(async () => {
        if (!localStorage.getItem('customer_token')) return;
        if (location.pathname.startsWith('/superadmin')) return;
        try {
            const res = await api.get('/customer/profile');
            if (res.data?.success) {
                // Use functional update to avoid dependency on 'customer'
                setCustomer(prev => {
                    const refreshed = { ...prev, ...res.data.data };
                    localStorage.setItem('customer_user', JSON.stringify(refreshed));
                    return refreshed;
                });
                return res.data.data;
            }
        } catch (err) {
            console.error('[CustomerAuth] Profile refresh failed:', err);
        }
    }, [location.pathname]); // Removed 'customer' dependency by using functional update

    // Automatic profile refresh removed to prevent redundant calls on Home page.
    // Pages can call refreshProfile() manually if needed.

    const value = useMemo(() => ({
        customer,
        loading,
        requestOtp,
        customerLogin,
        customerLogout,
        completeProfile,
        updateCustomer,
        refreshProfile,
        setCustomer,
        isCustomerAuthenticated: !!customer,
    }), [customer, loading]);

    return (
        <CustomerAuthContext.Provider value={value}>
            {children}
        </CustomerAuthContext.Provider>
    );
}

export function useCustomerAuth() {
    const context = useContext(CustomerAuthContext);
    if (!context) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
    return context;
}
