import { usePermission } from '../../hooks/usePermission';

/**
 * Conditionally renders children based on user's permission
 * Usage: <PermissionGate module="finance">...</PermissionGate>
 *        <PermissionGate roles={['superadmin', 'admin']}>...</PermissionGate>
 */
const PermissionGate = ({ children, module, roles, fallback = null }) => {
    const { hasAccess, hasRole } = usePermission();

    if (module && !hasAccess(module)) return fallback;
    if (roles && !hasRole(roles)) return fallback;

    return children;
};

export default PermissionGate;
