import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Clock, Navigation2, X, Phone } from 'lucide-react';
import { useState } from 'react';

export default function SalonMapView({ outlets, selectedOutlet, onSelect, onViewProfile, colors, isLight }) {
    const [hoveredOutlet, setHoveredOutlet] = useState(null);

    return (
        <div style={{
            height: 'calc(100svh - 220px)',
            width: '100%',
            position: 'relative',
            background: isLight ? '#f0f0f0' : '#111',
            borderRadius: '24px',
            overflow: 'hidden',
            border: `1px solid ${colors.border}`,
            marginTop: '10px'
        }}>
            {/* ── MOCK MAP BACKGROUND ── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: isLight
                    ? `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/75.9035,22.7814,13,0/600x600?access_token=pk.eyJ1IjoibW9ja21hcHMiLCJhIjoiY2p4eHgzeHh4eHh4eHh4eHh4eHh4In0')`
                    : `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/75.9035,22.7814,13,0/600x600?access_token=pk.eyJ1IjoibW9ja21hcHMiLCJhIjoiY2p4eHgzeHh4eHh4eHh4eHh4eHh4In0')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(0.2) contrast(1.1)',
                opacity: 0.8
            }} />

            {/* Grid Overlay for Tech Look */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(${isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'} 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
                pointerEvents: 'none'
            }} />

            {/* ── MARKERS ── */}
            {outlets.map((outlet, index) => {
                const lat = outlet.location?.coordinates?.[1] || outlet.location?.lat;
                const lng = outlet.location?.coordinates?.[0] || outlet.location?.lng;
                
                if (!lat || !lng) return null;

                // Optimized positions for Indore center (75.9035, 22.7814)
                const left = 50 + (lng - 75.9035) * 800; // Increased scale for precision
                const top = 50 - (lat - 22.7814) * 1000;

                // Clamp to stay within circle/bounds for mock UI
                const clampedLeft = Math.max(5, Math.min(95, left));
                const clampedTop = Math.max(5, Math.min(95, top));

                const isSelected = selectedOutlet?._id === outlet._id;

                return (
                    <motion.div
                        key={outlet._id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1, type: 'spring' }}
                        style={{
                            position: 'absolute',
                            left: `${clampedLeft}%`,
                            top: `${clampedTop}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: isSelected ? 10 : 5,
                            cursor: 'pointer'
                        }}
                        onClick={() => onSelect(outlet)}
                        onMouseEnter={() => setHoveredOutlet(outlet)}
                        onMouseLeave={() => setHoveredOutlet(null)}
                    >
                        {/* Ripple Effect for Selected */}
                        {isSelected && (
                            <motion.div
                                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    width: '40px',
                                    height: '40px',
                                    background: '#C8956C',
                                    borderRadius: '50%',
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: '-20px',
                                    marginTop: '-20px'
                                }}
                            />
                        )}

                        {/* Marker Pin */}
                        <div style={{
                            width: isSelected ? '44px' : '32px',
                            height: isSelected ? '44px' : '32px',
                            background: isSelected ? '#C8956C' : (isLight ? '#FFF' : '#222'),
                            borderRadius: '16px 16px 16px 2px',
                            rotate: '-45deg',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            border: `2px solid ${isSelected ? '#FFF' : '#C8956C'}`,
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            <div style={{ rotate: '45deg' }}>
                                <MapPin size={isSelected ? 20 : 14} color={isSelected ? '#FFF' : '#C8956C'} />
                            </div>
                        </div>

                        {/* Label */}
                        <AnimatePresence>
                            {(isSelected || hoveredOutlet?._id === outlet._id) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: isLight ? '#FFF' : '#333',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        whiteSpace: 'nowrap',
                                        marginBottom: '10px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        color: colors.text,
                                        border: `1px solid ${colors.border}`
                                    }}
                                >
                                    {outlet.name.split('—')[1] || outlet.name}
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        marginLeft: '-4px',
                                        border: '4px solid transparent',
                                        borderTopColor: isLight ? '#FFF' : '#333'
                                    }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}

            {/* ── SEARCH AREA OVERLAY ── */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                zIndex: 20,
                pointerEvents: 'none'
            }}>
                <div style={{
                    background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: colors.text,
                    width: 'fit-content',
                    border: `1px solid ${colors.border}`
                }}>
                    Found {outlets.length} salons nearby
                </div>
            </div>

            {/* ── QUICK DETAILS DRAWER ── */}
            <AnimatePresence>
                {selectedOutlet && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: colors.card,
                            padding: '20px',
                            borderTopLeftRadius: '32px',
                            borderTopRightRadius: '32px',
                            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
                            zIndex: 30,
                            borderTop: `1px solid ${colors.border}`
                        }}
                    >
                        {/* Drawer Handle */}
                        <div style={{
                            width: '40px',
                            height: '4px',
                            background: colors.border,
                            borderRadius: '2px',
                            margin: '-10px auto 16px'
                        }} />

                        <div className="flex gap-4">
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                position: 'relative'
                            }}>
                                {/* Horizontal Carousel */}
                                <div style={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    scrollSnapType: 'x mandatory',
                                    width: '100%',
                                    height: '100%',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none',
                                    gap: '4px'
                                }}>
                                    {(selectedOutlet.images && selectedOutlet.images.length > 0) ? (
                                        selectedOutlet.images.map((img, i) => (
                                            <img 
                                                key={i}
                                                src={img} 
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'cover',
                                                    flexShrink: 0,
                                                    scrollSnapAlign: 'start',
                                                    borderRadius: '12px'
                                                }} 
                                            />
                                        ))
                                    ) : (
                                        <img 
                                            src={selectedOutlet.image} 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover',
                                                flexShrink: 0,
                                                scrollSnapAlign: 'start'
                                            }} 
                                        />
                                    )}
                                </div>
                                
                                {/* Carousel Indicator (if multiple) */}
                                {selectedOutlet.images?.length > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '6px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        gap: '3px'
                                    }}>
                                        {selectedOutlet.images.map((_, i) => (
                                            <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div className="flex justify-between items-start">
                                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: colors.text, margin: 0 }}>{selectedOutlet.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: `${colors.accent}10`, padding: '2px 6px', borderRadius: '6px' }}>
                                        <Star size={10} fill={colors.accent} color={colors.accent} />
                                        <span style={{ fontSize: '10px', fontWeight: 900, color: colors.accent }}>{selectedOutlet.rating}</span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '11px', color: colors.textMuted, margin: '4px 0 12px' }}>{selectedOutlet.address}</p>

                                <div className="flex gap-2">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onViewProfile(selectedOutlet)}
                                        style={{
                                            flex: 2,
                                            background: colors.text,
                                            color: colors.card,
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '10px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        View Profile
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            const lat = selectedOutlet.location?.coordinates?.[1] || selectedOutlet.location?.lat;
                                            const lng = selectedOutlet.location?.coordinates?.[0] || selectedOutlet.location?.lng;
                                            if (lat && lng) {
                                                window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            background: isLight ? '#f5f5f5' : '#333',
                                            color: colors.text,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            padding: '10px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Navigation2 size={14} />
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            const phone = selectedOutlet.contactnumber || '9876543210'; // Fallback
                                            window.location.href = `tel:${phone}`;
                                        }}
                                        style={{
                                            width: 'auto',
                                            minWidth: '44px',
                                            height: '44px',
                                            background: isLight ? '#f5f5f5' : '#333',
                                            color: colors.text,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0 12px',
                                            gap: '8px'
                                        }}
                                    >
                                        <Phone size={16} />
                                        <span style={{ fontSize: '11px', fontWeight: 800 }}>
                                            {selectedOutlet.contactnumber || 'Contact'}
                                        </span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
