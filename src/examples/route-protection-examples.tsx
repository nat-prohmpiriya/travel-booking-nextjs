'use client';

import React from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { 
  RouteGuard, 
  withAuth, 
  withAdminAuth, 
  withPartnerAuth, 
  withUserAuth 
} from '@/components/auth/route-guard';
import { useAuth, useRouteGuard, usePermission } from '@/hooks/useAuth';
import { AuthLoading, Unauthorized, Forbidden } from '@/components/auth/loading-states';

const { Title, Text } = Typography;

// Example 1: Using RouteGuard component directly
export const AdminOnlyPage: React.FC = () => {
  return (
    <RouteGuard 
      config={{
        requireAuth: true,
        allowedRoles: ['admin']
      }}
    >
      <div>
        <Title level={2}>Admin Panel</Title>
        <Text>This content is only visible to administrators.</Text>
      </div>
    </RouteGuard>
  );
};

// Example 2: Using HOC for component protection
const UserProfileComponent: React.FC = () => {
  return (
    <Card>
      <Title level={3}>User Profile</Title>
      <Text>This content requires authentication.</Text>
    </Card>
  );
};

export const ProtectedUserProfile = withAuth(UserProfileComponent, {
  requireAuth: true,
  allowedRoles: ['admin', 'partner', 'user']
});

// Example 3: Admin-only component using HOC
const AdminDashboardComponent: React.FC = () => {
  return (
    <Card>
      <Title level={3}>Admin Dashboard</Title>
      <Text>This content is only visible to admins.</Text>
    </Card>
  );
};

export const AdminDashboard = withAdminAuth(AdminDashboardComponent);

// Example 4: Partner and Admin component
const PartnerPanelComponent: React.FC = () => {
  return (
    <Card>
      <Title level={3}>Partner Panel</Title>
      <Text>This content is visible to partners and admins.</Text>
    </Card>
  );
};

export const PartnerPanel = withPartnerAuth(PartnerPanelComponent);

// Example 5: Using useAuth hook for conditional rendering
export const ConditionalContent: React.FC = () => {
  const { user, hasRole, hasPermission, requireAuth, requireRole } = useAuth();

  const handleAdminAction = (): void => {
    requireRole('admin');
    // This will redirect if user is not admin
    console.log('Admin action executed');
  };

  const handleUserAction = (): void => {
    requireAuth();
    // This will redirect if user is not authenticated
    console.log('User action executed');
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={3}>Conditional Content Example</Title>
        
        {user ? (
          <div>
            <Text>Welcome, {user.displayName || user.email}!</Text>
            <br />
            <Text>Your role: {user.role}</Text>
          </div>
        ) : (
          <Text>Please sign in to see personalized content.</Text>
        )}

        <Space wrap>
          {hasRole('admin') && (
            <Button type="primary" onClick={handleAdminAction}>
              Admin Action
            </Button>
          )}
          
          {hasRole(['admin', 'partner']) && (
            <Button type="default">
              Partner/Admin Action
            </Button>
          )}
          
          {hasPermission('create_booking') && (
            <Button type="default">
              Create Booking
            </Button>
          )}
          
          <Button onClick={handleUserAction}>
            User Action (Requires Auth)
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

// Example 6: Using useRouteGuard hook
export const RouteGuardExample: React.FC = () => {
  const { isAllowed, isLoading, error } = useRouteGuard({
    requireAuth: true,
    allowedRoles: ['admin', 'partner'],
    onUnauthorized: () => {
      console.log('User is not authenticated');
    },
    onForbidden: () => {
      console.log('User does not have required role');
    }
  });

  if (isLoading) {
    return <AuthLoading message="Checking permissions..." />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isAllowed) {
    return <Unauthorized message="You don't have permission to view this content." />;
  }

  return (
    <Card>
      <Title level={3}>Protected Content</Title>
      <Text>This content is only visible to admins and partners.</Text>
    </Card>
  );
};

// Example 7: Using usePermission hook
export const PermissionBasedContent: React.FC = () => {
  const { hasPermission, loading, missingPermissions } = usePermission({
    permissions: ['manage_hotels', 'view_bookings'],
    requireAll: false // Require ANY of the permissions
  });

  if (loading) {
    return <AuthLoading message="Checking permissions..." />;
  }

  if (!hasPermission) {
    return (
      <Forbidden 
        message="You need the following permissions to access this content:"
        title="Insufficient Permissions"
      />
    );
  }

  return (
    <Card>
      <Title level={3}>Hotel Management</Title>
      <Text>You have the required permissions to manage hotels or view bookings.</Text>
    </Card>
  );
};

// Example 8: Page with multiple protection levels
export const MultiLevelProtectionExample: React.FC = () => {
  const { user, hasRole, hasPermission } = useAuth();

  return (
    <RouteGuard config={{ requireAuth: true }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Multi-Level Protection Example</Title>
        
        {/* Always visible to authenticated users */}
        <Card>
          <Title level={4}>User Content</Title>
          <Text>This is visible to all authenticated users.</Text>
          <br />
          <Text>Logged in as: {user?.email}</Text>
        </Card>

        {/* Partner and Admin only */}
        {hasRole(['admin', 'partner']) && (
          <Card>
            <Title level={4}>Partner Content</Title>
            <Text>This is visible to partners and admins only.</Text>
          </Card>
        )}

        {/* Admin only */}
        {hasRole('admin') && (
          <Card>
            <Title level={4}>Admin Content</Title>
            <Text>This is visible to admins only.</Text>
          </Card>
        )}

        {/* Permission-based content */}
        {hasPermission('manage_users') && (
          <Card>
            <Title level={4}>User Management</Title>
            <Text>You have permission to manage users.</Text>
          </Card>
        )}
      </Space>
    </RouteGuard>
  );
};

// Example usage in a page component
export default function ExamplesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={1}>Route Protection Examples</Title>
        
        <ConditionalContent />
        <RouteGuardExample />
        <PermissionBasedContent />
        <MultiLevelProtectionExample />
      </Space>
    </div>
  );
}