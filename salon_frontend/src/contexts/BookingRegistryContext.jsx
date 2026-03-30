/**
 * BookingRegistryContext
 * ─────────────────────
 * Single source of truth for ALL bookings created via the Customer App.
 * Now fetches from the backend API for live data.
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useCustomerAuth } from './CustomerAuthContext';

const STORAGE_KEY = 'WAPIXO_BOOKING_REGISTRY';

const BookingRegistryContext = createContext(null);

export function BookingRegistryProvider({ children }) {
    const { customer } = useCustomerAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBookings = useCallback(async () => {
        if (!customer?._id) {
            setBookings([]);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/bookings?limit=50');
            const data = res.data?.results || res.data || [];
            
            // Format for components
            const formatted = data.map(b => {
                const srv = b.serviceId || b.service;
                return {
                    ...b,
                    id: b._id,
                    service: srv,
                    services: srv ? [srv] : [],
                    staff: b.staffId || b.staff,
                    appointmentDate: b.appointmentDate || b.date
                };
            });
            
            setBookings(formatted);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
        } catch (err) {
            console.error('[BookingRegistry] Fetch failed', err);
        } finally {
            setLoading(false);
        }
    }, [customer?._id]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // ── Polling / Sync ──
    useEffect(() => {
        if (!customer?._id) return;

        const interval = setInterval(fetchBookings, 15000); // Poll every 15s for live updates
        return () => clearInterval(interval);
    }, [customer?._id, fetchBookings]);

    // ── Add a new booking ──
    const addBooking = useCallback(async (newBooking) => {
        setBookings(prev => [newBooking, ...prev]);
        setTimeout(fetchBookings, 1000);
    }, [fetchBookings]);

    // ── Update status of an existing booking ──
    const updateBookingStatus = useCallback((bookingId, status) => {
        setBookings(prev => {
            const updated = prev.map(b =>
                (b._id === bookingId || b.id === bookingId) ? { ...b, status } : b
            );
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

    const value = useMemo(() => ({
        bookings,
        loading,
        addBooking,
        updateBookingStatus,
        cancelBooking,
        clearAll,
        refresh: fetchBookings
    }), [bookings, loading, addBooking, updateBookingStatus, cancelBooking, clearAll, fetchBookings]);

    return (
        <BookingRegistryContext.Provider value={value}>
            {children}
        </BookingRegistryContext.Provider>
    );
}

export function useBookingRegistry() {
    const ctx = useContext(BookingRegistryContext);
    if (!ctx) throw new Error('useBookingRegistry must be used inside BookingRegistryProvider');
    return ctx;
}
