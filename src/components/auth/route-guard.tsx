'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin, Result, Button } from 'antd';
import {
  LoadingOutlined,
  LockOutlined,
  UserOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, RouteGuardConfig } from '@/types/auth';
import { canAccessRoute, getRedirectUrl } from '@/utils/auth';

interface RouteGuardProps {
  children: React.ReactNode;
  config: RouteGuardConfig;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  config
}) => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkAccess = (): void => {
      if (loading) {
        return; // Still loading auth state
      }

      setIsChecking(false);

      // Check if authentication is required
      if (config.requireAuth && !userProfile) {
        const redirectUrl = `/auth/signin?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
        return;
      }

      // Check role-based access
      if (config.allowedRoles && userProfile && userProfile.role) {
        const hasAccess = config.allowedRoles.includes(userProfile.role as UserRole);

        if (!hasAccess) {
          // Map userProfile to AuthUser type for getRedirectUrl
          const authUser = {
            uid: userProfile.uid,
            email: userProfile.email,
            displayName: userProfile.name || userProfile.firstName || '',
            emailVerified: true, // หรือกำหนดตาม business logic
            photoURL: userProfile.photoURL ?? null,
            role: (userProfile.role ?? 'user') as UserRole
          };
          const fallbackUrl = config.redirectTo || getRedirectUrl(authUser);
          router.push(fallbackUrl);
          return;
        }
      }
    };

    checkAccess();
  }, [user, loading, config, pathname, router]);

  // Show loading while checking auth
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin
          size="large"
          indicator={<LoadingOutlined className="text-4xl" />}
        />
      </div>
    );
  }

  // Show unauthorized if user doesn't have access
  if (config.requireAuth && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="403"
          title="403"
          subTitle="กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้"
          icon={<LockOutlined />}
          extra={
            <Button
              type="primary"
              onClick={() => router.push('/auth/signin')}
              icon={<UserOutlined />}
            >
              เข้าสู่ระบบ
            </Button>
          }
        />
      </div>
    );
  }

  // Show forbidden if user doesn't have required role
  if (config.allowedRoles && userProfile && userProfile.role && !config.allowedRoles.includes(userProfile.role as UserRole)) {
    if (config.fallbackComponent) {
      const FallbackComponent = config.fallbackComponent;
      return <FallbackComponent />;
    }

    // Map userProfile to AuthUser type for getRedirectUrl
    const authUser = {
      uid: userProfile.uid,
      email: userProfile.email,
      displayName: userProfile.name || userProfile.firstName || '',
      emailVerified: true, // หรือกำหนดตาม business logic
      photoURL: userProfile.photoURL ?? null,
      role: (userProfile.role ?? 'user') as UserRole
    };

    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="403"
          title="403"
          subTitle="คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
          icon={<LockOutlined />}
          extra={
            <Button
              type="primary"
              onClick={() => router.push(getRedirectUrl(authUser))}
              icon={<HomeOutlined />}
            >
              กลับหน้าหลัก
            </Button>
          }
        />
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

// HOC for protecting components
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: RouteGuardConfig = { requireAuth: true }
) {
  const AuthProtectedComponent: React.FC<P> = (props) => {
    return (
      <RouteGuard config={config}>
        <WrappedComponent {...props} />
      </RouteGuard>
    );
  };

  AuthProtectedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthProtectedComponent;
}

// HOC for admin-only components
export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return withAuth(WrappedComponent, {
    requireAuth: true,
    allowedRoles: ['admin']
  });
}

// HOC for partner and admin components
export function withPartnerAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return withAuth(WrappedComponent, {
    requireAuth: true,
    allowedRoles: ['admin', 'partner']
  });
}

// HOC for authenticated users (any role)
export function withUserAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return withAuth(WrappedComponent, {
    requireAuth: true,
    allowedRoles: ['admin', 'partner', 'user']
  });
}