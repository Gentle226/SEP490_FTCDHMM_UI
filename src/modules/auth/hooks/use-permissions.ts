import { useAuth } from '../contexts/auth.context';

/**
 * Hook to check user permissions
 * @example
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
 * if (hasPermission('Quản lí người dùng:Xem')) { ... }
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.some((permission) => user.permissions?.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.every((permission) => user.permissions?.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || [],
  };
};
