export type UserRole = 'admin' | 'user' | 'partner' | 'guest';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
  permissions?: string[];
}

export interface RouteGuardConfig {
  requireAuth: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

export interface AuthContextType {
  user: AuthUser | null;
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