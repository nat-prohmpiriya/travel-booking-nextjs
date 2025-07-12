'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthUser, UserRole } from '@/types/auth';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { canAccessRoute, hasRole, hasPermission } from '@/utils/auth';

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  requireAuth: () => void;
  requireRole: (roles: UserRole | UserRole[]) => void;
  canAccess: (pathname?: string, roles?: UserRole[]) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const authContext = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  const checkRole = (roles: UserRole | UserRole[]): boolean => {
    return hasRole(authContext.user, roles);
  };

  const checkPermission = (permission: string): boolean => {
    return hasPermission(authContext.user, permission);
  };

  const requireAuth = (): void => {
    if (!authContext.user && !authContext.loading) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  };

  const requireRole = (roles: UserRole | UserRole[]): void => {
    if (!authContext.user && !authContext.loading) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (authContext.user && !checkRole(roles)) {
      router.push('/unauthorized');
    }
  };

  const canAccess = (path?: string, roles?: UserRole[]): boolean => {
    const targetPath = path || pathname;
    return canAccessRoute(authContext.user, targetPath, roles);
  };

  return {
    user: authContext.user,
    loading: authContext.loading,
    error: authContext.error,
    isAuthenticated: !!authContext.user,
    hasRole: checkRole,
    hasPermission: checkPermission,
    requireAuth,
    requireRole,
    canAccess,
  };
};

interface UseRouteGuardOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}

interface UseRouteGuardReturn {
  isAllowed: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useRouteGuard = (options: UseRouteGuardOptions = {}): UseRouteGuardReturn => {
  const {
    requireAuth = false,
    allowedRoles,
    redirectTo,
    onUnauthorized,
    onForbidden
  } = options;

  const { user, loading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  useEffect(() => {
    if (loading) return;

    // Check authentication requirement
    if (requireAuth && !user) {
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        const signInUrl = redirectTo || `/auth/signin?redirect=${encodeURIComponent(pathname)}`;
        router.push(signInUrl);
      }
      setIsAllowed(false);
      return;
    }

    // Check role requirement
    if (allowedRoles && user) {
      const hasRequiredRole = allowedRoles.includes(user.role);
      
      if (!hasRequiredRole) {
        if (onForbidden) {
          onForbidden();
        } else {
          router.push('/unauthorized');
        }
        setIsAllowed(false);
        return;
      }
    }

    setIsAllowed(true);
  }, [user, loading, requireAuth, allowedRoles, pathname, router, redirectTo, onUnauthorized, onForbidden]);

  return {
    isAllowed: !loading && isAllowed,
    isLoading: loading,
    error,
  };
};

interface UsePermissionOptions {
  permissions: string | string[];
  requireAll?: boolean; // true = require ALL permissions, false = require ANY permission
}

interface UsePermissionReturn {
  hasPermission: boolean;
  loading: boolean;
  missingPermissions: string[];
}

export const usePermission = (options: UsePermissionOptions): UsePermissionReturn => {
  const { permissions, requireAll = false } = options;
  const { user, loading } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (loading || !user) {
      setHasPermission(false);
      return;
    }

    const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
    const userPermissions = user.permissions || [];

    // Admin has all permissions
    if (user.role === 'admin') {
      setHasPermission(true);
      setMissingPermissions([]);
      return;
    }

    const missing: string[] = [];
    let allowed = false;

    if (requireAll) {
      // Require ALL permissions
      allowed = permissionsArray.every(permission => {
        const has = userPermissions.includes(permission);
        if (!has) missing.push(permission);
        return has;
      });
    } else {
      // Require ANY permission
      allowed = permissionsArray.some(permission => {
        const has = userPermissions.includes(permission);
        if (!has) missing.push(permission);
        return has;
      });
    }

    setHasPermission(allowed);
    setMissingPermissions(missing);
  }, [user, loading, permissions, requireAll]);

  return {
    hasPermission,
    loading,
    missingPermissions,
  };
};

export const useAuthRedirect = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const redirectToRole = (): void => {
    if (!user) return;

    switch (user.role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'partner':
        router.push('/partner');
        break;
      case 'user':
        router.push('/profile');
        break;
      default:
        router.push('/');
    }
  };

  const redirectWithFallback = (intendedPath: string): void => {
    if (!user) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(intendedPath)}`);
      return;
    }

    if (canAccessRoute(user, intendedPath)) {
      router.push(intendedPath);
    } else {
      redirectToRole();
    }
  };

  return {
    loading,
    redirectToRole,
    redirectWithFallback,
  };
};