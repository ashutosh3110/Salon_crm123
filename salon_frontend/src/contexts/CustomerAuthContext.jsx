import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
        setLoading(false);
    }, []);

    // Step 1: Request OTP — POST /auth/request-otp { phone }
    const requestOtp = async (phone) => {
        // TODO: Replace with api.post('/auth/request-otp', { phone })
        console.log('[CustomerAuth] Mock OTP sent to:', phone);
        return { success: true, message: 'OTP sent successfully' };
    };

    // Step 2: Verify OTP — POST /auth/login-otp { phone, otp }
    const verifyOtp = async (phone, otp) => {
        // TODO: Replace with api.post('/auth/login-otp', { phone, otp })
        if (otp !== '1234') {
            throw new Error('Invalid OTP');
        }

        const mockCustomer = {
            _id: `cust-${Date.now()}`,
            name: '',
            phone,
            email: '',
            gender: '',
            birthday: null,
            loyaltyPoints: 320,
            role: 'customer',
            isNewUser: true, // When true, show name/gender form
        };
        const mockToken = `customer-token-${Date.now()}`;

        return { customer: mockCustomer, token: mockToken };
    };

    // Step 3: Complete profile (for new users)
    const completeProfile = async (profileData) => {
        // TODO: Replace with api.patch('/clients/:id', profileData)
        const updatedCustomer = { ...customer, ...profileData, isNewUser: false };
        localStorage.setItem('customer_user', JSON.stringify(updatedCustomer));
        setCustomer(updatedCustomer);
        return updatedCustomer;
    };

    // Login: combines OTP verify + localStorage save
    const customerLogin = async (phone, otp) => {
        const { customer: cust, token } = await verifyOtp(phone, otp);
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(cust));
        setCustomer(cust);
        return cust;
    };

    const customerLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        setCustomer(null);
        navigate('/app/login');
    };

    const updateCustomer = (data) => {
        const updated = { ...customer, ...data };
        localStorage.setItem('customer_user', JSON.stringify(updated));
        setCustomer(updated);
    };

    const value = {
        customer,
        loading,
        requestOtp,
        customerLogin,
        customerLogout,
        completeProfile,
        updateCustomer,
        isCustomerAuthenticated: !!customer,
    };

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
