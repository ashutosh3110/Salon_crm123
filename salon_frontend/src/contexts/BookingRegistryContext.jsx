/**
 * BookingRegistryContext
 * ─────────────────────
 * Single source of truth for ALL bookings created via the Customer App.
 * Persists to localStorage under key WAPIXO_BOOKING_REGISTRY.
 * Any panel (Admin, Stylist, App) that reads this context gets live data.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'WAPIXO_BOOKING_REGISTRY';

const BookingRegistryContext = createContext(null);

export function BookingRegistryProvider({ children }) {
    const [bookings, setBookings] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });

    // ── Sync from localStorage on cross-tab changes ──
    useEffect(() => {
        const sync = () => {
            try {
                const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                setBookings(stored);
            } catch { /* ignore parse errors */ }
        };

        // Listen for other tabs / windows updating localStorage
        window.addEventListener('storage', sync);

        // Poll every 2s for same-tab updates (e.g. Stylist dashboard open while customer books)
        const interval = setInterval(sync, 2000);

        return () => {
            window.removeEventListener('storage', sync);
            clearInterval(interval);
        };
    }, []);

    // ── Add a new booking (called by AppBookingPage) ──
    const addBooking = useCallback((newBooking) => {
        setBookings(prev => {
            const updated = [newBooking, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // ── Update status of an existing booking ──
    const updateBookingStatus = useCallback((bookingId, status) => {
        setBookings(prev => {
            const updated = prev.map(b =>
                b.id === bookingId ? { ...b, status } : b
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // ── Cancel a booking ──
    const cancelBooking = useCallback((bookingId) => {
        updateBookingStatus(bookingId, 'cancelled');
    }, [updateBookingStatus]);

    // ── Clear all (for dev/reset) ──
    const clearAll = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setBookings([]);
    }, []);

    return (
        <BookingRegistryContext.Provider value={{
            bookings,
            addBooking,
            updateBookingStatus,
            cancelBooking,
            clearAll,
        }}>
            {children}
        </BookingRegistryContext.Provider>
    );
}

export function useBookingRegistry() {
    const ctx = useContext(BookingRegistryContext);
    if (!ctx) throw new Error('useBookingRegistry must be used inside BookingRegistryProvider');
    return ctx;
}
