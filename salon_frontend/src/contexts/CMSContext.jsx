import { createContext, useContext, useState, useEffect } from 'react';
import cmsMockData from '../data/cmsMockData.json';

const CMSContext = createContext(null);

export function CMSProvider({ children }) {
    const [banners, setBanners] = useState(() => {
        const saved = localStorage.getItem('cms_banners');
        return saved ? JSON.parse(saved) : cmsMockData.BANNERS;
    });

    const [offers, setOffers] = useState(() => {
        const saved = localStorage.getItem('cms_offers');
        return saved ? JSON.parse(saved) : cmsMockData.OFFERS;
    });

    const [lookbook, setLookbook] = useState(() => {
        const saved = localStorage.getItem('cms_lookbook');
        return saved ? JSON.parse(saved) : cmsMockData.LOOKBOOK;
    });

    // Sync to localStorage
    useEffect(() => localStorage.setItem('cms_banners', JSON.stringify(banners)), [banners]);
    useEffect(() => localStorage.setItem('cms_offers', JSON.stringify(offers)), [offers]);
    useEffect(() => localStorage.setItem('cms_lookbook', JSON.stringify(lookbook)), [lookbook]);

    const addLookbookItem = (item) => setLookbook(prev => [{ ...item, id: Date.now() }, ...prev]);
    const updateLookbookItem = (id, data) => setLookbook(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    const deleteLookbookItem = (id) => setLookbook(prev => prev.filter(l => l.id !== id));
    const toggleLookbookStatus = (id) => setLookbook(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'Active' ? 'Paused' : 'Active' } : l));

    const addBanner = (banner) => setBanners(prev => [{ ...banner, id: Date.now() }, ...prev]);
    const updateBanner = (id, data) => setBanners(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    const deleteBanner = (id) => setBanners(prev => prev.filter(b => b.id !== id));
    const toggleBannerStatus = (id) => setBanners(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'Active' ? 'Paused' : 'Active' } : b));

    const addOffer = (offer) => setOffers(prev => [{ ...offer, id: Date.now() }, ...prev]);
    const updateOffer = (id, data) => setOffers(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
    const deleteOffer = (id) => setOffers(prev => prev.filter(o => o.id !== id));
    const toggleOfferStatus = (id) => setOffers(prev => prev.map(o => o.id === id ? { ...o, status: o.status === 'Live' ? 'Draft' : 'Live' } : o));

    const value = {
        banners, setBanners, addBanner, updateBanner, deleteBanner, toggleBannerStatus,
        offers, setOffers, addOffer, updateOffer, deleteOffer, toggleOfferStatus,
        lookbook, setLookbook, addLookbookItem, updateLookbookItem, deleteLookbookItem, toggleLookbookStatus
    };

    return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}

export function useCMS() {
    const context = useContext(CMSContext);
    if (!context) throw new Error('useCMS must be used within CMSProvider');
    return context;
}
