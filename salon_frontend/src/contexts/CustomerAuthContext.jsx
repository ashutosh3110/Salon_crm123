import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { requestForToken } from '../services/pushNotification';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
    const verifyOtp = async (phone, otp, tenantId, referralCode = '') => {
        if (!tenantId) throw new Error('Please select a salon first');
        const res = await api.post('/auth/login-otp', { phone, tenantId, otp, referralCode });
        const { accessToken, client } = res.data?.data || res.data;
        const cust = {
            _id: client._id,
            name: client.name || '',
            phone: client.phone,
            email: client.email || '',
            gender: client.gender || '',
            birthday: client.birthday || null,
            loyaltyPoints: client.loyaltyPoints || 0,
            tenantId: client.tenantId,
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
    const customerLogin = async (phone, otp, tenantId, referralCode = '') => {
        const { customer: cust, token } = await verifyOtp(phone, otp, tenantId, referralCode);
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(cust));
        setCustomer(cust);
        // Register for push notifications after login
        requestForToken().catch(err => console.error('[CustomerAuth] Push registration error:', err));
        return cust;
    };

 const customerLogout = async () => {
        const fcmToken = localStorage.getItem('fcm_token');
        if (fcmToken) {
            try {
                await api.post('/notifications/remove-token', { fcmToken });
                localStorage.removeItem('fcm_token');
            } catch (err) {
                console.warn('[CustomerAuth] Failed to remove FCM token:', err.message);
            }
        }
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        setCustomer(null);
        navigate('/app/login');
    };


    const updateCustomer = async (data) => {
        const updated = { ...customer, ...data };
        const payload = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.email !== undefined) payload.email = data.email || '';
        if (data.gender !== undefined) payload.gender = data.gender || '';
        if (data.birthday !== undefined) payload.birthday = data.birthday || null;
        if (Object.keys(payload).length > 0) {
            try {
                await api.patch(`/clients/${customer._id}`, payload);
            } catch (e) {
                console.warn('[CustomerAuth] Profile update failed, saving locally:', e);
            }
        }
        localStorage.setItem('customer_user', JSON.stringify(updated));
        setCustomer(updated);
    };

    const value = useMemo(() => ({
        customer,
        loading,
        requestOtp,
        customerLogin,
        customerLogout,
        completeProfile,
        updateCustomer,
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
