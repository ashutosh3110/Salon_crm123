import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
    ArrowLeft, MessageCircle, Mail, Phone, ExternalLink, 
    ChevronRight, HelpCircle, Search, FileText, Plus,
    Loader2, AlertCircle, Clock, CheckCircle2, X
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';

const FAQ_ITEMS = [
    { question: "How do I book an appointment?", answer: "You can book an appointment by selecting a service, choosing your preferred expert, and picking a time slot that works for you." },
    { question: "Can I cancel my booking?", answer: "Yes, you can cancel your booking up to 2 hours before the scheduled time through the 'My Bookings' section." },
    { question: "What are loyalty points?", answer: "Loyalty points are earned with every service and product purchase. You can redeem them for discounts and exclusive offers." },
    { question: "How do I update my profile?", answer: "Go to the 'Profile' section from the navigation bar to update your contact details and preferences." }
];

const TICKET_CATEGORIES = [
    'Billing', 'Technical Issue', 'Feature Request', 'General Inquiry', 'Account Access'
];

export default function AppHelpSupportPage() {
    const navigate = useNavigate();
    const [activeFaq, setActiveFaq] = useState(null);
    const [activeTab, setActiveTab] = useState('faq'); // 'faq' or 'tickets'
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    // Ticket States
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        category: 'General Inquiry',
        description: ''
    });

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
        accent: '#C8956C',
        input: isLight ? '#F8F9FA' : '#141414'
    };

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/support/tickets');
            setTickets(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'tickets') {
            fetchTickets();
        }
    }, [activeTab]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.subject || !newTicket.description) return;

        setSubmitting(true);
        try {
            await api.post('/support/tickets', newTicket);
            setShowCreateModal(false);
            setNewTicket({ subject: '', category: 'General Inquiry', description: '' });
            fetchTickets();
        } catch (error) {
            console.error('Failed to create ticket:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return '#3B82F6';
            case 'in-progress': return '#F59E0B';
            case 'resolved': return '#10B981';
            case 'closed': return colors.textMuted;
            default: return colors.accent;
        }
    };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh', color: colors.text }}>
            {/* Header */}
            <div style={{
                padding: '20px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'sticky',
                top: 0,
                background: colors.bg,
                zIndex: 10,
                borderBottom: `1px solid ${colors.border}`
            }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <h1 style={{ fontSize: '18px', fontWeight: 800 }}>Help & Support</h1>
            </div>

            <div style={{ padding: '20px 16px' }}>
                {/* Custom Tabs */}
                <div style={{ 
                    display: 'flex', 
                    background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                    padding: '4px',
                    borderRadius: '14px',
                    marginBottom: '24px'
                }}>
                    {['faq', 'tickets'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '10px',
                                border: 'none',
                                background: activeTab === tab ? colors.card : 'transparent',
                                color: activeTab === tab ? colors.accent : colors.textMuted,
                                fontSize: '13px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            {tab === 'faq' ? 'Knowledge Base' : 'My Tickets'}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'faq' ? (
                        <motion.div
                            key="faq"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                        >
                            {/* Search Bar */}
                            <div style={{
                                background: isLight
                                    ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                    : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                boxShadow: isLight ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                                borderRadius: '20px 6px 20px 6px',
                                padding: '0 16px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                border: `1.5px solid ${isLight ? '#E8ECEF' : 'rgba(255,255,255,0.05)'}`,
                                marginBottom: '32px'
                            }}>
                                <Search size={18} color={colors.accent} />
                                <input
                                    type="text"
                                    placeholder="Search for help..."
                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, fontSize: '14px', width: '100%', fontWeight: 600 }}
                                />
                            </div>

                            {/* FAQ Section */}
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                    <HelpCircle size={18} color={colors.accent} />
                                    <h2 style={{ fontSize: '18px', fontWeight: 900, fontFamily: "'Playfair Display', serif", margin: 0 }}>Frequently Asked Questions</h2>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {FAQ_ITEMS.map((item, i) => {
                                        const isOpen = activeFaq === i;
                                        return (
                                            <motion.div
                                                key={i}
                                                style={{
                                                    background: colors.card,
                                                    borderRadius: '20px 6px 20px 6px',
                                                    border: isOpen ? `1.5px solid ${colors.accent}` : `1px solid ${colors.border}`,
                                                    overflow: 'hidden',
                                                    transition: 'border 0.3s ease'
                                                }}
                                            >
                                                <button
                                                    onClick={() => setActiveFaq(isOpen ? null : i)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '16px 20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        gap: '12px'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: isOpen ? colors.accent : colors.text, lineHeight: 1.4 }}>
                                                        {item.question}
                                                    </span>
                                                    <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                                                        <ChevronRight size={18} color={isOpen ? colors.accent : colors.textMuted} />
                                                    </motion.div>
                                                </button>

                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                        >
                                                            <div style={{
                                                                padding: '0 20px 20px',
                                                                fontSize: '13px',
                                                                color: colors.textMuted,
                                                                lineHeight: 1.6,
                                                                borderTop: `1px solid ${colors.border}`,
                                                                paddingTop: '16px',
                                                                margin: '0 20px'
                                                            }}>
                                                                {item.answer}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.textMuted, marginBottom: '16px' }}>Still need help?</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        { icon: MessageCircle, label: 'Chat Support', sub: 'Instant help', color: '#C8956C' },
                                        { icon: Mail, label: 'Email Us', sub: '24hr response', color: colors.textMuted }
                                    ].map((item, i) => (
                                        <motion.button
                                            key={i}
                                            whileTap={{ scale: 0.97 }}
                                            style={{
                                                background: colors.card,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '20px 6px 20px 6px',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <item.icon size={20} color={item.color} />
                                            <div>
                                                <p style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: colors.text }}>{item.label}</p>
                                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>{item.sub}</p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="tickets"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Your Tickets</h2>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowCreateModal(true)}
                                    style={{
                                        background: colors.accent,
                                        color: '#FFF',
                                        padding: '8px 16px',
                                        borderRadius: '12px 4px 12px 4px',
                                        fontSize: '11px',
                                        fontWeight: 900,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(200,149,108,0.2)'
                                    }}
                                >
                                    <Plus size={16} /> New Request
                                </motion.button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <p className="text-xs font-bold">Fetching your records...</p>
                                </div>
                            ) : tickets.length > 0 ? (
                                <div className="space-y-3">
                                    {tickets.map((ticket) => (
                                        <motion.div
                                            key={ticket._id}
                                            style={{ 
                                                background: colors.card, 
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '20px 6px 20px 6px',
                                                padding: '16px'
                                            }}
                                            className="shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span style={{ 
                                                            fontSize: '9px', 
                                                            fontWeight: 900, 
                                                            textTransform: 'uppercase',
                                                            background: colors.input,
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            color: colors.accent
                                                        }}>
                                                            {ticket.category}
                                                        </span>
                                                        <span style={{ fontSize: '10px', color: colors.textMuted }}>
                                                            #{ticket._id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{ticket.subject}</h4>
                                                </div>
                                                <div style={{
                                                    fontSize: '9px',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    color: '#FFF',
                                                    background: getStatusColor(ticket.status),
                                                    padding: '4px 8px',
                                                    borderRadius: '6px 2px 6px 2px'
                                                }}>
                                                    {ticket.status}
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }} className="line-clamp-2">
                                                {ticket.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] opacity-40 font-bold">
                                                <Clock size={12} />
                                                {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 px-10">
                                    <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText size={24} className="opacity-20" />
                                    </div>
                                    <p style={{ color: colors.textMuted, fontSize: '13px', fontWeight: 700 }}>No support tickets found.</p>
                                    <p style={{ color: colors.textMuted, fontSize: '11px', marginTop: '4px' }}>Need help? Raise a new request above.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Ticket Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !submitting && setShowCreateModal(false)}
                                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                style={{
                                    background: colors.card,
                                    width: '100%',
                                    maxWidth: '430px',
                                    borderTopLeftRadius: '32px',
                                    borderTopRightRadius: '32px',
                                    padding: '32px 24px 48px',
                                    position: 'relative',
                                    maxHeight: '90vh',
                                    overflowY: 'auto'
                                }}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 900 }}>Raise Support Ticket</h3>
                                    <button 
                                        onClick={() => setShowCreateModal(false)}
                                        style={{ background: 'none', border: 'none', color: colors.textMuted }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateTicket} className="space-y-6">
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', display: 'block', color: colors.textMuted }}>Category</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TICKET_CATEGORIES.map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setNewTicket({ ...newTicket, category: cat })}
                                                    style={{
                                                        padding: '12px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        border: `1.5px solid ${newTicket.category === cat ? colors.accent : colors.border}`,
                                                        background: newTicket.category === cat ? `${colors.accent}10` : 'transparent',
                                                        color: newTicket.category === cat ? colors.accent : colors.textMuted,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', display: 'block', color: colors.textMuted }}>Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTicket.subject}
                                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                            placeholder="Briefly describe the issue"
                                            style={{
                                                width: '100%',
                                                background: colors.input,
                                                border: `1.5px solid ${colors.border}`,
                                                borderRadius: '16px',
                                                padding: '14px 16px',
                                                fontSize: '14px',
                                                color: colors.text,
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', display: 'block', color: colors.textMuted }}>Description</label>
                                        <textarea
                                            required
                                            value={newTicket.description}
                                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                            placeholder="Provide more details so we can help you better..."
                                            rows={4}
                                            style={{
                                                width: '100%',
                                                background: colors.input,
                                                border: `1.5px solid ${colors.border}`,
                                                borderRadius: '16px',
                                                padding: '14px 16px',
                                                fontSize: '14px',
                                                color: colors.text,
                                                outline: 'none',
                                                resize: 'none'
                                            }}
                                        />
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        disabled={submitting}
                                        style={{
                                            width: '100%',
                                            background: colors.accent,
                                            color: '#FFF',
                                            padding: '18px',
                                            borderRadius: '18px 6px 18px 6px',
                                            fontSize: '15px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            border: 'none',
                                            boxShadow: '0 8px 20px rgba(200,149,108,0.3)',
                                            opacity: submitting ? 0.7 : 1
                                        }}
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Ticket'}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
