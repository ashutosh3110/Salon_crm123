import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Clock, Award, ShieldCheck, ChevronRight, Search } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCMS } from '../../contexts/CMSContext';
import { useGender } from '../../contexts/GenderContext';
import homeData from '../../data/appHomeData.json';

const { GENDER_DATA } = homeData;

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

export default function AppExpertsPage() {
    const navigate = useNavigate();
    const { colors, isLight } = useCustomerTheme();
    const { activeOutletId, activeOutlet } = useBusiness();
    const { experts } = useCMS();
    const { gender } = useGender();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [isFocused, setIsFocused] = useState(false);

    const g = (gender === 'men' || gender === 'women') ? gender : 'women';
    const d = GENDER_DATA[g];

    const filteredExperts = useMemo(() => {
        // Use CMS experts if they exist, otherwise fallback to homeData (legacy)
        let list = experts.length > 0 
            ? experts.filter(e => e.status === 'Approved' && (e.outletId === activeOutletId || !e.outletId))
            : d.experts.filter(e => !e.outletId || e.outletId === activeOutletId);

        if (searchQuery) {
            list = list.filter(e =>
                e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.role || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return list;
    }, [activeOutletId, experts, d.experts, searchQuery]);

    return (
        <div style={{ background: colors.bg, minHeight: '100svh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: `${colors.bg}dd`, backdropFilter: 'blur(12px)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: `1px solid ${colors.border}` }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', padding: 4 }}>
                    <ArrowLeft size={24} />
                </motion.button>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Styling Experts</h2>
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{activeOutlet?.name || 'Wapixo Salon'}</p>
                </div>
            </div>

            {/* Search */}
            <div style={{ padding: '10px 20px 20px' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: isLight
                        ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                        : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                    padding: '0 16px', borderRadius: '20px 6px 20px 6px',
                    height: '46px',
                    border: isFocused ? `1.5px solid ${colors.accent}` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                    boxShadow: isLight ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                    <Search size={18} color={isFocused ? colors.accent : (isLight ? '#444' : 'rgba(255,255,255,0.7)')} />
                    <input
                        type="text"
                        placeholder="Search experts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: colors.text, fontSize: '14px', width: '100%',
                            fontWeight: 500
                        }}
                    />
                </div>
            </div>

            {/* List */}
            <motion.div
                variants={stagger} initial="hidden" animate="show"
                style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}
            >
                {filteredExperts.map((expert) => (
                    <motion.div
                        key={expert.id}
                        variants={fadeUp}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedExpert(expert)}
                        style={{
                            background: colors.card, borderRadius: '24px', padding: '16px',
                            display: 'flex', alignItems: 'center', gap: '16px',
                            border: `1.5px solid ${colors.border}`,
                            boxShadow: isLight ? '0 8px 24px rgba(0,0,0,0.04)' : '0 8px 24px rgba(0,0,0,0.2)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '20px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                                <img src={expert.img} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ position: 'absolute', bottom: -5, right: -5, background: '#4CAF50', width: 14, height: 14, borderRadius: '50%', border: `2px solid ${colors.card}` }} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px' }}>{expert.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={12} fill="#C8956C" color="#C8956C" />
                                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{expert.rating}</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '12px', color: colors.accent, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.02em' }}>{expert.role}</p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Award size={12} color={colors.textMuted} />
                                    <span style={{ fontSize: '11px', color: colors.textMuted }}>{expert.experience || '5+ Years'} Exp.</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ShieldCheck size={12} color={colors.textMuted} />
                                    <span style={{ fontSize: '11px', color: colors.textMuted }}>Verified</span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={18} color={colors.border} />
                    </motion.div>
                ))}

                {filteredExperts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textMuted }}>
                        <p>No experts found for your search.</p>
                    </div>
                )}
            </motion.div>

            {/* Expert Detail Drawer */}
            <AnimatePresence>
                {selectedExpert && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedExpert(null)}
                            style={{ position: 'absolute', inset: 0, background: isLight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'relative', width: '100%', maxWidth: '430px',
                                background: colors.card, borderRadius: '32px 32px 0 0',
                                border: `1px solid ${colors.border}`, zIndex: 10001,
                                paddingTop: '12px', paddingBottom: '30px'
                            }}
                        >
                            {/* Handle */}
                            <div style={{ width: '40px', height: '4px', background: isLight ? '#DDD' : '#333', borderRadius: '2px', margin: '0 auto 20px' }} />

                            <div style={{ padding: '0 24px' }}>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                                    <img src={selectedExpert.img} style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1, paddingTop: '10px' }}>
                                        <h3 style={{ fontSize: '22px', fontWeight: 900, color: colors.text, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>{selectedExpert.name}</h3>
                                        <p style={{ fontSize: '14px', color: colors.accent, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' }}>{selectedExpert.role}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={14} fill={colors.accent} color={colors.accent} />
                                            <span style={{ fontSize: '14px', fontWeight: 700 }}>{selectedExpert.rating}</span>
                                            <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '4px' }}>(120+ Reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: isLight ? '#F9F9F9' : '#242424', padding: '12px', borderRadius: '16px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 700 }}>Experience</p>
                                        <p style={{ fontSize: '16px', fontWeight: 900, color: colors.text, margin: 0 }}>{selectedExpert.experience || '5+ Years'}</p>
                                    </div>
                                    <div style={{ background: isLight ? '#F9F9F9' : '#242424', padding: '12px', borderRadius: '16px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 700 }}>Clients</p>
                                        <p style={{ fontSize: '16px', fontWeight: 900, color: colors.text, margin: 0 }}>{selectedExpert.clients || '1.2k+'}</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Profile Bio</h4>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: colors.text, opacity: 0.8, margin: 0 }}>
                                        {selectedExpert.bio || "A dedicated professional committed to delivering the highest quality salon experience for every client."}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Specializations</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {(selectedExpert.specializations || ["Master Styling", "Classic Cut", "Detailing"]).map(tag => (
                                            <span key={tag} style={{ padding: '6px 12px', background: `${colors.accent}15`, color: colors.accent, borderRadius: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedExpert(null);
                                        navigate(`/app/book?expertId=${selectedExpert.id}`);
                                    }}
                                    style={{
                                        width: '100%', height: '56px', background: colors.accent, color: '#fff',
                                        border: 'none', borderRadius: '16px', fontSize: '14px', fontWeight: 900,
                                        textTransform: 'uppercase', letterSpacing: '0.1em',
                                        boxShadow: `0 10px 20px ${colors.accent}40`
                                    }}
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
