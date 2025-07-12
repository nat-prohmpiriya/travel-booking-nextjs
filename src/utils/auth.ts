import { UserRole } from '@/types/auth';
import { UserProfile } from '@/types/user';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseDb } from '@/utils/firebaseInit';

/**
 * Check if user has required role(s)
 */
export const hasRole = (user: UserProfile | null, requiredRoles: UserRole | UserRole[]): boolean => {
  if (!user) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role);
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (user: UserProfile | null, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

/**
 * Get user role from Firestore
 */
export const getUserRole = async (uid: string): Promise<UserRole> => {
  try {
    const userDoc = await getDoc(doc(firebaseDb, 'users', uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || 'user';
    }

    return 'user'; // Default role
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user';
  }
};

/**
 * Get user permissions from Firestore
 */
export const getUserPermissions = async (uid: string): Promise<string[]> => {
  try {
    const userDoc = await getDoc(doc(firebaseDb, 'users', uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.permissions || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
};

/**
 * Role hierarchy checker
 */
export const isRoleHigherOrEqual = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    user: 1,
    partner: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Default permissions by role
 */
export const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  guest: ['view_public'],
  user: ['view_public', 'create_booking', 'view_own_bookings', 'update_profile'],
  partner: ['view_public', 'manage_hotels', 'view_bookings', 'update_profile'],
  admin: ['*'], // All permissions
};

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(
  user: UserProfile | null,
  pathname: string,
  requiredRoles?: UserRole[]
): boolean {
  // Public routes
  const publicRoutes = ['/', '/search', '/hotel', '/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute && !requiredRoles) {
    return true;
  }

  // Require authentication
  if (!user) {
    return false;
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    return hasRole(user, 'admin');
  }

  // Partner routes
  if (pathname.startsWith('/partner')) {
    return hasRole(user, ['admin', 'partner']);
  }

  // User routes (authenticated users only)
  const userRoutes = ['/profile', '/bookings', '/booking'];
  if (userRoutes.some(route => pathname.startsWith(route))) {
    return hasRole(user, ['admin', 'partner', 'user']);
  }

  // Check specific required roles
  if (requiredRoles) {
    return hasRole(user, requiredRoles);
  }

  return true;
}

/**
 * Get redirect URL based on user role
 */
export const getRedirectUrl = (user: UserProfile | null, intendedPath?: string): string => {
  if (!user) {
    return '/auth/signin';
  }

  // If there's an intended path and user can access it, go there
  if (intendedPath && canAccessRoute(user, intendedPath)) {
    return intendedPath;
  }

  // Default redirects by role
  switch (user.role) {
    case 'admin':
      return '/admin';
    case 'partner':
      return '/partner';
    case 'user':
      return '/profile';
    default:
      return '/';
  }
};

/**
 * Set auth cookies for middleware
 */
export const setAuthCookies = (user: UserProfile, token: string): void => {
  if (typeof document !== 'undefined') {
    // Set auth token cookie
    document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;

    // Set user role cookie
    document.cookie = `user-role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
  }
};

/**
 * Clear auth cookies
 */
export const clearAuthCookies = (): void => {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  }
};