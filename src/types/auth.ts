export type UserRole = 'admin' | 'user' | 'partner' | 'guest';

// Deprecated: AuthUser. Use UserProfile instead.

import { UserProfile } from './user';

export interface RouteGuardConfig {
  requireAuth: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

export interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}