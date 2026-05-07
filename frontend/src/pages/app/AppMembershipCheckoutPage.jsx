import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Star,
    Info,
    CheckCircle2
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';

const AppMembershipCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useCustomerTheme();
    const { customer } = useCustomerAuth();
    const { balance, refreshWallet } = useWallet();
    const isLight = theme === 'light';
    const [isProcessing, setIsProcessing] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('wallet');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Get plan details from state or default to Gold if none found (fallback)
    const plan = location.state?.plan || {
        id: 'gold',
        name: 'Gold Elite',
        price: 1999,
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
        bg: isLight ? '#FDFCFB' : '#080808',
        card: isLight ? '#FFFFFF' : '#121212',
        text: isLight ? '#121212' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.5)',
        accent: '#C8956C',
        border: isLight ? '#F0EBE6' : 'rgba(255,255,255,0.08)',
        input: isLight ? '#F8F8F8' : '#1A1A1A',
        success: '#10B981'
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
        if (selectedMethod !== 'wallet' && !razorpayLoaded) {
            alert('Secure gateway is initializing. Please wait.');
            return;
        }

        setIsProcessing(true);
        try {
            if (selectedMethod === 'wallet') {
                if (balance < numericPrice) {
                    alert('Insufficient Wallet Balance. Please use Razorpay or Top-up your wallet.');
                    setIsProcessing(false);
                    return;
                }

                if (!window.confirm(`Use ₹${numericPrice} from your wallet to buy ${plan.name}?`)) {
                    setIsProcessing(false);
                    return;
                }

                const res = await api.post('/loyalty/membership/wallet-pay', {
                    planId: plan.id
                });
                
                if (res.data.success) {
                    await refreshWallet();
                    navigate('/app/membership/success', { state: { plan } });
                }
                return;
            }

            const orderRes = await api.post('/loyalty/membership/order', {
                planId: plan.id
            });
            const orderData = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SatrrxFwKXJX8e',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Salon VIP Membership',
                description: `Tier: ${plan.name}`,
                order_id: orderData.orderId,
                handler: async (response) => {
                    try {
                        setIsProcessing(true);
                        const verifyRes = await api.post('/loyalty/membership/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan.id
                        });

                        if (verifyRes.data) {
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
                theme: { color: colors.accent },
                modal: { ondismiss: () => setIsProcessing(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Order creation failed:', error);
            const errorMsg = error.response?.data?.message || 'Check your internet connection';
            alert(`Unable to start transaction: ${errorMsg}`);
            setIsProcessing(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            fontFamily: "'Outfit', 'Inter', sans-serif",
            paddingBottom: '120px'
        }}>
            {/* ── HEADER ── */}
            <div style={{
                padding: '60px 20px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(15px)',
                background: isLight ? 'rgba(252, 249, 246, 0.8)' : 'rgba(8, 8, 8, 0.8)'
            }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    style={{
                        background: colors.card, border: `1px solid ${colors.border}`,
                        width: 44, height: 44, borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: colors.text, boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                >
                    <ArrowLeft size={18} />
                </motion.button>
                <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Finish Checkout</h1>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* ── VIP TICKET ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: plan.gradient,
                        borderRadius: '32px',
                        padding: '32px',
                        position: 'relative',
                        overflow: 'hidden',
                        color: plan.id === 'gold' ? '#121212' : '#FFF',
                        marginBottom: '40px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                    }}
                >
                    {/* Decorative Perforations */}
                    <div style={{ position: 'absolute', left: '-15px', top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: colors.bg }} />
                    <div style={{ position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: colors.bg }} />
                    <div style={{ 
                        position: 'absolute', left: '15px', right: '15px', top: '50%', 
                        borderTop: '2px dashed rgba(0,0,0,0.1)', 
                        height: 0, zIndex: 0 
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>SELECTED TIER</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {getPlanIcon(plan.id, 20)}
                                    <h2 style={{ fontSize: '22px', fontWeight: 900, margin: 0 }}>{plan.name}</h2>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 900 }}>VIP ACCESS</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>MONTHLY DUES</p>
                                <h3 style={{ fontSize: '32px', fontWeight: 900, margin: 0 }}>₹{numericPrice.toLocaleString()}</h3>
                            </div>
                            <div style={{ opacity: 0.6 }}>
                                <CheckCircle2 size={32} strokeWidth={1} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── BILLING STEPS ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* ── PLAN BENEFITS ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Star size={16} color={colors.accent} />
                            <h3 style={{ fontSize: '13px', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Privileges</h3>
                        </div>
                        <div style={{ 
                            background: colors.card, border: `1px solid ${colors.border}`, 
                            borderRadius: '24px', padding: '24px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {(plan.serviceDiscountValue > 0 || plan.productDiscountValue > 0) && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {plan.serviceDiscountValue > 0 && (
                                        <div style={{ flex: 1, padding: '16px', borderRadius: '16px', background: `${colors.accent}10`, border: `1px solid ${colors.accent}20` }}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, color: colors.accent, textTransform: 'uppercase', marginBottom: '4px' }}>Services</p>
                                            <p style={{ fontSize: '18px', fontWeight: 900, color: colors.text, margin: 0 }}>
                                                {plan.serviceDiscountValue}{plan.serviceDiscountType === 'percentage' ? '%' : '₹'} OFF
                                            </p>
                                        </div>
                                    )}
                                    {plan.productDiscountValue > 0 && (
                                        <div style={{ flex: 1, padding: '16px', borderRadius: '16px', background: `${colors.accent}10`, border: `1px solid ${colors.accent}20` }}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, color: colors.accent, textTransform: 'uppercase', marginBottom: '4px' }}>Products</p>
                                            <p style={{ fontSize: '18px', fontWeight: 900, color: colors.text, margin: 0 }}>
                                                {plan.productDiscountValue}{plan.productDiscountType === 'percentage' ? '%' : '₹'} OFF
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {plan.benefits?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {plan.benefits.map((benefit, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <CheckCircle2 size={14} color={colors.success} />
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Summary Card */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Info size={16} color={colors.accent} />
                            <h3 style={{ fontSize: '13px', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Summary</h3>
                        </div>
                        <div style={{ 
                            background: colors.card, border: `1px solid ${colors.border}`, 
                            borderRadius: '24px', padding: '24px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontSize: '15px', color: colors.textMuted, fontWeight: 500 }}>Membership Plan</span>
                                <span style={{ fontSize: '15px', fontWeight: 700 }}>₹{numericPrice.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <span style={{ fontSize: '15px', color: colors.textMuted, fontWeight: 500 }}>GST (18%)</span>
                                <span style={{ fontSize: '15px', fontWeight: 700 }}>₹{taxAmount.toLocaleString()}</span>
                            </div>
                            <div style={{ height: '1px', background: colors.border, marginBottom: '20px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '17px', fontWeight: 900 }}>Total Payable</span>
                                <span style={{ fontSize: '24px', fontWeight: 900, color: colors.accent }}>₹{totalWithTax.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.section>

                    {/* Payment Select */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 style={{ fontSize: '13px', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Preferred Method</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { id: 'wallet', name: 'Salon Wallet', desc: `Current Balance: ₹${(balance || 0).toLocaleString()}`, icon: <ShieldCheck size={18} />, badge: balance < numericPrice ? 'Low Balance' : 'Instant' },
                                { id: 'online', name: 'Secure Online Payment', desc: 'UPI, Cards, NetBanking', icon: <CreditCard size={18} />, badge: 'Fast' }
                            ].map((method) => {
                                const isSelected = selectedMethod === method.id;
                                const isWallet = method.id === 'wallet';
                                const canPayWithWallet = isWallet ? balance >= numericPrice : true;

                                return (
                                    <motion.div 
                                        key={method.id}
                                        whileTap={ (isWallet && !canPayWithWallet) ? {} : { scale: 0.98 }}
                                        onClick={() => setSelectedMethod(method.id)}
                                        style={{
                                            background: isSelected ? colors.card : 'transparent',
                                            border: isSelected ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                                            borderRadius: '24px',
                                            padding: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            cursor: (isWallet && !canPayWithWallet) ? 'not-allowed' : 'pointer',
                                            opacity: (isWallet && !canPayWithWallet) ? 0.6 : 1,
                                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                            boxShadow: isSelected ? '0 10px 25px rgba(0,0,0,0.05)' : 'none'
                                        }}
                                    >
                                        <div style={{ 
                                            width: 48, height: 48, borderRadius: '16px',
                                            background: isSelected ? colors.accent : colors.input,
                                            color: isSelected ? '#FFF' : colors.textMuted,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {method.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '16px', fontWeight: isSelected ? 800 : 700, margin: 0 }}>{method.name}</p>
                                            <p style={{ fontSize: '12px', color: isWallet && !canPayWithWallet ? '#EF4444' : colors.textMuted, margin: 0 }}>{method.desc}</p>
                                        </div>
                                        {method.badge && (
                                            <span style={{ 
                                                fontSize: '10px', fontWeight: 900, 
                                                padding: '4px 10px', borderRadius: '10px',
                                                background: isWallet && !canPayWithWallet ? '#FEE2E2' : (isSelected ? 'rgba(255,255,255,0.2)' : '#E0E7FF'),
                                                color: isWallet && !canPayWithWallet ? '#EF4444' : (isSelected ? '#FFF' : '#4338CA')
                                            }}>
                                                {method.badge}
                                            </span>
                                        )}
                                        {isSelected && (
                                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent, marginLeft: '8px', border: `2px solid ${colors.accent}` }}>
                                                <CheckCircle2 size={14} strokeWidth={4} />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.section>
                </div>

                {/* Secure Footer */}
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', opacity: 0.6 }}>
                        <ShieldCheck size={16} color={colors.success} />
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>PCI-DSS Level 1 Secure Gateway</span>
                    </div>

                    <motion.button
                        disabled={isProcessing}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePayment}
                        style={{
                            width: '100%',
                            height: '64px',
                            background: colors.accent,
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '32px 10px 32px 10px',
                            fontSize: '17px',
                            fontWeight: 900,
                            cursor: isProcessing ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: `0 20px 40px ${isLight ? 'rgba(200,149,108,0.3)' : 'rgba(0,0,0,0.5)'}`,
                            opacity: isProcessing ? 0.7 : 1
                        }}
                    >
                        {isProcessing ? (
                            <>Verifying Transaction...</>
                        ) : (
                            <>Authorize & Pay <ChevronRight size={20} /></>
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default AppMembershipCheckoutPage;

