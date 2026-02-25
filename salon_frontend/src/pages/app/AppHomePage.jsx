import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useGender } from '../../contexts/GenderContext';
import { motion } from 'framer-motion';
import {
    MapPin, Bell, SlidersHorizontal, Heart, Star, ArrowRight
} from 'lucide-react';
import { MOCK_OUTLET, PRODUCT_CATEGORIES } from '../../data/appMockData';

/* ── Gender-specific data ── */
const GENDER_DATA = {
    men: {
        label: 'Men',
        emoji: '🧔',
        promo: { title: '20% Off Grooming\nPackages', img: 'https://images.unsplash.com/photo-1622296089720-b72267bdc5a6?w=500&q=80' },
        salons: [
            { id: 1, name: 'Kobike Barber Shop', address: '12 Main St, Chicago', rating: 4.8, dist: '1.2 km', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&q=80' },
            { id: 2, name: 'Classic Cuts Studio', address: '45 Park Ave, Chicago', rating: 4.6, dist: '2.4 km', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=80' },
            { id: 3, name: 'Gentlemens Lounge', address: '88 River Rd, Chicago', rating: 4.7, dist: '3.1 km', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&q=80' },
        ],
        experts: [
            { id: 1, name: 'Jake Rivera', role: 'Master Barber', rating: 4.9, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
            { id: 2, name: 'Carlos Mendez', role: 'Hair Stylist', rating: 4.7, img: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&q=80' },
            { id: 3, name: 'Dan Fisher', role: 'Beard Expert', rating: 4.8, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80' },
            { id: 4, name: 'Mark Chen', role: 'Colorist', rating: 4.6, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
        ],
        categories: [
            { id: 1, name: 'Haircut', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&q=80', count: 82 },
            { id: 2, name: 'Beard', img: 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=200&q=80', count: 54 },
            { id: 3, name: 'Massage', img: 'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?w=200&q=80', count: 38 },
            { id: 4, name: 'Facials', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?w=200&q=80', count: 24 },
            { id: 5, name: 'Color', img: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=200&q=80', count: 19 },
        ],
        offers: [
            { id: 1, title: 'Kobike Barber', tag: 'Weekend Deal!', discount: '-20%', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&q=80' },
            { id: 2, title: 'Classic Cuts', tag: 'Flash Sale!', discount: '-15%', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&q=80' },
        ],
    },
    women: {
        label: 'Women',
        emoji: '💇',
        promo: { title: '20% Off Facial\nTreatments', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80' },
        salons: [
            { id: 1, name: 'Brett Gomez Salon', address: '817 Rebecca Lodge', rating: 4.5, dist: '4.5 km', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&q=80' },
            { id: 2, name: 'Gimabel Hair Style', address: 'Park View Plaza', rating: 4.5, dist: '2.8 km', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80' },
            { id: 3, name: 'Beauty Women Salon', address: 'Lakeshore Drive', rating: 4.7, dist: '1.9 km', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=300&q=80' },
        ],
        experts: [
            { id: 1, name: 'Sofiya Liss', role: 'Stylist', rating: 4.9, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
            { id: 2, name: 'Adrin Ross', role: 'Colorist', rating: 4.7, img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80' },
            { id: 3, name: 'Nina Patel', role: 'Nail Artist', rating: 4.8, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
            { id: 4, name: 'Priya Kapoor', role: 'Skin Expert', rating: 4.6, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
        ],
        categories: [
            { id: 1, name: 'Haircut', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&q=80', count: 85 },
            { id: 2, name: 'Skin Care', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80', count: 65 },
            { id: 3, name: 'Nail Art', img: 'https://images.unsplash.com/photo-1604654894610-df49ff66a7cb?w=200&q=80', count: 48 },
            { id: 4, name: 'Makeup', img: 'https://images.unsplash.com/photo-1522338221021-0209f984ca57?w=200&q=80', count: 32 },
            { id: 5, name: 'Massage', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=200&q=80', count: 27 },
        ],
        offers: [
            { id: 1, title: 'Pagliber Beauty', tag: 'Summer Event!!', discount: '-15%', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80' },
            { id: 2, title: 'Glam Studio', tag: 'Bridal Special', discount: '-25%', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=300&q=80' },
        ],
    },
};

/* ── Styles ── */
const S = {
    page: { background: '#141414', minHeight: '100svh', color: '#fff' },
    section: { padding: '20px 16px 0' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
    label: { fontSize: '16px', fontWeight: 700, color: '#fff' },
    seeAll: { fontSize: '12px', color: '#C8956C', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' },
    card: {
        background: '#1E1E1E', borderRadius: '16px',
        overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
    },
};

function HeartBtn({ size = 20 }) {
    const [liked, setLiked] = useState(false);
    return (
        <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
        >
            <Heart size={size} strokeWidth={2}
                color={liked ? '#e53e3e' : 'rgba(255,255,255,0.55)'}
                fill={liked ? '#e53e3e' : 'none'}
            />
        </motion.button>
    );
}

function StarRow({ rating }) {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={11} fill="#C8956C" color="#C8956C" />
            <span style={{ fontSize: '11px', color: '#C8956C', fontWeight: 600 }}>{rating}</span>
        </span>
    );
}

export default function AppHomePage() {
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();
    const { gender, setGender } = useGender();

    // Fallback if gender is null
    const g = (gender === 'men' || gender === 'women') ? gender : 'women';
    const d = GENDER_DATA[g];

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
    const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" style={S.page}>

            {/* ── TOP HEADER ── */}
            <motion.div variants={fadeUp} style={{ padding: '52px 16px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                        Hi {customer?.name?.split(' ')[0] || 'Jackson'},
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <MapPin size={13} color="#C8956C" />
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                            {MOCK_OUTLET?.address?.split(',')[0] || '301 Chicago'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => navigate('/app/notifications')}
                        style={{ position: 'relative', background: '#242424', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <Bell size={18} color="#fff" />
                        <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#C8956C', border: '2px solid #141414' }} />
                    </motion.button>
                    {/* Mascot / avatar */}
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #C8956C, #a06844)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        💇
                    </div>
                </div>
            </motion.div>

            {/* ── SEARCH BAR ── */}
            <motion.div variants={fadeUp} style={{ padding: '0 16px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1, background: '#242424', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 14px', height: '46px', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>🔍</span>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>Find a salon, specialists,...</span>
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    style={{ background: '#242424', border: 'none', borderRadius: '12px', width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                    <SlidersHorizontal size={18} color="rgba(255,255,255,0.55)" />
                </motion.button>
            </motion.div>

            {/* ── GENDER TABS ── */}
            <motion.div variants={fadeUp} style={{ padding: '0 16px 12px', display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['men', 'women'].map((tab) => (
                    <motion.button
                        key={tab}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGender(tab)}
                        style={{
                            flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '15px', fontWeight: g === tab ? 700 : 400,
                            color: g === tab ? '#fff' : 'rgba(255,255,255,0.35)',
                            borderBottom: g === tab ? '2.5px solid #C8956C' : '2.5px solid transparent',
                            transition: 'all 0.2s', textTransform: 'capitalize',
                        }}
                    >
                        {tab === 'men' ? '🧔 Men' : '💇 Women'}
                    </motion.button>
                ))}
            </motion.div>

            {/* ── PROMO BANNER ── */}
            <motion.div variants={fadeUp} style={{ padding: '20px 16px 0' }}>
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/app/book')}
                    style={{
                        borderRadius: '20px', overflow: 'hidden', position: 'relative',
                        height: '160px', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #2A1F15 0%, #3D2A18 50%, #1a1008 100%)',
                        display: 'flex', alignItems: 'flex-end',
                    }}
                >
                    <img
                        src={d.promo.img}
                        alt="Promo"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, borderRadius: '20px' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(20,10,0,0.9) 45%, rgba(0,0,0,0.1) 100%)', borderRadius: '20px' }} />
                    <div style={{ position: 'relative', padding: '20px', zIndex: 2 }}>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Special Offer</p>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>
                            {d.promo.title.split('\n').map((l, i) => (<span key={i}>{l}{i === 0 && <br />}</span>))}
                        </h3>
                        <button style={{
                            background: '#C8956C', border: 'none', borderRadius: '8px',
                            padding: '7px 16px', color: '#fff', fontSize: '12px', fontWeight: 700,
                            cursor: 'pointer', letterSpacing: '0.02em',
                        }}>
                            Explore
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── NEAREST TO YOU ── */}
            <motion.div variants={fadeUp} style={S.section}>
                <div style={S.row}>
                    <span style={S.label}>Nearest To You</span>
                    <button style={S.seeAll} onClick={() => navigate('/app/services')}>
                        <ArrowRight size={16} />
                    </button>
                </div>
                <div className="app-scroll" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                    {d.salons.map((salon) => (
                        <motion.div
                            key={salon.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/app/book')}
                            style={{ ...S.card, width: '160px' }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img src={salon.img} alt={salon.name}
                                    style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                                />
                                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                    <HeartBtn size={16} />
                                </div>
                            </div>
                            <div style={{ padding: '10px 10px 12px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{salon.name}</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 7px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{salon.address}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <StarRow rating={salon.rating} />
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>• {salon.dist}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── CATEGORIES ── */}
            <motion.div variants={fadeUp} style={S.section}>
                <div style={S.row}>
                    <span style={S.label}>Categories</span>
                    <button style={S.seeAll} onClick={() => navigate('/app/categories')}>See All</button>
                </div>
                <div className="app-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                    {d.categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/app/services')}
                            style={{
                                flexShrink: 0, width: '82px',
                                padding: '12px 4px', textAlign: 'center', cursor: 'pointer',
                            }}
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                overflow: 'hidden', margin: '0 auto 10px',
                                border: '2px solid rgba(200,149,172,0.1)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            }}>
                                <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap' }}>{cat.name}</p>
                            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{cat.count} Places</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── SPECIAL OFFERS ── */}
            <motion.div variants={fadeUp} style={S.section}>
                <div style={S.row}>
                    <span style={S.label}>Special Offers</span>
                    <button style={S.seeAll} onClick={() => navigate('/app/services')}>
                        <ArrowRight size={16} />
                    </button>
                </div>
                <div className="app-scroll" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                    {d.offers.map((offer) => (
                        <motion.div
                            key={offer.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/app/book')}
                            style={{ ...S.card, width: '180px', position: 'relative' }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img src={offer.img} alt={offer.title}
                                    style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                                />
                                {/* Discount badge */}
                                <div style={{
                                    position: 'absolute', top: 10, left: 10,
                                    background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
                                    padding: '3px 8px', fontSize: '11px', fontWeight: 700, color: '#fff',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                    {offer.discount}
                                </div>
                                {/* Heart */}
                                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                                    <HeartBtn size={16} />
                                </div>
                            </div>
                            <div style={{ padding: '10px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{offer.title}</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{offer.tag}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── POPULAR EXPERTS ── */}
            <motion.div variants={fadeUp} style={S.section}>
                <div style={S.row}>
                    <span style={S.label}>Popular Experts</span>
                    <button style={S.seeAll} onClick={() => navigate('/app/services')}>
                        <ArrowRight size={16} />
                    </button>
                </div>
                <div className="app-scroll" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                    {d.experts.map((expert) => (
                        <motion.div
                            key={expert.id}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => navigate('/app/book')}
                            style={{ ...S.card, width: '120px', textAlign: 'center', paddingBottom: '12px' }}
                        >
                            <div style={{ position: 'relative', padding: '10px 10px 0' }}>
                                <img
                                    src={expert.img} alt={expert.name}
                                    style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto' }}
                                />
                                <div style={{
                                    position: 'absolute', top: 14, right: 14,
                                    background: '#C8956C', borderRadius: '8px',
                                    padding: '2px 5px', display: 'flex', alignItems: 'center', gap: '2px',
                                }}>
                                    <Star size={8} fill="#fff" color="#fff" />
                                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>{expert.rating}</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', margin: '8px 6px 2px' }}>{expert.name}</p>
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{expert.role}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── SHOP PRODUCTS ── */}
            <motion.div variants={fadeUp} style={S.section}>
                <div style={S.row}>
                    <span style={S.label}>Shop Products</span>
                    <button style={S.seeAll} onClick={() => navigate('/app/categories')}>See All</button>
                </div>
                <div className="app-scroll" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                    {PRODUCT_CATEGORIES.slice(0, 5).map((cat) => (
                        <motion.div
                            key={cat._id}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => navigate(`/app/shop?category=${encodeURIComponent(cat.name)}`)}
                            style={{
                                background: '#1E1E1E',
                                borderRadius: '16px',
                                padding: '16px 14px',
                                minWidth: '110px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                flexShrink: 0,
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</div>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', margin: '0 0 3px', whiteSpace: 'nowrap' }}>{cat.name}</p>
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{cat.count} Items</p>
                        </motion.div>
                    ))}
                    {/* Visit Full Shop CTA */}
                    <motion.div
                        whileTap={{ scale: 0.94 }}
                        onClick={() => navigate('/app/shop')}
                        style={{
                            background: 'linear-gradient(135deg, #C8956C, #a06844)',
                            borderRadius: '16px',
                            padding: '16px 14px',
                            minWidth: '110px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>🛍️</span>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', margin: 0 }}>Full Shop</p>
                        <ArrowRight size={14} color="#fff" />
                    </motion.div>
                </div>
            </motion.div>

            {/* ── LOYALTY + REFERRAL QUICK ACCESS ── */}
            <motion.div variants={fadeUp} style={{ padding: '20px 16px 0' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Loyalty Card */}
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/app/profile')}
                        style={{
                            flex: 1,
                            background: '#1E1E1E',
                            borderRadius: '16px',
                            padding: '16px',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(200,149,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>⭐</div>
                        <div>
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loyalty</p>
                            <p style={{ fontSize: '16px', fontWeight: 800, color: '#C8956C', margin: 0 }}>
                                250 <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>pts</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Referral Card */}
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/app/referrals')}
                        style={{
                            flex: 1,
                            background: '#1E1E1E',
                            borderRadius: '16px',
                            padding: '16px',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(200,149,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>🎁</div>
                        <div>
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Refer</p>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>Earn ₹200</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Bottom padding for nav */}
            <div style={{ height: '24px' }} />

        </motion.div>
    );
}
