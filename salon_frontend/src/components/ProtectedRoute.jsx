import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRedirectPath } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';

export default function ProtectedRoute({ allowedRoles, feature }) {
    const { user, loading, isAuthenticated } = useAuth();
    const { salon } = useBusiness();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // If trying to access superadmin and not logged in, go to superadmin login
        if (window.location.pathname.startsWith('/superadmin')) {
            return <Navigate to="/superadmin/login" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to the user's own panel instead of a generic 403
        const correctPath = getRedirectPath(user);
        return <Navigate to={correctPath} replace />;
    }

    // Subscription/Payment gate for Salon-related roles
    if (salon && ['admin', 'manager', 'receptionist', 'stylist', 'accountant', 'inventory_manager'].includes(user.role)) {
        const isSubscriptionPage = window.location.pathname.startsWith('/admin/subscription');
        const isSupportPage = window.location.pathname.startsWith('/admin/support');
        const isActive = salon.status === 'active';

        // Redirect to subscription page if salon is not active
        if (!isActive && !isSubscriptionPage && !isSupportPage) {
            return <Navigate to="/admin/subscription" replace />;
        }
    }

    // Feature gating
    if (feature && salon && !salon.features?.[feature]) {
        return <Navigate to="/admin/feature-locked" replace />;
    }

    return <Outlet />;
}
