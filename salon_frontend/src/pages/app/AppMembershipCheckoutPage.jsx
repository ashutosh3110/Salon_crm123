import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    ShieldCheck,
    CreditCard,
    Smartphone,
    Clock,
    ChevronRight,
    Crown,
    Gem,
    Star
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import api from '../../services/api';

const AppMembershipCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useCustomerTheme();
    const { customer } = useCustomerAuth();
    const isLight = theme === 'light';
    const [isProcessing, setIsProcessing] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('upi');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Get plan details from state or default to Gold if none found (fallback)
    const plan = location.state?.plan || {
        id: 'gold',
        name: 'Gold Elite',
        price: '₹1,999',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
    };

    const getPlanIcon = (id, size = 24) => {
        switch (id) {
            case 'platinum': return <Gem size={size} />;
            case 'silver': return <Star size={size} />;
            default: return <Crown size={size} />;
        }
    };

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        accent: '#C8956C',
        border: isLight ? '#F0F0F0' : 'rgba(255,255,255,0.05)',
        input: isLight ? '#F8F8F8' : '#2A2A2A',
    };

    const getNumericPrice = (p) => {
        if (typeof p === 'number') return p;
        if (typeof p === 'string') {
            return parseInt(p.replace(/[^0-9]/g, ''), 10) || 0;
        }
        return 0;
    };

    const numericPrice = getNumericPrice(plan.price);
    const taxAmount = Math.round(numericPrice * 0.18);
    const totalWithTax = numericPrice + taxAmount;

    const handlePayment = async () => {
        if (!razorpayLoaded) {
            alert('Razorpay is still loading. Please wait.');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Order on Backend
            const orderRes = await api.post('/loyalty/membership/order', {
                planId: plan.id
            });
            const orderData = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SatrrxFwKXJX8e',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Wapixo Membership',
                description: `Purchase of ${plan.name} plan`,
                order_id: orderData.orderId,
                handler: async (response) => {
                    try {
                        // 2. Verify Payment on Backend
                        setIsProcessing(true);
                        const verifyRes = await api.post('/loyalty/membership/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan.id
                        });

                        if (verifyRes.data) {
                            // 3. Success
                            navigate('/app/membership/success', { state: { plan } });
                        }
                    } catch (error) {
                        console.error('Verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: customer?.name || '',
                    email: customer?.email || '',
                    contact: customer?.phone || ''
                },
                theme: {
                    color: '#C8956C'
                },
                modal: {
                    ondismiss: () => setIsProcessing(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Order creation failed:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Check your internet connection';
            alert(`Failed to initiate payment: ${errorMsg}`);
            setIsProcessing(false);
        }
    };

    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            fontFamily: "'Inter', sans-serif",
            paddingBottom: '120px'
        }}>
            {/* ── HEADER ── */}
            <div style={{
                padding: '50px 16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backdropFilter: 'blur(10px)',
                background: isLight ? 'rgba(252, 249, 246, 0.8)' : 'rgba(15, 15, 15, 0.8)'
            }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    style={{
                        background: colors.card, border: `1px solid ${colors.border}`,
                        width: 40, height: 40, borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: colors.text
                    }}
                >
                    <ArrowLeft size={18} />
                </motion.button>
                <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Review & Pay</h1>
            </div>

            <div style={{ padding: '0 16px' }}>
                {/* ── SELECTED PLAN TICKET ── */}
                <motion.div
                    {...fadeUp}
                    style={{
                        background: plan.gradient,
                        borderRadius: '24px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        color: plan.id === 'gold' ? '#000' : '#FFF',
                        marginBottom: '32px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                >
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {getPlanIcon(plan.id, 20)}
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 900 }}>{plan.name}</span>
                            </div>
                            <div style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '10px', fontWeight: 800 }}>VIP LEVEL</div>
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>{plan.price} <span style={{ fontSize: '12px', fontWeight: 500, opacity: 0.7 }}>per month</span></h2>
                    </div>
                    {/* Decorative cut */}
                    <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: colors.bg }} />
                    <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: colors.bg }} />
                </motion.div>

                {/* ── PAYMENT SUMMARY ── */}
                <motion.div
                    {...fadeUp}
                    transition={{ delay: 0.1 }}
                    style={{ marginBottom: '32px' }}
                >
                    <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', color: colors.textMuted }}>BILLING SUMMARY</h3>
                    <div style={{ background: colors.card, borderRadius: '24px', padding: '20px', border: `1px solid ${colors.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', color: colors.textMuted }}>Subtotal</span>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>₹{numericPrice.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', color: colors.textMuted }}>Taxes & Fees (18%)</span>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>₹{taxAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ height: '1px', background: colors.border, margin: '12px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800 }}>Amt to Pay</span>
                            <span style={{ fontSize: '18px', fontWeight: 900, color: colors.accent }}>₹{totalWithTax.toLocaleString()}</span>
                        </div>
                    </div>
                </motion.div>

                {/* ── PAYMENT METHODS ── */}
                <motion.div
                    {...fadeUp}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: '40px' }}
                >
                    <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', color: colors.textMuted }}>SELECT METHOD</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { id: 'upi', name: 'UPI (GPay / PhonePe)', icon: <Smartphone size={20} /> },
                            { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard size={20} /> },
                            { id: 'net', name: 'Net Banking', icon: <Clock size={20} /> }
                        ].map((method) => {
                            const isSelected = selectedMethod === method.id;
                            return (
                                <div 
                                    key={method.id} 
                                    onClick={() => setSelectedMethod(method.id)}
                                    style={{
                                        background: isSelected ? 'rgba(200,149,108,0.1)' : colors.card,
                                        border: isSelected ? `1.5px solid ${colors.accent}` : `1px solid ${colors.border}`,
                                        borderRadius: '16px 4px 16px 4px',
                                        padding: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ color: isSelected ? colors.accent : colors.textMuted }}>{method.icon}</div>
                                    <span style={{ flex: 1, fontSize: '14px', fontWeight: isSelected ? 700 : 500 }}>{method.name}</span>
                                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.accent }} />}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── SECURITY NOTE ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', opacity: 0.6 }}>
                    <ShieldCheck size={16} color={colors.accent} />
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>End-to-End Encrypted Secure Checkout</span>
                </div>

                {/* ── PAY BUTTON ── */}
                <motion.button
                    disabled={isProcessing}
                    whileTap={{ scale: 0.96 }}
                    onClick={handlePayment}
                    style={{
                        width: '100%',
                        height: '56px',
                        background: colors.accent,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '20px 6px 20px 6px',
                        fontSize: '16px',
                        fontWeight: 900,
                        cursor: isProcessing ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 15px 30px rgba(200,149,108,0.3)',
                        opacity: isProcessing ? 0.7 : 1
                    }}
                >
                    {isProcessing ? (
                        <>Verifying Payment...</>
                    ) : (
                        <>Complete Payment <ChevronRight size={20} /></>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default AppMembershipCheckoutPage;
