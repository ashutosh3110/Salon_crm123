import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRedirectPath } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';

export default function ProtectedRoute({ allowedRoles, feature, permission }) {
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

    // Role check
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (!['admin', 'superadmin'].includes(user.role)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Permission check
    if (permission && user.role !== 'superadmin' && user.role !== 'admin') {
        const userPermissions = user?.permissions || [];
        if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Subscription/Payment gate
    if (user && user.role !== 'superadmin') {
        const isSubscriptionPage = window.location.pathname.startsWith('/admin/subscription');
        const isSupportPage = window.location.pathname.startsWith('/admin/support');
        
        // Multi-tier check
        const salonStatus = (salon?.status || user?.salonStatus || user?.status || 'none').toLowerCase();
        const rawPlan = salon?.subscriptionPlan || user?.subscriptionPlan || 'none';
        const planName = String(rawPlan || 'none').trim().toLowerCase();
        
        // A salon is restricted if it has no plan or is explicitly inactive/suspended
        const hasNoPlan = ['none', 'undefined', 'null', '', 'pending'].includes(planName);
        
        // Safety check for active status: default to active unless explicitly suspended or isActive=false
        const salonActive = salon 
            ? (salon.isActive !== false && salon.status !== 'suspended') 
            : (user?.isActive !== false && user?.status !== 'suspended');
        
        // Special statuses that bypass plan restriction
        const isTrial = salonStatus === 'trial';
        const isPending = salonStatus === 'pending';

        // Redirection Logic:
        // 1. If explicitly suspended or inactive -> Redirect
        // 2. If has no plan AND is NOT in trial AND is NOT pending -> Redirect
        const shouldRedirect = !salonActive || (hasNoPlan && !isTrial && !isPending);


        // Redirect to subscription page if restriction applies
        if (shouldRedirect && !isSubscriptionPage && !isSupportPage) {
            const reason = !salonActive ? 'Inactive/Suspended' : 'Plan Required';
            console.log(`[ProtectedRoute] Redirecting to subscription. Reason: ${reason}`);
            return <Navigate to="/admin/subscription" replace />;
        }
    }

    // Feature gating - Disable to show all features as requested
    // if (feature && salon && !salon.features?.[feature]) {
    //     return <Navigate to="/admin/feature-locked" replace />;
    // }

    return <Outlet />;
}
