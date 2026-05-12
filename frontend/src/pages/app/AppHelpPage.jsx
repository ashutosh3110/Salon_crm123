import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, HelpCircle, ChevronRight, MessageCircle, 
    Plus, Clock, CheckCircle2, AlertCircle, Send, Loader2, X
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import api from '../../services/api';

export default function AppHelpPage() {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const { isCustomerAuthenticated, customer } = useCustomerAuth();
    const { activeOutletId } = useBusiness();
    const isLight = theme === 'light';

    const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'tickets'
    const [faqs, setFaqs] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedFaq, setExpandedFaq] = useState(null);
    
    // Ticket Details & Creation
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', category: 'General' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Lock scroll when modal is open
    useEffect(() => {
        if (showCreateModal || selectedTicket) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.documentElement.style.overflow = 'unset';
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'unset';
        }
        return () => { 
            document.documentElement.style.overflow = 'unset';
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'unset';
        };
    }, [showCreateModal, selectedTicket]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#040404',
        card: isLight ? '#FFFFFF' : '#0F0F0F',
        text: isLight ? '#1A1A1A' : '#F5F5F5',
        textMuted: isLight ? '#666' : '#888888',
        accent: '#C8956C',
        border: isLight ? '#EEEEEE' : '#1A1A1A',
        primary: '#C8956C'
    };

    useEffect(() => {
        fetchFaqs();
        if (isCustomerAuthenticated) fetchTickets();
    }, [isCustomerAuthenticated]);

    const fetchFaqs = async () => {
        try {
            const res = await api.get('/support/faqs');
            setFaqs(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch FAQs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTickets = async () => {
        try {
            const res = await api.get('/support/my-tickets');
            setTickets(res.data.data || []);
            // Update selected ticket if it's open to refresh messages
            if (selectedTicket) {
                const updated = res.data.data.find(t => t._id === selectedTicket._id);
                if (updated) setSelectedTicket(updated);
            }
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        setSendingMessage(true);
        try {
            const res = await api.post(`/support/tickets/${selectedTicket._id}/response`, { message: newMessage });
            if (res.data.success) {
                setNewMessage('');
                fetchTickets();
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.subject || !newTicket.description) return;

        setIsSubmitting(true);
        try {
            const res = await api.post('/support/tickets', {
                ...newTicket,
                tenantId: customer?.tenantId,
                outletId: activeOutletId
            });
            if (res.data.success) {
                setTickets([res.data.data, ...tickets]);
                setShowCreateModal(false);
                setNewTicket({ subject: '', description: '', category: 'General' });
                setActiveTab('tickets');
            }
        } catch (err) {
            console.error('Failed to create ticket:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'in-progress': return <Clock size={14} className="text-blue-500" />;
            default: return <AlertCircle size={14} className="text-amber-500" />;
        }
    };
    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'in-progress': return 'In Progress';
            case 'resolved': return 'Resolved';
            case 'closed': return 'Closed';
            case 'escalated': return 'Escalated';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen pb-20" style={{ background: colors.bg, color: colors.text }}>
            {/* Header */}
            <div className="sticky top-0 z-40 px-6 py-6 flex items-center gap-4 border-b" 
                style={{ background: colors.bg, borderColor: colors.border }}>
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-black/5">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-black italic tracking-tighter uppercase">Help & Support</h1>
            </div>

            {/* Tabs */}
            <div className="px-6 mt-6">
                <div className="flex p-1.5 rounded-2xl" style={{ background: isLight ? '#f0f0f0' : '#151515' }}>
                    <button 
                        onClick={() => setActiveTab('faq')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'faq' ? 'shadow-sm' : 'opacity-40'}`}
                        style={{ 
                            background: activeTab === 'faq' ? colors.card : 'transparent',
                            color: colors.text
                        }}
                    >
                        FAQs
                    </button>
                    <button 
                        onClick={() => setActiveTab('tickets')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'tickets' ? 'shadow-sm' : 'opacity-40'}`}
                        style={{ 
                            background: activeTab === 'tickets' ? colors.card : 'transparent',
                            color: colors.text
                        }}
                    >
                        My Tickets
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 mt-6">
                {activeTab === 'faq' ? (
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin opacity-20" /></div>
                        ) : faqs.length > 0 ? (
                            faqs.map((faq, i) => (
                                <div key={i} className="rounded-2xl border transition-all" 
                                    style={{ background: colors.card, borderColor: expandedFaq === i ? colors.accent : colors.border }}>
                                    <button 
                                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                        className="w-full px-5 py-4 flex items-center justify-between text-left"
                                    >
                                        <span className="text-sm font-bold tracking-tight">{faq.question}</span>
                                        <ChevronRight size={16} className={`transition-transform ${expandedFaq === i ? 'rotate-90 text-[#C8956C]' : 'opacity-20'}`} />
                                    </button>
                                    <AnimatePresence>
                                        {expandedFaq === i && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 text-sm leading-relaxed opacity-60">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-10 opacity-40">No FAQs available yet.</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {!isCustomerAuthenticated ? (
                            <div className="text-center py-10">
                                <p className="text-sm opacity-60 mb-4">Log in to view or create support tickets.</p>
                                <button 
                                    onClick={() => navigate('/app/login')}
                                    className="px-6 py-2.5 rounded-full font-bold text-sm"
                                    style={{ background: colors.accent, color: '#fff' }}
                                >
                                    Log In
                                </button>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full py-4.5 rounded-[20px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#C8956C]/20 border border-white/10"
                                    style={{ 
                                        background: 'linear-gradient(135deg, #C8956C 0%, #B6845B 100%)',
                                        color: '#fff' 
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <Plus size={18} />
                                    </div>
                                    <span className="font-black italic text-sm uppercase tracking-tighter">New Support Ticket</span>
                                </button>

                                {tickets.length > 0 ? (
                                    tickets.map((t, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-5 rounded-[28px] border relative overflow-hidden group" 
                                            style={{ background: colors.card, borderColor: colors.border }}
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8956C]/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                                            
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="px-3 py-1 rounded-full bg-black/5 text-[9px] font-black uppercase tracking-widest opacity-60">{t.category}</span>
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-[10px] font-black uppercase tracking-tight">
                                                    {getStatusIcon(t.status)}
                                                    {getStatusLabel(t.status)}
                                                </div>
                                            </div>
                                            <h3 className="font-black italic tracking-tight mb-2 uppercase text-base">{t.subject}</h3>
                                            <p className="text-xs opacity-50 line-clamp-2 mb-5 font-medium leading-relaxed">{t.description}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-dashed" style={{ borderColor: colors.border }}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#C8956C] animate-pulse" />
                                                    <span className="text-[10px] font-bold opacity-40">{new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 px-10 rounded-[40px] border border-dashed flex flex-col items-center" style={{ borderColor: colors.border }}>
                                        <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mb-6">
                                            <MessageCircle size={32} className="opacity-10" />
                                        </div>
                                        <h4 className="font-black italic uppercase tracking-tighter mb-2 opacity-60">No tickets found</h4>
                                        <p className="text-xs opacity-40 leading-relaxed">If you're having trouble, create a new ticket and our team will help you soon.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Create Ticket Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pb-10">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCreateModal(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                            />
                            <motion.div 
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                className="relative w-full max-w-lg rounded-[40px] overflow-hidden p-8"
                                style={{ background: colors.card }}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">New Ticket</h2>
                                    <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-black/5">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateTicket} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block px-1">Subject</label>
                                        <input 
                                            required
                                            value={newTicket.subject}
                                            onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                                            className="w-full px-5 py-4 rounded-2xl border text-sm font-bold focus:outline-none focus:border-[#C8956C] transition-all"
                                            style={{ background: colors.bg, borderColor: colors.border }}
                                            placeholder="e.g. Refund request, Booking issue"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block px-1">Description</label>
                                        <textarea 
                                            required
                                            rows={4}
                                            value={newTicket.description}
                                            onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                                            className="w-full px-5 py-4 rounded-2xl border text-sm font-bold focus:outline-none focus:border-[#C8956C] transition-all resize-none"
                                            style={{ background: colors.bg, borderColor: colors.border }}
                                            placeholder="Describe your issue in detail..."
                                        />
                                    </div>
                                    <button 
                                        disabled={isSubmitting}
                                        className="w-full py-5 rounded-2xl font-black italic tracking-tight uppercase flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
                                        style={{ background: colors.accent, color: '#fff' }}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
