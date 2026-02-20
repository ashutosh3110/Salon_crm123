import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MODULE_ACCESS } from '../../config/constants';
import { PageLoader } from '../ui/Spinner';

/**
 * ProtectedRoute - guards routes based on auth and role/module access
 * @param {string} module - module key from MODULE_ACCESS to check permission
 */
const ProtectedRoute = ({ children, module }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check module access if specified
    if (module && user?.role) {
        const allowedRoles = MODULE_ACCESS[module];
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <Navigate to="/app/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
