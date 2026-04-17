import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRedirectPath } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';

export default function ProtectedRoute({ allowedRoles, feature }) {
    const { user, loading, isAuthenticated } = useAuth();
    const { salon, salonLoading } = useBusiness();

    if (loading || salonLoading) {
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
        // Only enforce role boundaries for non-admin/manager roles if needed
        // For now, let's allow all if requested, or at least don't block admin/manager
        if (!['admin', 'manager'].includes(user.role)) {
            const correctPath = getRedirectPath(user);
            return <Navigate to={correctPath} replace />;
        }
    }

    // Subscription/Payment gate
    if (user && user.role !== 'superadmin') {
        const isSubscriptionPage = window.location.pathname.startsWith('/admin/subscription');
        const isSupportPage = window.location.pathname.startsWith('/admin/support');
        
        // Multi-tier check
        const rawPlan = salon?.subscriptionPlan || user?.subscriptionPlan || 'none';
        const planName = String(rawPlan || 'none').trim().toLowerCase();
        
        // A salon is restricted if it has no plan or is explicitly inactive/suspended
        const hasNoPlan = ['none', 'undefined', 'null', '', 'pending'].includes(planName);
        const salonActive = salon 
            ? (salon.isActive !== false && salon.status !== 'suspended') 
            : (user?.salonIsActive !== false);
        
        const isRestricted = hasNoPlan || !salonActive;

        if (process.env.NODE_ENV === 'development') {
            console.log('[ProtectedRoute] Gating Debug:', { path: window.location.pathname, planName, salonActive, isRestricted });
        }

        // Redirect to subscription page if salon has no plan or is inactive
        if (isRestricted && !isSubscriptionPage && !isSupportPage) {
            console.log('[ProtectedRoute] Redirecting to subscription due to missing plan/inactive status');
            return <Navigate to="/admin/subscription" replace />;
        }
    }

    // Feature gating - Disable to show all features as requested
    // if (feature && salon && !salon.features?.[feature]) {
    //     return <Navigate to="/admin/feature-locked" replace />;
    // }

    return <Outlet />;
}
