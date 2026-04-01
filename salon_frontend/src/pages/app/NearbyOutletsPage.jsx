import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const RADIUS_OPTIONS = [3, 5, 10, 25];

export default function NearbyOutletsPage() {
    const [searchParams] = useSearchParams();
    const radius = Number(searchParams.get('radius')) || 3;

    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [userCoords, setUserCoords] = useState(() => {
        try {
            const raw = localStorage.getItem('wapixo_user_coords');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });
    const [locationLoading, setLocationLoading] = useState(!userCoords);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [outlets, setOutlets] = useState([]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        accent: '#C8956C',
    };

    const fetchNearbyOutlets = async (lat, lng) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(
                `/outlets/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
                { timeout: 10000 }
            );
            setOutlets(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setError('Failed to load outlets. Try again.');
            setOutlets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userCoords?.lat != null && userCoords?.lng != null) {
            localStorage.setItem('wapixo_user_coords', JSON.stringify(userCoords));
            fetchNearbyOutlets(userCoords.lat, userCoords.lng);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userCoords?.lat, userCoords?.lng, radius]);

    const requestLocation = () => {
        setLocationLoading(true);
        setError('');
        if (!navigator.geolocation) {
            setError('Location not supported.');
            setLocationLoading(false);
            return;
        }
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            setError('Location requires HTTPS.');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserCoords(coords);
                setLocationLoading(false);
            },
            (err) => {
                const msg = err.code === 1 ? 'Location permission denied.' : 'Could not get location.';
                setError(msg);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const radiusLabel = useMemo(() => `${radius} km`, [radius]);

    return (
        <div style={{ minHeight: '100svh', width: '100%', background: colors.bg, color: colors.text, padding: 18 }}>
            <div style={{ maxWidth: 380, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <button
                        onClick={() => navigate('/app/login')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: colors.textMuted,
                            padding: 6,
                        }}
                        type="button"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: colors.textMuted, letterSpacing: 0.08, textTransform: 'uppercase' }}>
                            Nearby outlets
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: colors.accent, marginTop: 2 }}>
                            {radiusLabel}
                        </div>
                    </div>
                </div>

                {locationLoading ? (
                    <div style={{ textAlign: 'center', paddingTop: 40 }}>
                        <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
                        <p style={{ marginTop: 10, fontWeight: 700, fontSize: 14 }}>{'Detecting your location…'}</p>
                        <p style={{ marginTop: 6, fontSize: 12, color: colors.textMuted }}>
                            <MapPin size={14} style={{ display: 'inline', verticalAlign: -3 }} /> Getting GPS coords
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
                            {RADIUS_OPTIONS.map((km) => (
                                <button
                                    key={km}
                                    type="button"
                                    onClick={() => navigate(`/app/nearby-outlets?radius=${km}`)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: 999,
                                        border: `1.5px solid ${radius === km ? colors.accent : colors.border}`,
                                        background: radius === km ? 'rgba(200,149,108,0.15)' : colors.card,
                                        color: radius === km ? colors.accent : colors.text,
                                        fontSize: 12,
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {km} km
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                            <button
                                onClick={requestLocation}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.accent, fontWeight: 800 }}
                                type="button"
                            >
                                Use current location
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', paddingTop: 40 }}>
                                <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
                                <p style={{ marginTop: 10, fontWeight: 700, fontSize: 14 }}>{'Finding outlets…'}</p>
                            </div>
                        ) : outlets.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <p style={{ fontSize: 13, fontWeight: 800, color: colors.textMuted, marginBottom: 2 }}>
                                    Select an outlet to continue
                                </p>
                                <p style={{ fontSize: 12, color: colors.textMuted, marginTop: -6, marginBottom: 6 }}>
                                    {outlets.length} outlets found within {radius} km
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {outlets.map((o, idx) => (
                                        <motion.div
                                            key={o._id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                try {
                                                    localStorage.setItem('wapixo_selected_outlet', JSON.stringify(o));
                                                } catch {
                                                    // ignore
                                                }
                                                navigate(`/app/login?outletSelected=1&tenantId=${encodeURIComponent(o.tenantId)}`);
                                            }}
                                            style={{
                                                background: colors.card,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: 16,
                                                padding: 14,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                                {o.image && (
                                                    <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: `1px solid ${colors.border}` }}>
                                                        <img src={o.image} alt={o.name} style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
                                                    </div>
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                                                        <div>
                                                            <div style={{ fontWeight: 900, fontSize: 15 }}>{o.name}</div>
                                                            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                                                                {o.address}
                                                                {o.city ? `, ${o.city}` : ''}
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            {o.distanceKm != null && (
                                                                <div style={{ fontSize: 11, fontWeight: 900, color: colors.accent }}>
                                                                    {o.distanceKm} km away
                                                                </div>
                                                            )}
                                                            {idx === 0 && (
                                                                <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', background: colors.accent, padding: '4px 8px', borderRadius: 999, marginTop: 6 }}>
                                                                    Closest
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ paddingTop: 40, textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: colors.text, marginBottom: 8 }}>
                                    No outlets in this area
                                </div>
                                <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>
                                    Try a larger radius or use current location again.
                                </div>
                                <button
                                    onClick={() => navigate('/app/login')}
                                    style={{
                                        background: colors.accent,
                                        border: 'none',
                                        color: '#fff',
                                        padding: '12px 16px',
                                        borderRadius: 14,
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                    }}
                                    type="button"
                                >
                                    Change distance
                                </button>
                            </div>
                        )}
                        {error && <p style={{ marginTop: 14, fontSize: 13, color: '#ff4757', fontWeight: 800 }}>{error}</p>}
                    </>
                )}
            </div>
        </div>
    );
}

