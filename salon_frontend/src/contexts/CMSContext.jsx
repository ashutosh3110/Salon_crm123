import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useBusiness } from './BusinessContext';
import { useCustomerAuth } from './CustomerAuthContext';
import api from '../services/api';
import { useAuth } from './AuthContext';

/** Admin CMS reads/writes need tenant scope; superadmin has no tenantId on user — pass salon id from /tenants/me */
function adminCmsQuery(salonId) {
    if (!salonId) return '';
    const id = typeof salonId === 'object' && salonId?._id ? salonId._id : salonId;
    return id ? `?tenantId=${encodeURIComponent(String(id))}` : '';
}

const CMSContext = createContext(null);

const ensureId = (item) => ({ ...item, id: item.id || item._id || Date.now() });

function readStoredCustomerTenantId() {
    try {
        const raw = localStorage.getItem('customer_user');
        if (!raw) return null;
        const u = JSON.parse(raw);
        return u?.tenantId || null;
    } catch {
        return null;
    }
}

export function CMSProvider({ children }) {
    const location = useLocation();
    const { user } = useAuth();
    const { customer } = useCustomerAuth();
    const { staff, updateStaff, salon } = useBusiness();
    const [banners, setBanners] = useState([]);
    const [offers, setOffers] = useState([]);
    const [lookbook, setLookbook] = useState([]);
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppCMS = useCallback(async () => {
        setLoading(true);
        const path = location.pathname || '';
        const isCustomerApp = path.startsWith('/app');
        let tenantId = customer?.tenantId || null;
        if (!tenantId && isCustomerApp) {
            tenantId = readStoredCustomerTenantId();
        }

        try {
            let res;
            if (isCustomerApp) {
                if (!tenantId) {
                    setBanners([]);
                    setOffers([]);
                    setLookbook([]);
                    setExperts([]);
                    setLoading(false);
                    return;
                }
                res = await api.get(`/cms/app/tenant/${tenantId}`);
            } else {
                // If not in customer app, only fetch if salon ID and proper role are present
                const isManagerOrAdmin = ['admin', 'manager'].includes(user?.role);
                if (!salon?._id || !isManagerOrAdmin) {
                    setLoading(false);
                    return;
                }
                const qs = adminCmsQuery(salon?._id);
                res = await api.get(`/cms/app${qs}`);
            }
            const d = res.data?.data || {};
            setBanners((d.banners || []).map(ensureId));
            setOffers((d.offers || []).map(ensureId));
            setLookbook((d.lookbook || []).map(ensureId));
            setExperts((d.experts || []).map(ensureId));
        } catch (e) {
            setBanners([]);
            setOffers([]);
            setLookbook([]);
            setExperts([]);
        } finally {
            setLoading(false);
        }
    }, [location.pathname, customer?.tenantId, salon?._id, user?.role]);

    useEffect(() => {
        fetchAppCMS();
    }, [fetchAppCMS]);

    const saveSection = async (section, content) => {
        try {
            const path = location.pathname || '';
            const isCustomerApp = path.startsWith('/app');
            const qs = !isCustomerApp ? adminCmsQuery(salon?._id) : '';
            await api.patch(`/cms/app/${section}${qs}`, { content: Array.isArray(content) ? content : [] });
        } catch (e) {
            console.error('[CMS] Save failed:', e);
            throw e;
        }
    };

    const addLookbookItem = async (item) => {
        const newItem = { ...item, id: Date.now() };
        const next = [newItem, ...lookbook];
        setLookbook(next);
        try {
            await saveSection('lookbook', next);
        } catch (e) {
            setLookbook(lookbook);
            throw e;
        }
    };
    const updateLookbookItem = async (id, data) => {
        const prev = lookbook;
        const next = lookbook.map((l) => (String(l.id) === String(id) ? { ...l, ...data } : l));
        setLookbook(next);
        try {
            await saveSection('lookbook', next);
        } catch (e) {
            setLookbook(prev);
            throw e;
        }
    };
    const deleteLookbookItem = async (id) => {
        const prev = lookbook;
        const next = lookbook.filter((l) => String(l.id) !== String(id));
        setLookbook(next);
        try {
            await saveSection('lookbook', next);
        } catch (e) {
            setLookbook(prev);
            throw e;
        }
    };
    const toggleLookbookStatus = async (id) => {
        const prev = lookbook;
        const next = lookbook.map((l) =>
            (String(l.id) === String(id) ? { ...l, status: l.status === 'Active' ? 'Paused' : 'Active' } : l)
        );
        setLookbook(next);
        try {
            await saveSection('lookbook', next);
        } catch (e) {
            setLookbook(prev);
            throw e;
        }
    };

    const addBanner = async (banner) => {
        const newItem = { ...banner, id: Date.now() };
        const next = [newItem, ...banners];
        setBanners(next);
        try {
            await saveSection('banners', next);
        } catch (e) {
            setBanners(banners);
            throw e;
        }
    };
    const updateBanner = async (id, data) => {
        const prev = banners;
        const next = banners.map((b) => (String(b.id) === String(id) ? { ...b, ...data } : b));
        setBanners(next);
        try {
            await saveSection('banners', next);
        } catch (e) {
            setBanners(prev);
            throw e;
        }
    };
    const deleteBanner = async (id) => {
        const prev = banners;
        const next = banners.filter((b) => String(b.id) !== String(id));
        setBanners(next);
        try {
            await saveSection('banners', next);
        } catch (e) {
            setBanners(prev);
            throw e;
        }
    };
    const toggleBannerStatus = async (id) => {
        const prev = banners;
        const next = banners.map((b) =>
            (String(b.id) === String(id) ? { ...b, status: b.status === 'Active' ? 'Paused' : 'Active' } : b)
        );
        setBanners(next);
        try {
            await saveSection('banners', next);
        } catch (e) {
            setBanners(prev);
            throw e;
        }
    };

    const addOffer = async (offer) => {
        const newItem = { ...offer, id: Date.now() };
        const next = [newItem, ...offers];
        setOffers(next);
        try {
            await saveSection('offers', next);
        } catch (e) {
            setOffers(offers);
            throw e;
        }
    };
    const updateOffer = async (id, data) => {
        const prev = offers;
        const next = offers.map((o) => (String(o.id) === String(id) ? { ...o, ...data } : o));
        setOffers(next);
        try {
            await saveSection('offers', next);
        } catch (e) {
            setOffers(prev);
            throw e;
        }
    };
    const deleteOffer = async (id) => {
        const prev = offers;
        const next = offers.filter((o) => String(o.id) !== String(id));
        setOffers(next);
        try {
            await saveSection('offers', next);
        } catch (e) {
            setOffers(prev);
            throw e;
        }
    };
    const toggleOfferStatus = async (id) => {
        const prev = offers;
        const next = offers.map((o) =>
            (String(o.id) === String(id) ? { ...o, status: o.status === 'Live' ? 'Draft' : 'Live' } : o)
        );
        setOffers(next);
        try {
            await saveSection('offers', next);
        } catch (e) {
            setOffers(prev);
            throw e;
        }
    };

    const updateExpertProfile = (userId, data) => {
        setExperts((prev) => {
            const exists = prev.find((e) => e.userId === userId || e._id === userId);
            if (exists) {
                return prev.map((e) =>
                    e.userId === userId || e._id === userId ? { ...e, ...data } : e
                );
            }
            return [...prev, { ...data, userId, id: Date.now(), status: 'Pending' }];
        });
    };

    const approveExpertProfile = async (id) => {
        const expert = experts.find((e) => String(e.id) === String(id) || String(e._id) === String(id));
        if (expert && staff?.length) {
            const staffMember = staff.find(
                (s) => String(s._id) === String(expert.userId || expert._id) || s.email === expert.email
            );
            if (staffMember) {
                try {
                    await updateStaff(staffMember._id, {
                        bio: expert.bio,
                        specializations: expert.specializations,
                        experience: expert.experience,
                        profileStatus: 'Approved',
                    });
                } catch (_) {}
            }
        }
        setExperts((prev) =>
            prev.map((e) =>
                String(e.id) === String(id) || String(e._id) === String(id) ? { ...e, status: 'Approved' } : e
            )
        );
    };

    const rejectExpertProfile = async (id) => {
        const expert = experts.find((e) => String(e.id) === String(id) || String(e._id) === String(id));
        if (expert && staff?.length) {
            const staffMember = staff.find(
                (s) => String(s._id) === String(expert.userId || expert._id) || s.email === expert.email
            );
            if (staffMember) {
                try {
                    await updateStaff(staffMember._id, { profileStatus: 'Rejected' });
                } catch (_) {}
            }
        }
        setExperts((prev) =>
            prev.map((e) =>
                String(e.id) === String(id) || String(e._id) === String(id) ? { ...e, status: 'Rejected' } : e
            )
        );
    };

    const deleteExpertProfile = (id) => {
        setExperts((prev) => prev.filter((e) => String(e.id) !== String(id) && String(e._id) !== String(id)));
    };

    const value = useMemo(() => ({
        banners, setBanners, addBanner, updateBanner, deleteBanner, toggleBannerStatus,
        offers, setOffers, addOffer, updateOffer, deleteOffer, toggleOfferStatus,
        lookbook, setLookbook, addLookbookItem, updateLookbookItem, deleteLookbookItem, toggleLookbookStatus,
        experts, setExperts, updateExpertProfile, approveExpertProfile, rejectExpertProfile, deleteExpertProfile,
        pendingExpertsCount: experts.filter((e) => e.status === 'Pending').length,
        cmsLoading: loading,
        fetchAppCMS,
    }), [banners, offers, lookbook, experts, loading, fetchAppCMS]);

    return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}

export function useCMS() {
    const context = useContext(CMSContext);
    if (!context) throw new Error('useCMS must be used within CMSProvider');
    return context;
}
