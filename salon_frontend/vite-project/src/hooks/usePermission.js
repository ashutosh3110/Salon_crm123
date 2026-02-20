import { useAuth } from '../context/AuthContext';
import { MODULE_ACCESS } from '../config/constants';

/**
 * Hook to check if the current user has permission to access a module
 */
export const usePermission = () => {
    const { user } = useAuth();

    const hasAccess = (moduleName) => {
        if (!user || !user.role) return false;
        const allowedRoles = MODULE_ACCESS[moduleName];
        if (!allowedRoles) return false;
        return allowedRoles.includes(user.role);
    };

    const hasRole = (roles) => {
        if (!user || !user.role) return false;
        if (typeof roles === 'string') return user.role === roles;
        return roles.includes(user.role);
    };

    const isSuperAdmin = user?.role === 'superadmin';
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

    return { hasAccess, hasRole, isSuperAdmin, isAdmin, isManager };
};
